from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ImageBase(BaseModel):
    filename: str


class ImageCreate(ImageBase):
    dataset_id: int
    s3_key: str
    thumbnail_key: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None


class ImageResponse(ImageBase):
    id: int
    dataset_id: int
    s3_key: str
    thumbnail_key: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ImageWithAnnotations(ImageResponse):
    annotation_count: int = 0
