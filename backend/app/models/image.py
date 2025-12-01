from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin


class Image(Base, TimestampMixin):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    dataset_id = Column(Integer, ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    s3_key = Column(String, nullable=False)  # Path to original image in S3/MinIO
    thumbnail_key = Column(String, nullable=True)  # Path to thumbnail in S3/MinIO
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)

    # Relationships
    dataset = relationship("Dataset", back_populates="images")
    annotations = relationship("Annotation", back_populates="image", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Image(id={self.id}, filename={self.filename}, dataset_id={self.dataset_id})>"
