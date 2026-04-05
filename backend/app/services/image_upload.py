import io
import os
import re
import uuid
from pathlib import Path
from typing import Optional

from fastapi import HTTPException, UploadFile

MAX_BYTES = 5 * 1024 * 1024
ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}

MEDIA_ROOT = Path(__file__).resolve().parent.parent / "media"


def _normalize_content_type(raw: Optional[str]) -> str:
    if not raw:
        return ""
    return raw.split(";")[0].strip().lower()


async def save_uploaded_image(file: UploadFile) -> str:
    ct = _normalize_content_type(file.content_type)
    if ct not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image type. Use JPEG, PNG, WebP, or GIF.",
        )

    body = await file.read()
    if len(body) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="Image too large (max 5MB).")

    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME", "").strip()
    if cloud_name:
        import cloudinary
        import cloudinary.uploader

        cloudinary.config(
            cloud_name=cloud_name,
            api_key=os.getenv("CLOUDINARY_API_KEY", ""),
            api_secret=os.getenv("CLOUDINARY_API_SECRET", ""),
        )
        result = cloudinary.uploader.upload(
            io.BytesIO(body),
            folder="sales-inventory",
            resource_type="image",
        )
        url = result.get("secure_url") or result.get("url")
        if not url:
            raise HTTPException(status_code=502, detail="Upload provider returned no URL.")
        return url

    MEDIA_ROOT.mkdir(parents=True, exist_ok=True)
    ext = ALLOWED_TYPES[ct]
    name = f"{uuid.uuid4().hex}{ext}"
    dest = MEDIA_ROOT / name
    dest.write_bytes(body)
    return f"/api/uploads/files/{name}"


def is_safe_media_filename(name: str) -> bool:
    return bool(re.fullmatch(r"[0-9a-f]{32}\.(jpg|png|webp|gif)", name, re.I))


def media_file_path(name: str) -> Optional[Path]:
    if not is_safe_media_filename(name):
        return None
    path = (MEDIA_ROOT / name).resolve()
    try:
        path.relative_to(MEDIA_ROOT.resolve())
    except ValueError:
        return None
    return path
