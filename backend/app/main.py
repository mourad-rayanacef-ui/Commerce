from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import sales, inventory, forecast , analytics , charts , products
from .database import SessionLocal
from . import models

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(sales.router)
app.include_router(inventory.router)
app.include_router(forecast.router)
app.include_router(analytics.router)
app.include_router(charts.router)
app.include_router(products.router)
# Seed data
@app.on_event("startup")
def seed_data():
    db = SessionLocal()
    if db.query(models.Product).count() == 0:
        from .utils.data_generator import generate_sample_data
        generate_sample_data(db)
    db.close()

@app.get("/")
def root():
    return {"message": "Sales & Inventory API"}