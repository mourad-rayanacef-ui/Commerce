from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..charts import ChartGenerator

router = APIRouter(prefix="/api/charts", tags=["charts"])

@router.get("/sales-trend")
def get_sales_trend_chart(days: int = 30, db: Session = Depends(get_db)):
    generator = ChartGenerator(db)
    img_base64 = generator.create_sales_trend_chart(days)
    return {"chart": img_base64, "type": "png"}

@router.get("/product-performance")
def get_product_performance_chart(db: Session = Depends(get_db)):
    generator = ChartGenerator(db)
    img_base64 = generator.create_product_performance_chart()
    return {"chart": img_base64, "type": "png"}

@router.get("/inventory-heatmap")
def get_inventory_heatmap(db: Session = Depends(get_db)):
    generator = ChartGenerator(db)
    img_base64 = generator.create_inventory_heatmap()
    return {"chart": img_base64, "type": "png"}

@router.get("/weekly-pattern")
def get_weekly_pattern_chart(db: Session = Depends(get_db)):
    generator = ChartGenerator(db)
    img_base64 = generator.create_weekly_pattern_chart()
    return {"chart": img_base64, "type": "png"}

@router.get("/forecast")
def get_forecast_chart(window: int = 7, db: Session = Depends(get_db)):
    generator = ChartGenerator(db)
    img_base64 = generator.create_forecast_chart(window)
    return {"chart": img_base64, "type": "png"}

@router.get("/profit-margins")
def get_profit_margins_chart(db: Session = Depends(get_db)):
    generator = ChartGenerator(db)
    img_base64 = generator.create_profit_margin_chart()
    return {"chart": img_base64, "type": "png"}

@router.get("/category-radar")
def get_category_radar_chart(db: Session = Depends(get_db)):
    generator = ChartGenerator(db)
    img_base64 = generator.create_category_radar_chart()
    return {"chart": img_base64, "type": "png"}

@router.get("/correlation")
def get_correlation_chart(db: Session = Depends(get_db)):
    generator = ChartGenerator(db)
    img_base64 = generator.create_correlation_heatmap()
    return {"chart": img_base64, "type": "png"}