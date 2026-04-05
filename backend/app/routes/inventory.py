from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from .. import models

router = APIRouter(prefix="/api/inventory", tags=["inventory"])

# When products have no explicit reorder point in DB, derive a simple threshold from current stock.
DEFAULT_REORDER_FLOOR = 5


def _reorder_point_for_product(stock: int) -> int:
    return max(DEFAULT_REORDER_FLOOR, min(100, stock // 2 + 5))


class ReorderRequest(BaseModel):
    product_id: int
    quantity: int


@router.get("/status")
def get_inventory_status(db: Session = Depends(get_db)):
    products = db.query(models.Product).order_by(models.Product.name).all()
    inventory = []
    for p in products:
        current_stock = p.stock
        reorder_point = _reorder_point_for_product(current_stock)
        status = (
            "Critical"
            if current_stock <= reorder_point * 0.5
            else "Low"
            if current_stock <= reorder_point
            else "Healthy"
            if current_stock <= reorder_point * 2
            else "Excess"
        )
        inventory.append(
            {
                "product_id": p.id,
                "product_name": p.name,
                "current_stock": current_stock,
                "reorder_point": reorder_point,
                "status": status,
                "price": float(p.price),
            }
        )
    return inventory


@router.post("/reorder")
def reorder_product(request: ReorderRequest, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == request.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.stock += request.quantity
    db.add(product)
    db.commit()
    db.refresh(product)

    return {"message": "Stock updated", "new_stock": product.stock}
