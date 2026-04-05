from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.routes.auth import get_current_active_user
from app.models import User
from app.services.image_upload import media_file_path, save_uploaded_image

router = APIRouter(prefix="/api/uploads", tags=["uploads"])


class ImageUploadResponse(BaseModel):
    url: str


@router.post("/image", response_model=ImageUploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    _: User = Depends(get_current_active_user),
):
    url = await save_uploaded_image(file)
    return ImageUploadResponse(url=url)


@router.get("/files/{filename}")
def serve_local_upload(filename: str):
    path = media_file_path(filename)
    if path is None or not path.is_file():
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse(path)
