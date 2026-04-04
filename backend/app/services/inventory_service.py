from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Optional
from .. import models

class InventoryService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_inventory_status(self) -> List[Dict]:
        """Get current inventory status for all products"""
        results = self.db.query(
            models.Product.id,
            models.Product.name,
            models.Product.reorder_point,
            models.Inventory.current_stock
        ).join(models.Inventory).all()
        
        inventory_list = []
        for product_id, name, reorder_point, current_stock in results:
            status = "Critical" if current_stock <= reorder_point * 0.5 else \
                     "Low" if current_stock <= reorder_point else \
                     "Healthy" if current_stock <= reorder_point * 2 else "Excess"
            
            inventory_list.append({
                "product_id": product_id,
                "product_name": name,
                "current_stock": current_stock,
                "reorder_point": reorder_point,
                "status": status
            })
        
        return inventory_list
    
    def get_low_stock_items(self) -> List[Dict]:
        """Get products that need reordering"""
        results = self.db.query(
            models.Product.name,
            models.Product.reorder_point,
            models.Inventory.current_stock,
            (models.Product.reorder_point - models.Inventory.current_stock).label('needed')
        ).join(models.Inventory).filter(
            models.Inventory.current_stock < models.Product.reorder_point
        ).all()
        
        return [
            {
                "product": name,
                "current_stock": current,
                "reorder_point": reorder,
                "units_to_order": max(needed + 10, reorder * 2)  # Order reorder point + safety stock
            }
            for name, reorder, current, needed in results
        ]
    
    def reorder_product(self, product_id: int, quantity: int) -> Optional[Dict]:
        """Place a reorder for a product (simulate adding to inventory)"""
        inventory = self.db.query(models.Inventory).filter(
            models.Inventory.product_id == product_id
        ).first()
        
        if not inventory:
            return None
        
        # Simulate reorder arriving
        inventory.current_stock += quantity
        self.db.commit()
        
        return {
            "product_id": product_id,
            "ordered_quantity": quantity,
            "new_stock_level": inventory.current_stock
        }
    
    def update_stock(self, product_id: int, quantity: int) -> Optional[Dict]:
        """Update stock level (e.g., after sale)"""
        inventory = self.db.query(models.Inventory).filter(
            models.Inventory.product_id == product_id
        ).first()
        
        if not inventory:
            return None
        
        inventory.current_stock = max(0, inventory.current_stock + quantity)  # quantity can be negative for sales
        self.db.commit()
        
        return {
            "product_id": product_id,
            "new_stock": inventory.current_stock
        }