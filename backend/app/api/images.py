from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.dataset import Dataset
from app.models.image import Image
from app.schemas.image import ImageResponse, ImageWithAnnotations
from app.services.storage import storage_service
from app.services.image import (
    generate_unique_key,
    get_image_dimensions,
    create_thumbnail,
    validate_image
)
from sqlalchemy import func
from app.models.annotation import Annotation

router = APIRouter()


@router.post("/datasets/{dataset_id}/images", response_model=List[ImageResponse], status_code=status.HTTP_201_CREATED)
async def upload_images(
    dataset_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload one or more images to a dataset."""
    # Verify dataset exists and belongs to user
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id,
        Dataset.user_id == current_user.id
    ).first()

    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )

    uploaded_images = []

    for file in files:
        # Read file data
        file_data = await file.read()

        # Validate image
        if not validate_image(file_data):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid image file: {file.filename}"
            )

        # Generate unique keys
        s3_key = generate_unique_key(file.filename, prefix="images")
        thumbnail_key = generate_unique_key(file.filename, prefix="thumbnails")

        # Get image dimensions
        width, height = get_image_dimensions(file_data)

        # Create thumbnail
        thumbnail_data = create_thumbnail(file_data)
        if not thumbnail_data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create thumbnail for {file.filename}"
            )

        # Upload original image
        if not storage_service.upload_file(file_data, s3_key, file.content_type):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload image: {file.filename}"
            )

        # Upload thumbnail
        if not storage_service.upload_file(thumbnail_data, thumbnail_key, "image/jpeg"):
            # Cleanup: delete the original image
            storage_service.delete_file(s3_key)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload thumbnail for {file.filename}"
            )

        # Save image metadata to database
        image = Image(
            filename=file.filename,
            dataset_id=dataset_id,
            s3_key=s3_key,
            thumbnail_key=thumbnail_key,
            width=width,
            height=height
        )
        db.add(image)
        uploaded_images.append(image)

    db.commit()

    # Refresh all images
    for image in uploaded_images:
        db.refresh(image)

    return uploaded_images


@router.get("/images/{image_id}", response_model=ImageWithAnnotations)
def get_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get image metadata."""
    image = db.query(Image).join(Dataset).filter(
        Image.id == image_id,
        Dataset.user_id == current_user.id
    ).first()

    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )

    # Get annotation count
    annotation_count = db.query(func.count(Annotation.id)).filter(
        Annotation.image_id == image.id
    ).scalar()

    image_dict = ImageResponse.from_orm(image).model_dump()
    image_dict["annotation_count"] = annotation_count or 0

    return ImageWithAnnotations(**image_dict)


@router.delete("/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an image."""
    image = db.query(Image).join(Dataset).filter(
        Image.id == image_id,
        Dataset.user_id == current_user.id
    ).first()

    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )

    # Delete from storage
    storage_service.delete_file(image.s3_key)
    if image.thumbnail_key:
        storage_service.delete_file(image.thumbnail_key)

    # Delete from database (cascades to annotations)
    db.delete(image)
    db.commit()

    return None


@router.get("/images/{image_id}/url")
def get_image_url(
    image_id: int,
    thumbnail: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get presigned URL for image download."""
    image = db.query(Image).join(Dataset).filter(
        Image.id == image_id,
        Dataset.user_id == current_user.id
    ).first()

    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )

    key = image.thumbnail_key if thumbnail else image.s3_key
    url = storage_service.get_presigned_url(key)

    if not url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate download URL"
        )

    return {"url": url}


@router.get("/datasets/{dataset_id}/images", response_model=List[ImageWithAnnotations])
def list_dataset_images(
    dataset_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all images in a dataset."""
    # Verify dataset exists and belongs to user
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id,
        Dataset.user_id == current_user.id
    ).first()

    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )

    images = db.query(Image).filter(Image.dataset_id == dataset_id).offset(skip).limit(limit).all()

    # Add annotation counts
    result = []
    for image in images:
        annotation_count = db.query(func.count(Annotation.id)).filter(
            Annotation.image_id == image.id
        ).scalar()

        image_dict = ImageResponse.from_orm(image).model_dump()
        image_dict["annotation_count"] = annotation_count or 0
        result.append(ImageWithAnnotations(**image_dict))

    return result
