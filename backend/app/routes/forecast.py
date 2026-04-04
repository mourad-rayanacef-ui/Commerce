from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from .. import models
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/forecast", tags=["forecast"])

@router.get("/demand")
def get_forecast(window: int = 7, db: Session = Depends(get_db)):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=60)
    
    results = db.query(
        func.date(models.Sale.sale_date).label('date'),
        func.sum(models.Sale.quantity).label('total')
    ).filter(models.Sale.sale_date >= start_date).group_by('date').order_by('date').all()
    
    quantities = [r[1] for r in results]
    dates = [str(r[0]) for r in results]
    
    if len(quantities) < window:
        return {"error": "Insufficient data"}
    
    # Calculate moving average
    moving_avg = sum(quantities[-window:]) / window
    
    # Forecast next 7 days
    forecast = [round(moving_avg * (0.95 + i * 0.01), 2) for i in range(7)]
    
    last_date = datetime.strptime(dates[-1], '%Y-%m-%d')
    future_dates = [(last_date + timedelta(days=i+1)).strftime('%Y-%m-%d') for i in range(7)]
    
    return {
        "historical_dates": dates[-30:],
        "historical_values": quantities[-30:],
        "forecast_dates": future_dates,
        "forecast_values": forecast,
        "method": f"{window}-day Moving Average"
    }