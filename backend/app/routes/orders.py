from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from ..database import get_db
from .. import models, schemas
from ..auth import get_current_active_user, get_admin_user

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=schemas.OrderResponse)
async def create_order(
    order_data: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
    
    order = models.Order(
        user_id=current_user.id,
        order_number=order_number,
        total_amount=order_data.total_amount,
        status="pending",
        shipping_address=order_data.shipping_address,
        phone_number=order_data.phone_number,
        notes=order_data.notes,
    )
    db.add(order)
    db.flush()
    
    for item_data in order_data.items:
        item = models.OrderItem(
            order_id=order.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            price_at_time=item_data.price_at_time,
        )
        db.add(item)
        
        # Deduct stock
        inv = db.query(models.Inventory).filter(
            models.Inventory.product_id == item_data.product_id
        ).first()
        if inv and inv.current_stock >= item_data.quantity:
            inv.current_stock -= item_data.quantity
        
        # Also update Product.stock_quantity
        product = db.query(models.Product).filter(models.Product.id == item_data.product_id).first()
        if product and product.stock_quantity is not None:
            product.stock_quantity = max(0, (product.stock_quantity or 0) - item_data.quantity)
    
    db.commit()
    db.refresh(order)
    
    # Build response with product names
    response = schemas.OrderResponse.model_validate(order)
    response.items = []
    for item in order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        item_resp = schemas.OrderItemResponse.model_validate(item)
        item_resp.product_name = product.name if product else None
        response.items.append(item_resp)
    
    return response


@router.get("/my-orders", response_model=List[schemas.OrderResponse])
async def get_my_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    orders = db.query(models.Order).filter(
        models.Order.user_id == current_user.id
    ).order_by(models.Order.created_at.desc()).all()
    
    result = []
    for order in orders:
        resp = schemas.OrderResponse.model_validate(order)
        resp.items = []
        for item in order.items:
            product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
            item_resp = schemas.OrderItemResponse.model_validate(item)
            item_resp.product_name = product.name if product else None
            resp.items.append(item_resp)
        result.append(resp)
    return result


@router.get("", response_model=List[schemas.OrderResponse])
async def get_all_orders(
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    orders = db.query(models.Order).order_by(models.Order.created_at.desc()).all()
    
    result = []
    for order in orders:
        resp = schemas.OrderResponse.model_validate(order)
        resp.items = []
        for item in order.items:
            product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
            item_resp = schemas.OrderItemResponse.model_validate(item)
            item_resp.product_name = product.name if product else None
            resp.items.append(item_resp)
        # Add user name
        user = db.query(models.User).filter(models.User.id == order.user_id).first()
        resp.user_name = user.username if user else str(order.user_id)
        result.append(resp)
    return result


@router.get("/{order_id}", response_model=schemas.OrderResponse)
async def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return order


@router.put("/{order_id}/status", response_model=schemas.OrderResponse)
async def update_order_status(
    order_id: int,
    status_update: schemas.OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    valid_statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = status_update.status
    db.commit()
    db.refresh(order)
    return order
