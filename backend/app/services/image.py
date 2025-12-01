from PIL import Image as PILImage
from io import BytesIO
from typing import Tuple, Optional
import uuid

from app.core.config import settings


def generate_unique_key(filename: str, prefix: str = "images") -> str:
    """Generate a unique S3 key for a file."""
    unique_id = str(uuid.uuid4())
    extension = filename.rsplit('.', 1)[-1] if '.' in filename else 'jpg'
    return f"{prefix}/{unique_id}.{extension}"


def get_image_dimensions(image_data: bytes) -> Tuple[int, int]:
    """Get width and height of an image."""
    try:
        image = PILImage.open(BytesIO(image_data))
        return image.size
    except Exception as e:
        print(f"Error getting image dimensions: {e}")
        return (0, 0)


def create_thumbnail(image_data: bytes, size: Tuple[int, int] = None) -> Optional[bytes]:
    """Create a thumbnail from an image."""
    if size is None:
        size = settings.THUMBNAIL_SIZE

    try:
        image = PILImage.open(BytesIO(image_data))

        # Convert RGBA to RGB if necessary
        if image.mode == 'RGBA':
            background = PILImage.new('RGB', image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[3])
            image = background

        # Create thumbnail (maintains aspect ratio)
        image.thumbnail(size, PILImage.Resampling.LANCZOS)

        # Save to bytes
        output = BytesIO()
        image.save(output, format='JPEG', quality=85)
        output.seek(0)
        return output.read()
    except Exception as e:
        print(f"Error creating thumbnail: {e}")
        return None


def validate_image(file_data: bytes, max_size: int = None) -> bool:
    """Validate image file."""
    if max_size is None:
        max_size = settings.MAX_UPLOAD_SIZE

    # Check file size
    if len(file_data) > max_size:
        return False

    # Check if it's a valid image
    try:
        image = PILImage.open(BytesIO(file_data))
        image.verify()
        return True
    except Exception:
        return False
