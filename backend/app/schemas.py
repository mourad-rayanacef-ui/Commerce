from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class ProductBase(BaseModel):
    name: str
    category: str
    price: float
    reorder_point: int

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    
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