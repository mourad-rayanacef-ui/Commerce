from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from .. import models
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/sales", tags=["sales"])

@router.get("/daily")
def get_daily_sales(days: int = 30, db: Session = Depends(get_db)):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    results = db.query(
        func.date(models.Sale.sale_date).label('date'),
        func.sum(models.Sale.total_amount).label('total')
    ).filter(models.Sale.sale_date >= start_date).group_by('date').order_by('date').all()
    
    return {
        "dates": [str(r[0]) for r in results],
        "amounts": [float(r[1]) for r in results]
    }

@router.get("/top-products")
def get_top_products(limit: int = 10, db: Session = Depends(get_db)):
    results = db.query(
        models.Product.name,
        func.sum(models.Sale.quantity).label('quantity'),
        func.sum(models.Sale.total_amount).label('revenue')
    ).join(models.Sale).group_by(models.Product.id).order_by(
        func.sum(models.Sale.total_amount).desc()
    ).limit(limit).all()
    
    return [{"name": r[0], "quantity": r[1], "revenue": float(r[2])} for r in results]