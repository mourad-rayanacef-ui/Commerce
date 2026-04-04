from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from .. import models
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/by-category")
def get_category_analysis(db: Session = Depends(get_db)):
    """Sales by product category"""
    results = db.query(
        models.Product.category,
        func.sum(models.Sale.total_amount).label('total')
    ).join(models.Sale).group_by(models.Product.category).all()
    
    colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a']
    return [
        {"name": r[0] if r[0] else "Uncategorized", "value": float(r[1]), "color": colors[i % len(colors)]}
        for i, r in enumerate(results)
    ]

@router.get("/weekly-trend")
def get_weekly_trend(db: Session = Depends(get_db)):
    """Sales by day of week"""
    from sqlalchemy import extract
    
    results = db.query(
        extract('dow', models.Sale.sale_date).label('day_of_week'),
        func.sum(models.Sale.quantity).label('total_sales')
    ).group_by('day_of_week').all()
    
    days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    trend_dict = {i: 0 for i in range(7)}
    
    for dow, total in results:
        trend_dict[int(dow)] = int(total)
    
    return [{"day": days[i], "sales": trend_dict[i]} for i in range(7)]

@router.get("/profit-margins")
def get_profit_margins(db: Session = Depends(get_db)):
    """Calculate profit margins per product (assuming 40% COGS)"""
    results = db.query(
        models.Product.name,
        func.sum(models.Sale.total_amount).label('revenue')
    ).join(models.Sale).group_by(models.Product.id).all()
    
    profit_margins = []
    for r in results:
        revenue = float(r[1])
        # Assume cost is 60% of revenue (40% margin)
        cost = revenue * 0.6
        margin = ((revenue - cost) / revenue) * 100 if revenue > 0 else 0
        profit_margins.append({"name": r[0], "margin": round(margin, 1)})
    
    return sorted(profit_margins, key=lambda x: x['margin'], reverse=True)

@router.get("/turnover-rates")
def get_turnover_rates(db: Session = Depends(get_db)):
    """Inventory turnover rates"""
    results = db.query(
        models.Product.name,
        func.sum(models.Sale.quantity).label('sold'),
        models.Inventory.current_stock
    ).join(models.Sale).join(models.Inventory).group_by(
        models.Product.id, models.Inventory.current_stock
    ).all()
    
    turnover = []
    for r in results:
        avg_inventory = r[2] / 2 if r[2] > 0 else 1
        rate = (r[1] / avg_inventory) if avg_inventory > 0 else 0
        turnover.append({"name": r[0], "turnover_rate": round(rate, 2)})
    
    return sorted(turnover, key=lambda x: x['turnover_rate'], reverse=True)

@router.get("/abc-analysis")
def get_abc_analysis(db: Session = Depends(get_db)):
    """ABC Analysis based on 80/20 rule"""
    results = db.query(
        models.Product.name,
        func.sum(models.Sale.total_amount).label('revenue')
    ).join(models.Sale).group_by(models.Product.id).order_by(
        func.sum(models.Sale.total_amount).desc()
    ).all()
    
    total_revenue = sum(r[1] for r in results) if results else 1
    cumulative = 0
    abc = {"A": {"count": 0, "revenue": 0}, "B": {"count": 0, "revenue": 0}, "C": {"count": 0, "revenue": 0}}
    
    for r in results:
        revenue = float(r[1])
        cumulative += revenue
        percent = (cumulative / total_revenue) * 100
        
        if percent <= 80:
            abc["A"]["count"] += 1
            abc["A"]["revenue"] += revenue
        elif percent <= 95:
            abc["B"]["count"] += 1
            abc["B"]["revenue"] += revenue
        else:
            abc["C"]["count"] += 1
            abc["C"]["revenue"] += revenue
    
    return abc

@router.get("/sales-velocity")
def get_sales_velocity(db: Session = Depends(get_db)):
    """Units sold per day for each product"""
    results = db.query(
        models.Product.name,
        func.sum(models.Sale.quantity).label('total_sold')
    ).join(models.Sale).group_by(models.Product.id).all()
    
    velocity = []
    for r in results:
        # Assuming 90 days of data
        velocity.append({"name": r[0], "velocity": round(r[1] / 90, 2)})
    
    return sorted(velocity, key=lambda x: x['velocity'], reverse=True)

@router.get("/seasonal-index")
def get_seasonal_index(db: Session = Depends(get_db)):
    """Monthly seasonal demand index"""
    from sqlalchemy import extract
    
    results = db.query(
        extract('month', models.Sale.sale_date).label('month'),
        func.sum(models.Sale.quantity).label('total')
    ).group_by('month').all()
    
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    monthly_sales = [0] * 12
    
    for month, total in results:
        monthly_sales[int(month) - 1] = total
    
    avg_sales = sum(monthly_sales) / 12 if monthly_sales else 1
    seasonal_index = [{"month": months[i], "index": round(monthly_sales[i] / avg_sales, 2)} for i in range(12)]
    
    return seasonal_index

@router.get("/seasonal")
def get_seasonal_data(db: Session = Depends(get_db)):
    """Alias for seasonal-index"""
    return get_seasonal_index(db)

@router.get("/customer-segments")
def get_customer_segments(db: Session = Depends(get_db)):
    """Customer segmentation based on purchase value"""
    results = db.query(
        models.Sale.total_amount
    ).all()
    
    revenues = [r[0] for r in results]
    if not revenues:
        return {"high_value": 0, "medium_value": 0, "low_value": 0}
    
    avg_revenue = sum(revenues) / len(revenues)
    
    return {
        "high_value": len([r for r in revenues if r > avg_revenue * 2]),
        "medium_value": len([r for r in revenues if avg_revenue < r <= avg_revenue * 2]),
        "low_value": len([r for r in revenues if r <= avg_revenue])
    }

@router.get("/price-elasticity")
def get_price_elasticity(db: Session = Depends(get_db)):
    """Simple price elasticity estimation"""
    results = db.query(
        models.Product.name,
        models.Product.price,
        func.sum(models.Sale.quantity).label('total_sold')
    ).join(models.Sale).group_by(models.Product.id).all()
    
    elasticity = []
    for r in results:
        elasticity.append({
            "name": r[0],
            "elasticity": round(1.5 if r[1] > 100 else 0.8, 2),
            "type": "Elastic" if r[1] > 100 else "Inelastic"
        })
    
    return elasticity

@router.get("/inventory-aging")
def get_inventory_aging(db: Session = Depends(get_db)):
    """Days to sell current inventory"""
    results = db.query(
        models.Product.name,
        models.Inventory.current_stock,
        func.sum(models.Sale.quantity).label('total_sold')
    ).join(models.Inventory).join(models.Sale).group_by(
        models.Product.id, models.Inventory.current_stock
    ).all()
    
    aging = []
    for r in results:
        daily_sales = r[2] / 90 if r[2] > 0 else 1
        days_to_sell = r[1] / daily_sales if daily_sales > 0 else 999
        aging.append({
            "name": r[0],
            "days_to_sell": round(days_to_sell, 1),
            "category": "Old" if days_to_sell > 60 else "Normal" if days_to_sell > 30 else "Fresh"
        })
    
    return sorted(aging, key=lambda x: x['days_to_sell'], reverse=True)