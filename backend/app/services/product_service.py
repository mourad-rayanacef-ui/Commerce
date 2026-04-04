# backend/app/services/product_service.py
from sqlalchemy.orm import Session
from app.models import Product
from typing import List

class ProductService:
    @staticmethod
    def get_low_stock_products(threshold: int, db: Session):
        products = db.query(Product).filter(Product.stock <= threshold).all()
        return products
    
    @staticmethod
    def get_products_by_price_range(min_price: float, max_price: float, db: Session):
        products = db.query(Product).filter(
            (Product.price >= min_price) & (Product.price <= max_price)
        ).all()
        return products