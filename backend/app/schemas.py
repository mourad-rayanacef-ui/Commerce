from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class ProductBase(BaseModel):
    name: str
    category: Optional[str] = None
    price: float
    reorder_point: Optional[int] = 10
    description: Optional[str] = None
    image_url: Optional[str] = None
    stock_quantity: Optional[int] = 0
    is_active: Optional[bool] = True

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class SaleBase(BaseModel):
    product_id: int
    quantity: int
    total_amount: float

class SaleCreate(SaleBase):
    pass

class Sale(SaleBase):
    id: int
    sale_date: datetime
    
    class Config:
        from_attributes = True

class InventoryBase(BaseModel):
    product_id: int
    current_stock: int

class Inventory(InventoryBase):
    id: int
    last_updated: datetime
    
    class Config:
        from_attributes = True

class DailySalesResponse(BaseModel):
    dates: List[str]
    amounts: List[float]

class TopProductResponse(BaseModel):
    name: str
    quantity: int
    revenue: float

# ─── Auth ─────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    role: str
    is_active: bool
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# ─── Orders ───────────────────────────────────────────────────────────────────

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    price_at_time: float

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price_at_time: float
    product_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    total_amount: float
    shipping_address: Optional[str] = None
    phone_number: Optional[str] = None
    notes: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    order_number: str
    user_id: int
    total_amount: float
    status: str
    shipping_address: Optional[str] = None
    phone_number: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    items: List[OrderItemResponse] = []
    user_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: str

# ─── Chat ─────────────────────────────────────────────────────────────────────

class ChatMessageCreate(BaseModel):
    receiver_id: int
    message: str

class ChatMessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    message: str
    is_read: bool
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    user_id: int
    username: str
    full_name: Optional[str] = None
    last_message: Optional[str] = None
    unread_count: int = 0