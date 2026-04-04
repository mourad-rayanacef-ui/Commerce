# backend/app/services/order_service.py
from sqlalchemy.orm import Session
from app.models import Order, OrderItem, Product
from typing import List

class OrderService:
    @staticmethod
    def get_order_status(order_id: int, db: Session):
        order = db.query(Order).filter(Order.id == order_id).first()
        return order.status if order else None
    
    @staticmethod
    def update_order_status(order_id: int, new_status: str, db: Session):
        order = db.query(Order).filter(Order.id == order_id).first()
        if order:
            order.status = new_status
            db.add(order)
            db.commit()
            db.refresh(order)
        return order
    
    @staticmethod
    def get_order_items(order_id: int, db: Session):
        items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
        return items