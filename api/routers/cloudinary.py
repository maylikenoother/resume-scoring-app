from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
import cloudinary
import cloudinary.uploader
import cloudinary.api

from api.core.auth import get_current_active_user
from api.core.database import get_db
from api.models.models import User
from api.core.config import settings
from api.utils.cloudinary_utils import upload_file_to_cloudinary

router = APIRouter(
    prefix="/cloudinary",
    tags=["cloudinary"],
    responses={401: {"description": "Unauthorized"}},
)

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

@router.get("/config")
async def get_cloudinary_config():
    """Returns Cloudinary configuration for frontend use (cloud name only)"""
    return {
        "cloud_name": settings.CLOUDINARY_CLOUD_NAME
    }

@router.get("/info")
async def get_resource_info(
    public_id: str = Query(...),
    current_user: User = Depends(get_current_active_user)
):
    """Get information about a Cloudinary resource"""
    try:
        result = cloudinary.api.resource(public_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Resource not found: {str(e)}")

@router.post("/upload")
async def upload_to_cloudinary(
    file: UploadFile = File(...),
    folder: str = "cv_uploads",
    current_user: User = Depends(get_current_active_user)
):
    """Upload a file to Cloudinary"""
    try:
        content = await file.read()
        if isinstance(content, bytes):
            content = content.decode("utf-8", errors="ignore")
            
        result = await upload_file_to_cloudinary(content, file.filename, folder)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")