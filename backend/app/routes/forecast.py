from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from ..database import get_db
from .. import models
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/forecast", tags=["forecast"])


@router.get("/demand")
def get_forecast(window: int = 7, db: Session = Depends(get_db)):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=60)
    day = cast(models.Order.created_at, Date)

    results = (
        db.query(day.label("date"), func.sum(models.OrderItem.quantity).label("total"))
        .join(models.Order, models.OrderItem.order_id == models.Order.id)
        .filter(models.Order.created_at >= start_date)
        .group_by(day)
        .order_by(day)
        .all()
    )

    quantities = [int(r[1] or 0) for r in results]
    dates = [str(r[0]) for r in results]

    if len(quantities) < max(3, min(window, 7)):
        last = end_date.date().isoformat()
        future_dates = [
            (end_date + timedelta(days=i + 1)).date().isoformat() for i in range(7)
        ]
        return {
            "historical_dates": dates[-30:] if dates else [],
            "historical_values": quantities[-30:] if quantities else [],
            "forecast_dates": future_dates,
            "forecast_values": [0.0] * 7,
            "method": "Not enough order history — place more orders to see a forecast",
        }

    w = min(window, len(quantities))
    moving_avg = sum(quantities[-w:]) / w
    forecast = [round(moving_avg * (0.95 + i * 0.01), 2) for i in range(7)]

    last_date = datetime.strptime(dates[-1], "%Y-%m-%d")
    future_dates = [(last_date + timedelta(days=i + 1)).strftime("%Y-%m-%d") for i in range(7)]

    return {
        "historical_dates": dates[-30:],
        "historical_values": quantities[-30:],
        "forecast_dates": future_dates,
        "forecast_values": forecast,
        "method": f"{w}-day moving average (units sold)",
    }
