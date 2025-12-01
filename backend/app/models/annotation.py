from sqlalchemy import Column, Integer, String, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin
import enum


class AnnotationType(str, enum.Enum):
    BBOX = "bbox"
    POLYGON = "polygon"
    POINT = "point"


class Annotation(Base, TimestampMixin):
    __tablename__ = "annotations"

    id = Column(Integer, primary_key=True, index=True)
    image_id = Column(Integer, ForeignKey("images.id", ondelete="CASCADE"), nullable=False)
    label = Column(String, nullable=False, index=True)
    annotation_type = Column(Enum(AnnotationType), nullable=False)
    geometry = Column(JSON, nullable=False)  # Stores coordinates as JSON
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    image = relationship("Image", back_populates="annotations")
    user = relationship("User", backref="annotations")

    def __repr__(self):
        return f"<Annotation(id={self.id}, label={self.label}, type={self.annotation_type})>"
