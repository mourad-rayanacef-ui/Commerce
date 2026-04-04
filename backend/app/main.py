from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routes import auth, products, orders, chat, sales, inventory, forecast, analytics, charts

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="E-Commerce Dashboard API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(chat.router)
app.include_router(sales.router)
app.include_router(inventory.router)
app.include_router(forecast.router)
app.include_router(analytics.router)
app.include_router(charts.router)

@app.get("/")
def read_root():
    return {"message": "E-Commerce Dashboard API", "version": "1.0.0"}