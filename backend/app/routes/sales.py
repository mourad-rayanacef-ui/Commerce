from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from ..database import get_db
from .. import models
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/sales", tags=["sales"])


def _order_day_col():
    """Cross-dialect day bucket for order timestamps."""
    return cast(models.Order.created_at, Date)


@router.get("/daily")
def get_daily_sales(days: int = 30, db: Session = Depends(get_db)):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    day = _order_day_col()

    results = (
        db.query(day.label("date"), func.sum(models.Order.total_amount).label("total"))
        .filter(models.Order.created_at >= start_date)
        .group_by(day)
        .order_by(day)
        .all()
    )

    return {
        "dates": [str(r[0]) for r in results],
        "amounts": [float(r[1] or 0) for r in results],
    }


@router.get("/top-products")
def get_top_products(limit: int = 10, db: Session = Depends(get_db)):
    revenue_expr = func.sum(models.OrderItem.quantity * models.OrderItem.price_at_time)
    results = (
        db.query(
            models.Product.name,
            func.sum(models.OrderItem.quantity).label("quantity"),
            revenue_expr.label("revenue"),
        )
        .join(models.OrderItem, models.Product.id == models.OrderItem.product_id)
        .group_by(models.Product.id, models.Product.name)
        .order_by(revenue_expr.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "name": r[0],
            "quantity": int(r[1] or 0),
            "revenue": float(r[2] or 0),
        }
        for r in results
    ]
