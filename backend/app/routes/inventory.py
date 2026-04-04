from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from .. import models

router = APIRouter(prefix="/api/inventory", tags=["inventory"])

class ReorderRequest(BaseModel):
    product_id: int
    quantity: int

@router.get("/status")
def get_inventory_status(db: Session = Depends(get_db)):
    results = db.query(
        models.Product.id,
        models.Product.name,
        models.Product.reorder_point,
        models.Inventory.current_stock
    ).join(models.Inventory).all()
    
    inventory = []
    for product_id, name, reorder_point, current_stock in results:
        status = "Critical" if current_stock <= reorder_point * 0.5 else \
                 "Low" if current_stock <= reorder_point else \
                 "Healthy" if current_stock <= reorder_point * 2 else "Excess"
        
        inventory.append({
            "product_id": product_id,
            "product_name": name,
            "current_stock": current_stock,
            "reorder_point": reorder_point,
            "status": status
        })
    return inventory

@router.post("/reorder")
def reorder_product(request: ReorderRequest, db: Session = Depends(get_db)):
    inventory = db.query(models.Inventory).filter(
        models.Inventory.product_id == request.product_id
    ).first()
    
    if not inventory:
        raise HTTPException(status_code=404, detail="Product not found")
    
    inventory.current_stock += request.quantity
    db.commit()
    
    return {"message": "Order placed", "new_stock": inventory.current_stock}