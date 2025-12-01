from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class DatasetBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Dataset name")
    description: Optional[str] = Field(None, description="Dataset description")


class DatasetCreate(DatasetBase):
    pass


class DatasetUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None


class DatasetResponse(DatasetBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DatasetWithStats(DatasetResponse):
    image_count: int = 0
    annotation_count: int = 0
