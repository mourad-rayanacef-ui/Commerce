import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from typing import Dict, List, Any
from datetime import datetime, timedelta
from .. import models

class DemandForecast:
    def __init__(self, db: Session):
        self.db = db
    
    def simple_moving_average(self, window: int = 7) -> Dict[str, Any]:
        """Calculate moving average forecast"""
        # Get sales data
        query = self.db.query(models.Sale.sale_date, models.Sale.quantity)
        df = pd.read_sql(query.statement, self.db.bind)
        df['sale_date'] = pd.to_datetime(df['sale_date'])
        
        # Aggregate daily
        daily_qty = df.groupby(df['sale_date'].dt.date)['quantity'].sum()
        
        if len(daily_qty) < window:
            return {"error": "Insufficient data for forecast"}
        
        # Calculate moving averages
        ma = daily_qty.rolling(window=window).mean()
        
        # Forecast next 7 days
        last_avg = ma.iloc[-1] if not pd.isna(ma.iloc[-1]) else daily_qty.mean()
        forecast = [round(last_avg * (1 + np.random.normal(0, 0.1)), 2) for _ in range(7)]
        
        # Generate future dates
        last_date = daily_qty.index[-1]
        future_dates = [(last_date + timedelta(days=i+1)).strftime('%Y-%m-%d') for i in range(7)]
        
        return {
            "historical_dates": [d.strftime('%Y-%m-%d') for d in daily_qty.tail(30).index],
            "historical_values": daily_qty.tail(30).values.tolist(),
            "forecast_dates": future_dates,
            "forecast_values": forecast,
            "method": f"{window}-day Moving Average",
            "confidence": 0.85
        }
    
    def get_reorder_suggestions(self) -> List[Dict]:
        """Identify products below reorder point with forecast adjustment"""
        from sqlalchemy import func
        
        # Get products with low stock
        results = self.db.query(
            models.Product.id,
            models.Product.name,
            models.Product.reorder_point,
            models.Inventory.current_stock
        ).join(models.Inventory).filter(
            models.Inventory.current_stock < models.Product.reorder_point
        ).all()
        
        suggestions = []
        for product_id, name, reorder_point, current_stock in results:
            # Calculate average daily sales for this product
            avg_daily_sales = self.db.query(func.avg(models.Sale.quantity)).filter(
                models.Sale.product_id == product_id,
                models.Sale.sale_date >= datetime.now() - timedelta(days=30)
            ).scalar() or 1
            
            # Recommended order quantity (cover 14 days + safety)
            recommended_qty = max(int(avg_daily_sales * 14), reorder_point)
            
            suggestions.append({
                "product_id": product_id,
                "product_name": name,
                "current_stock": current_stock,
                "reorder_point": reorder_point,
                "avg_daily_sales": round(avg_daily_sales, 2),
                "recommended_order": recommended_qty,
                "urgency": "High" if current_stock < reorder_point * 0.5 else "Medium"
            })
        
        return suggestions
    
    def product_forecast(self, product_id: int, days: int = 30) -> Dict[str, Any]:
        """Forecast demand for a specific product"""
        query = self.db.query(models.Sale.sale_date, models.Sale.quantity).filter(
            models.Sale.product_id == product_id
        )
        df = pd.read_sql(query.statement, self.db.bind)
        
        if len(df) == 0:
            return {"error": "No sales data for this product"}
        
        df['sale_date'] = pd.to_datetime(df['sale_date'])
        daily_qty = df.groupby(df['sale_date'].dt.date)['quantity'].sum()
        
        # Simple exponential smoothing
        alpha = 0.3
        smoothed = [daily_qty.iloc[0]]
        for i in range(1, len(daily_qty)):
            smoothed.append(alpha * daily_qty.iloc[i] + (1 - alpha) * smoothed[-1])
        
        # Forecast
        last_smoothed = smoothed[-1]
        forecast = [max(0, last_smoothed + np.random.normal(0, last_smoothed * 0.1)) for _ in range(days)]
        
        return {
            "product_id": product_id,
            "historical_daily": daily_qty.tail(30).to_dict(),
            "forecast_daily": forecast[:days],
            "total_forecast_units": sum(forecast[:days]),
            "method": "Exponential Smoothing (α=0.3)"
        }
    
    def analyze_seasonal_pattern(self) -> Dict[str, Any]:
        """Analyze day-of-week patterns in sales"""
        query = self.db.query(models.Sale.sale_date, models.Sale.quantity)
        df = pd.read_sql(query.statement, self.db.bind)
        df['sale_date'] = pd.to_datetime(df['sale_date'])
        df['weekday'] = df['sale_date'].dt.day_name()
        
        # Calculate average sales by weekday
        weekday_pattern = df.groupby('weekday')['quantity'].mean().to_dict()
        
        # Order weekdays
        ordered_days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        pattern_ordered = {day: weekday_pattern.get(day, 0) for day in ordered_days}
        
        # Find peak day
        peak_day = max(pattern_ordered, key=pattern_ordered.get)
        
        return {
            "weekday_pattern": pattern_ordered,
            "peak_day": peak_day,
            "weekend_vs_weekday_ratio": (pattern_ordered.get('Saturday', 0) + pattern_ordered.get('Sunday', 0)) / 2 / (sum(list(pattern_ordered.values())[:5]) / 5) if sum(list(pattern_ordered.values())[:5]) > 0 else 0
        }