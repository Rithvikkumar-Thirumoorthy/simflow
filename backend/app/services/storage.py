import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from typing import Optional
import io

from app.core.config import settings


class StorageService:
    """Service for handling file uploads to S3/MinIO."""

    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            endpoint_url=settings.S3_ENDPOINT,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            config=Config(signature_version='s3v4'),
            region_name='us-east-1'
        )
        self.bucket_name = settings.S3_BUCKET
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        """Create bucket if it doesn't exist."""
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
        except ClientError:
            try:
                self.s3_client.create_bucket(Bucket=self.bucket_name)
            except ClientError as e:
                print(f"Error creating bucket: {e}")

    def upload_file(self, file_data: bytes, key: str, content_type: str = "image/jpeg") -> bool:
        """Upload a file to S3/MinIO."""
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=file_data,
                ContentType=content_type
            )
            return True
        except ClientError as e:
            print(f"Error uploading file: {e}")
            return False

    def download_file(self, key: str) -> Optional[bytes]:
        """Download a file from S3/MinIO."""
        try:
            response = self.s3_client.get_object(Bucket=self.bucket_name, Key=key)
            return response['Body'].read()
        except ClientError as e:
            print(f"Error downloading file: {e}")
            return None

    def delete_file(self, key: str) -> bool:
        """Delete a file from S3/MinIO."""
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=key)
            return True
        except ClientError as e:
            print(f"Error deleting file: {e}")
            return False

    def get_presigned_url(self, key: str, expiration: int = 3600) -> Optional[str]:
        """Generate a presigned URL for accessing a file."""
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': key},
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            print(f"Error generating presigned URL: {e}")
            return None


# Singleton instance
storage_service = StorageService()
