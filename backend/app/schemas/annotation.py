from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from app.models.annotation import AnnotationType


class AnnotationBase(BaseModel):
    label: str = Field(..., min_length=1, description="Annotation label/class")
    annotation_type: AnnotationType
    geometry: Dict[str, Any] = Field(..., description="Annotation geometry (coordinates)")


class AnnotationCreate(AnnotationBase):
    image_id: int


class AnnotationUpdate(BaseModel):
    label: Optional[str] = None
    geometry: Optional[Dict[str, Any]] = None


class AnnotationResponse(AnnotationBase):
    id: int
    image_id: int
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
