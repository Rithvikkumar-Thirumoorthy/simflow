from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.dataset import Dataset
from app.models.image import Image
from app.models.annotation import Annotation
from app.schemas.dataset import DatasetCreate, DatasetUpdate, DatasetResponse, DatasetWithStats

router = APIRouter()


@router.get("/", response_model=List[DatasetWithStats])
def list_datasets(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all datasets for the current user."""
    datasets = db.query(Dataset).filter(Dataset.user_id == current_user.id).offset(skip).limit(limit).all()

    # Add statistics to each dataset
    result = []
    for dataset in datasets:
        image_count = db.query(func.count(Image.id)).filter(Image.dataset_id == dataset.id).scalar()
        annotation_count = db.query(func.count(Annotation.id)).join(Image).filter(
            Image.dataset_id == dataset.id
        ).scalar()

        dataset_dict = DatasetResponse.from_orm(dataset).model_dump()
        dataset_dict["image_count"] = image_count or 0
        dataset_dict["annotation_count"] = annotation_count or 0
        result.append(DatasetWithStats(**dataset_dict))

    return result


@router.post("/", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
def create_dataset(
    dataset_data: DatasetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new dataset."""
    dataset = Dataset(
        name=dataset_data.name,
        description=dataset_data.description,
        user_id=current_user.id
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)
    return dataset


@router.get("/{dataset_id}", response_model=DatasetWithStats)
def get_dataset(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific dataset."""
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id,
        Dataset.user_id == current_user.id
    ).first()

    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )

    # Get statistics
    image_count = db.query(func.count(Image.id)).filter(Image.dataset_id == dataset.id).scalar()
    annotation_count = db.query(func.count(Annotation.id)).join(Image).filter(
        Image.dataset_id == dataset.id
    ).scalar()

    dataset_dict = DatasetResponse.from_orm(dataset).model_dump()
    dataset_dict["image_count"] = image_count or 0
    dataset_dict["annotation_count"] = annotation_count or 0

    return DatasetWithStats(**dataset_dict)


@router.put("/{dataset_id}", response_model=DatasetResponse)
def update_dataset(
    dataset_id: int,
    dataset_data: DatasetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a dataset."""
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id,
        Dataset.user_id == current_user.id
    ).first()

    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )

    # Update fields
    update_data = dataset_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(dataset, field, value)

    db.commit()
    db.refresh(dataset)
    return dataset


@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dataset(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a dataset."""
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id,
        Dataset.user_id == current_user.id
    ).first()

    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )

    db.delete(dataset)
    db.commit()
    return None


@router.get("/{dataset_id}/stats", response_model=dict)
def get_dataset_stats(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed statistics for a dataset."""
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id,
        Dataset.user_id == current_user.id
    ).first()

    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )

    # Get statistics
    image_count = db.query(func.count(Image.id)).filter(Image.dataset_id == dataset.id).scalar()
    annotation_count = db.query(func.count(Annotation.id)).join(Image).filter(
        Image.dataset_id == dataset.id
    ).scalar()

    # Get label distribution
    label_distribution = db.query(
        Annotation.label,
        func.count(Annotation.id).label('count')
    ).join(Image).filter(
        Image.dataset_id == dataset.id
    ).group_by(Annotation.label).all()

    return {
        "dataset_id": dataset.id,
        "image_count": image_count or 0,
        "annotation_count": annotation_count or 0,
        "label_distribution": {label: count for label, count in label_distribution}
    }
