# backend/app/schemas.py
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime

# Authentication Schemas
class UserCreate(BaseModel):
    email: str
    username: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    role: str
    is_active: bool
    avatar_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

    @field_validator("avatar_url", mode="before")
    @classmethod
    def empty_avatar_to_none(cls, v):
        return None if v == "" else v

# Product Schemas
class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    image_url: Optional[str] = None

    @field_validator("image_url")
    @classmethod
    def validate_product_image_url(cls, v: Optional[str]) -> Optional[str]:
        if v is None or (isinstance(v, str) and not v.strip()):
            return None
        u = v.strip()
        if len(u) > 2048:
            raise ValueError("image_url is too long")
        if not (
            u.startswith("https://")
            or u.startswith("http://")
            or u.startswith("/api/uploads/files/")
        ):
            raise ValueError("image_url must be http(s) or an uploaded file path")
        return u


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None

    @field_validator("image_url")
    @classmethod
    def validate_product_image_url_update(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        if isinstance(v, str) and not v.strip():
            return None
        u = v.strip()
        if len(u) > 2048:
            raise ValueError("image_url is too long")
        if not (
            u.startswith("https://")
            or u.startswith("http://")
            or u.startswith("/api/uploads/files/")
        ):
            raise ValueError("image_url must be http(s) or an uploaded file path")
        return u


class ProductResponse(BaseModel):
    id: int
    name: str
    description: str
    price: float
    stock: int
    image_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

    @field_validator("image_url", mode="before")
    @classmethod
    def empty_product_image_to_none(cls, v):
        return None if v == "" else v

# Order Schemas
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    shipping_address: str
    phone_number: str
    notes: Optional[str] = None
    image_urls: List[str] = Field(default_factory=list)

    @field_validator("image_urls")
    @classmethod
    def validate_order_images(cls, v: List[str]) -> List[str]:
        if len(v) > 5:
            raise ValueError("At most 5 images per order")
        for u in v:
            if not u or len(u) > 2048:
                raise ValueError("Invalid image URL")
            ok = (
                u.startswith("https://")
                or u.startswith("http://")
                or u.startswith("/api/uploads/files/")
            )
            if not ok:
                raise ValueError("Image URLs must be http(s) or uploaded file paths")
        return v


class OrderResponse(BaseModel):
    id: int
    order_number: str
    total_amount: float
    status: str
    shipping_address: str
    phone_number: str
    created_at: datetime
    image_urls: List[str] = Field(default_factory=list)

    class Config:
        from_attributes = True

    @field_validator("image_urls", mode="before")
    @classmethod
    def none_images_to_list(cls, v):
        return [] if v is None else v


class OrderAdminResponse(BaseModel):
    id: int
    user_id: int
    order_number: str
    total_amount: float
    status: str
    shipping_address: str
    phone_number: str
    notes: Optional[str] = None
    created_at: datetime
    customer_username: str
    customer_email: str
    customer_full_name: str = ""
    image_urls: List[str] = Field(default_factory=list)

    class Config:
        from_attributes = True

    @field_validator("image_urls", mode="before")
    @classmethod
    def none_admin_images_to_list(cls, v):
        return [] if v is None else v


class OrderAdminLineItem(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    price_at_time: float
    line_total: float


class OrderAdminDetailResponse(OrderAdminResponse):
    items: List[OrderAdminLineItem] = Field(default_factory=list)

    class Config:
        from_attributes = True


# Chat Schemas
class ChatMessageCreate(BaseModel):
    receiver_id: int
    message: str

class ChatMessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    message: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class ChatContactResponse(BaseModel):
    id: int
    username: str
    full_name: str
    role: str

    class Config:
        from_attributes = True