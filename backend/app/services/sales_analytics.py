import pandas as pd
from sqlalchemy.orm import Session
from .. import models

class SalesAnalytics:
    def __init__(self, db: Session):
        self.db = db
    
    def get_daily_sales(self, days: int = 30):
        """Return daily sales aggregated as pandas DataFrame"""
        query = self.db.query(
            models.Sale.sale_date,
            models.Sale.total_amount,
            models.Product.name
        ).join(models.Product)
        
        df = pd.read_sql(query.statement, self.db.bind)
        df['sale_date'] = pd.to_datetime(df['sale_date'])
        daily_totals = df.groupby(df['sale_date'].dt.date)['total_amount'].sum()
        return daily_totals
    
    def get_top_products(self, limit: int = 10):
        """Return top selling products"""
        from sqlalchemy import func
        
        results = self.db.query(
            models.Product.name,
            func.sum(models.Sale.quantity).label('total_quantity'),
            func.sum(models.Sale.total_amount).label('revenue')
        ).join(models.Sale).group_by(models.Product.id).order_by(
            func.sum(models.Sale.total_amount).desc()
        ).limit(limit).all()
        
        return [{"name": r[0], "quantity": r[1], "revenue": r[2]} for r in results]