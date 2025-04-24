import cloudinary
import cloudinary.uploader
import logging
from pathlib import Path
from typing import Dict, Any, Optional
import os

from api.core.config import settings

logger = logging.getLogger(__name__)

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

async def upload_file_to_cloudinary(file_content: str, filename: str, folder: str = "cv_uploads") -> Dict[str, Any]:
    """
    Upload a file to Cloudinary
    
    Args:
        file_content: The content of the file as string
        filename: The original filename
        folder: The folder to store the file in Cloudinary (defaults to 'cv_uploads')
        
    Returns:
        Dictionary with upload info including 'secure_url' for the uploaded file
    """
    try:
        temp_dir = Path("temp")
        temp_dir.mkdir(exist_ok=True)
        
        temp_file_path = os.path.join(temp_dir, filename)    

        with open(temp_file_path, "w") as f:
            f.write(file_content)
            
        logger.info(f"Uploading {filename} to Cloudinary in folder {folder}")
        result = cloudinary.uploader.upload(
            temp_file_path,
            folder=folder,
            resource_type="auto",
            use_filename=True,
            unique_filename=True,
        )
        
        os.remove(temp_file_path)
        
        logger.info(f"Successfully uploaded {filename} to Cloudinary. URL: {result['secure_url']}")
        return result
    except Exception as e:
        logger.exception(f"Error uploading to Cloudinary: {e}")
        raise
        
async def delete_file_from_cloudinary(public_id: str) -> Dict[str, Any]:
    """
    Delete a file from Cloudinary
    
    Args:
        public_id: The public ID of the file to delete
        
    Returns:
        Dictionary with deletion info
    """
    try:
        logger.info(f"Deleting file with public_id {public_id} from Cloudinary")
        result = cloudinary.uploader.destroy(public_id)
        logger.info(f"Deletion result: {result}")
        return result
    except Exception as e:
        logger.exception(f"Error deleting from Cloudinary: {e}")
        raise