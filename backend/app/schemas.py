# backend/app/schemas.py
from pydantic import BaseModel
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
    created_at: datetime
    
    class Config:
        from_attributes = True

# Product Schemas
class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    stock: int

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None

class ProductResponse(BaseModel):
    id: int
    name: str
    description: str
    price: float
    stock: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Order Schemas
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    shipping_address: str
    phone_number: str
    notes: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    order_number: str
    total_amount: float
    status: str
    shipping_address: str
    phone_number: str
    created_at: datetime
    
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