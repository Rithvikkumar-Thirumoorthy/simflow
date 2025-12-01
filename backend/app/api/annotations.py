from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.dataset import Dataset
from app.models.image import Image
from app.models.annotation import Annotation
from app.schemas.annotation import AnnotationCreate, AnnotationUpdate, AnnotationResponse

router = APIRouter()


@router.get("/images/{image_id}/annotations", response_model=List[AnnotationResponse])
def list_annotations(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all annotations for an image."""
    # Verify image exists and user has access
    image = db.query(Image).join(Dataset).filter(
        Image.id == image_id,
        Dataset.user_id == current_user.id
    ).first()

    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )

    annotations = db.query(Annotation).filter(Annotation.image_id == image_id).all()
    return annotations


@router.post("/annotations", response_model=AnnotationResponse, status_code=status.HTTP_201_CREATED)
def create_annotation(
    annotation_data: AnnotationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new annotation."""
    # Verify image exists and user has access
    image = db.query(Image).join(Dataset).filter(
        Image.id == annotation_data.image_id,
        Dataset.user_id == current_user.id
    ).first()

    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )

    annotation = Annotation(
        image_id=annotation_data.image_id,
        label=annotation_data.label,
        annotation_type=annotation_data.annotation_type,
        geometry=annotation_data.geometry,
        created_by=current_user.id
    )
    db.add(annotation)
    db.commit()
    db.refresh(annotation)

    return annotation


@router.get("/annotations/{annotation_id}", response_model=AnnotationResponse)
def get_annotation(
    annotation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific annotation."""
    annotation = db.query(Annotation).join(Image).join(Dataset).filter(
        Annotation.id == annotation_id,
        Dataset.user_id == current_user.id
    ).first()

    if not annotation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Annotation not found"
        )

    return annotation


@router.put("/annotations/{annotation_id}", response_model=AnnotationResponse)
def update_annotation(
    annotation_id: int,
    annotation_data: AnnotationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an annotation."""
    annotation = db.query(Annotation).join(Image).join(Dataset).filter(
        Annotation.id == annotation_id,
        Dataset.user_id == current_user.id
    ).first()

    if not annotation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Annotation not found"
        )

    # Update fields
    update_data = annotation_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(annotation, field, value)

    db.commit()
    db.refresh(annotation)

    return annotation


@router.delete("/annotations/{annotation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_annotation(
    annotation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an annotation."""
    annotation = db.query(Annotation).join(Image).join(Dataset).filter(
        Annotation.id == annotation_id,
        Dataset.user_id == current_user.id
    ).first()

    if not annotation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Annotation not found"
        )

    db.delete(annotation)
    db.commit()

    return None
