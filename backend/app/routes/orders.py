# backend/app/routes/orders.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models import Order, OrderItem, Product, User
from app.routes.auth import get_current_active_user, require_admin
from app.schemas import (
    OrderCreate,
    OrderResponse,
    OrderAdminResponse,
    OrderAdminDetailResponse,
    OrderAdminLineItem,
    OrderStatusUpdate,
)
from typing import List
import random
import string

router = APIRouter(prefix="/api/orders", tags=["orders"])

VALID_STATUSES = {"pending", "paid", "processing", "shipped", "completed", "cancelled"}


def generate_order_number():
    return "ORD-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))


# ─────────────────────────────────────────────
# Customer endpoints
# ─────────────────────────────────────────────

@router.post("", response_model=OrderResponse)
def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    total_amount = 0
    items = []

    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")

        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product.name}' "
                       f"(requested {item.quantity}, available {product.stock})",
            )

        total_amount += product.price * item.quantity
        product.stock -= item.quantity
        db.add(product)

        items.append(
            OrderItem(
                product_id=item.product_id,
                quantity=item.quantity,
                price_at_time=product.price,
            )
        )

    imgs = list(order.image_urls or [])[:5]
    new_order = Order(
        user_id=current_user.id,
        order_number=generate_order_number(),
        total_amount=total_amount,
        shipping_address=order.shipping_address,
        phone_number=order.phone_number,
        notes=order.notes,
        image_urls=imgs if imgs else None,
        status="pending",
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
def get_user_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    orders = (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return orders


@router.get("/my-orders/{order_id}", response_model=OrderResponse)
def get_user_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id, Order.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


# ─────────────────────────────────────────────
# Admin endpoints
# NOTE: all /admin/* routes MUST come before /{order_id}
# otherwise FastAPI treats "admin" as an integer and returns 422/404
# ─────────────────────────────────────────────

def _admin_order_to_base(o: Order) -> dict:
    return {
        "id": o.id,
        "user_id": o.user_id,
        "order_number": o.order_number,
        "total_amount": o.total_amount,
        "status": o.status,
        "shipping_address": o.shipping_address,
        "phone_number": o.phone_number,
        "notes": o.notes,
        "created_at": o.created_at,
        "customer_username": o.user.username if o.user else "",
        "customer_email": o.user.email if o.user else "",
        "customer_full_name": (o.user.full_name if o.user else "") or "",
        "image_urls": o.image_urls if o.image_urls is not None else [],
    }


@router.get("/admin/all", response_model=List[OrderAdminResponse])
def admin_list_orders(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
    limit: int = Query(100, ge=1, le=500),
    status: str = Query(None, description="Filter by status"),
):
    query = db.query(Order).options(joinedload(Order.user))
    if status:
        if status not in VALID_STATUSES:
            raise HTTPException(status_code=400, detail=f"Invalid status filter: {status}")
        query = query.filter(Order.status == status)
    orders = query.order_by(Order.created_at.desc()).limit(limit).all()
    return [OrderAdminResponse(**_admin_order_to_base(o)) for o in orders]


@router.get("/admin/order/{order_id}", response_model=OrderAdminDetailResponse)
def admin_get_order(
    order_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    o = (
        db.query(Order)
        .options(
            joinedload(Order.user),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .filter(Order.id == order_id)
        .first()
    )
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")

    items = [
        OrderAdminLineItem(
            product_id=line.product_id,
            product_name=line.product.name if line.product else f"Product #{line.product_id}",
            quantity=line.quantity,
            price_at_time=float(line.price_at_time),
            line_total=float(line.quantity * line.price_at_time),
        )
        for line in o.items
    ]
    return OrderAdminDetailResponse(**_admin_order_to_base(o), items=items)


@router.patch("/admin/order/{order_id}/status", response_model=OrderResponse)
def admin_update_order_status(
    order_id: int,
    body: OrderStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """
    Update order status.
    Automatically restocks inventory if the order is cancelled
    (only when it hasn't already shipped or completed).
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Restock on cancellation — only if not already fulfilled
    if body.status == "cancelled" and order.status not in ("cancelled", "completed", "shipped"):
        line_items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
        for line in line_items:
            product = db.query(Product).filter(Product.id == line.product_id).first()
            if product:
                product.stock += line.quantity
                db.add(product)

    order.status = body.status
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


# ─────────────────────────────────────────────
# IMPORTANT: this catch-all /{order_id} route
# must stay LAST — any named route above would
# otherwise be matched as an integer segment
# ─────────────────────────────────────────────

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id, Order.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order