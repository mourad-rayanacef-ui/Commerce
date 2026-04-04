from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from .. import models, schemas
from ..auth import get_current_active_user, get_admin_user

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=List[schemas.Product])
async def get_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Product).filter(models.Product.is_active == True)
    if search:
        query = query.filter(models.Product.name.ilike(f"%{search}%"))
    if category:
        query = query.filter(models.Product.category == category)
    return query.all()


@router.get("/{product_id}", response_model=schemas.Product)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("", response_model=schemas.Product)
async def create_product(
    product_data: schemas.ProductCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    product = models.Product(**product_data.model_dump())
    db.add(product)
    db.flush()
    inv = models.Inventory(product_id=product.id, current_stock=product.stock_quantity or 0)
    db.add(inv)
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=schemas.Product)
async def update_product(
    product_id: int,
    product_data: schemas.ProductCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in product_data.model_dump(exclude_unset=True).items():
        setattr(product, key, value)
    
    inv = db.query(models.Inventory).filter(models.Inventory.product_id == product_id).first()
    if inv and product_data.stock_quantity is not None:
        inv.current_stock = product_data.stock_quantity
    
    db.commit()
    db.refresh(product)
    return product