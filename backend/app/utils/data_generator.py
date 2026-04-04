import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .. import models

def generate_sample_data(db: Session):
    """Generate realistic sample data"""
    
    # Products
    products_data = [
        {"name": "Gaming Laptop", "category": "Electronics", "price": 1299.99, "reorder_point": 10},
        {"name": "Wireless Mouse", "category": "Electronics", "price": 49.99, "reorder_point": 50},
        {"name": "Mechanical Keyboard", "category": "Electronics", "price": 129.99, "reorder_point": 30},
        {"name": "Office Chair", "category": "Furniture", "price": 299.99, "reorder_point": 8},
        {"name": "Standing Desk", "category": "Furniture", "price": 499.99, "reorder_point": 5},
        {"name": "Notebook", "category": "Stationery", "price": 4.99, "reorder_point": 100},
        {"name": "Pen Set", "category": "Stationery", "price": 19.99, "reorder_point": 75},
        {"name": "Monitor 27inch", "category": "Electronics", "price": 349.99, "reorder_point": 15},
    ]
    
    products = []
    for p in products_data:
        product = models.Product(**p)
        db.add(product)
        db.flush()
        products.append(product)
    
    # Generate sales for last 90 days
    end_date = datetime.now()
    start_date = end_date - timedelta(days=90)
    
    sales = []
    current_date = start_date
    while current_date <= end_date:
        for product in products:
            # More sales on weekends
            is_weekend = current_date.weekday() >= 5
            base_quantity = random.randint(1, 5) if is_weekend else random.randint(0, 3)
            
            if base_quantity > 0:
                sale = models.Sale(
                    product_id=product.id,
                    quantity=base_quantity,
                    total_amount=base_quantity * product.price,
                    sale_date=current_date
                )
                sales.append(sale)
        current_date += timedelta(days=1)
    
    db.add_all(sales)
    
    # Initialize inventory
    for product in products:
        inventory = models.Inventory(
            product_id=product.id,
            current_stock=random.randint(20, 100)
        )
        db.add(inventory)
    
    db.commit()
    print(f"Generated {len(products)} products, {len(sales)} sales records")