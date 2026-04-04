# backend/app/routes/orders.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Order, OrderItem, Product, User
from app.schemas import OrderCreate, OrderResponse
from typing import List
import random
import string

router = APIRouter(prefix="/api/orders", tags=["orders"])

def generate_order_number():
    return "ORD-" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

@router.post("", response_model=OrderResponse)
def create_order(order: OrderCreate, user_id: int, db: Session = Depends(get_db)):
    total_amount = 0
    items = []
    
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")
        
        price = product.price * item.quantity
        total_amount += price
        
        # Deduct from inventory
        product.stock -= item.quantity
        db.add(product)
        
        order_item = OrderItem(
            product_id=item.product_id,
            quantity=item.quantity,
            price_at_time=product.price
        )
        items.append(order_item)
    
    new_order = Order(
        user_id=user_id,
        order_number=generate_order_number(),
        total_amount=total_amount,
        shipping_address=order.shipping_address,
        phone_number=order.phone_number,
        notes=order.notes
    )
    
    db.add(new_order)
    db.flush()
    
    for item in items:
        item.order_id = new_order.id
        db.add(item)
    
    db.commit()
    db.refresh(new_order)
    return new_order

@router.get("/my-orders", response_model=List[OrderResponse])
def get_user_orders(user_id: int, db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.user_id == user_id).all()
    return orders

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order