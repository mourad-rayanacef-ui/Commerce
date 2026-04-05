import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import Base, engine, SessionLocal
from app.routes import auth, products, orders, chat, sales, inventory, forecast, analytics, charts, uploads
from app.models import User


def ensure_image_columns():
    """Add columns on existing PostgreSQL databases (create_all does not alter tables)."""
    stmts = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(2048)",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS image_urls JSONB",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url VARCHAR(2048)",
    ]
    try:
        with engine.begin() as conn:
            for sql in stmts:
                conn.execute(text(sql))
    except Exception:
        pass


# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="E-Commerce Dashboard API", version="1.0.0")


@app.on_event("startup")
def on_startup():
    ensure_image_columns()
    username = os.getenv("ADMIN_BOOTSTRAP_USERNAME", "").strip()
    if not username:
        return
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if user and user.role != "admin":
            user.role = "admin"
            db.commit()
    finally:
        db.close()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(chat.router)
app.include_router(sales.router)
app.include_router(inventory.router)
app.include_router(forecast.router)
app.include_router(analytics.router)
app.include_router(charts.router)
app.include_router(uploads.router)

@app.get("/")
def read_root():
    return {"message": "E-Commerce Dashboard API", "version": "1.0.0"}