from .sales import router as sales_router
from .inventory import router as inventory_router
from .forecast import router as forecast_router

__all__ = ["sales_router", "inventory_router", "forecast_router"]