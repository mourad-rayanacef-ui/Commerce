import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import io
import base64
from sqlalchemy.orm import Session
from . import models
from datetime import datetime, timedelta
import pandas as pd

class ChartGenerator:
    def __init__(self, db: Session):
        self.db = db
        # Set style for professional look
        plt.style.use('seaborn-v0_8-darkgrid')
        sns.set_palette("husl")
        
    def _fig_to_base64(self, fig):
        """Convert matplotlib figure to base64 string for web display"""
        buf = io.BytesIO()
        fig.savefig(buf, format='png', dpi=100, bbox_inches='tight')
        buf.seek(0)
        img_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        plt.close(fig)
        return img_base64
    
    def create_sales_trend_chart(self, days=30):
        """Analysis 1: Interactive sales trend with matplotlib"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        results = self.db.query(
            self.db.query(models.Sale.sale_date,
            func.sum(models.Sale.total_amount).label('total'))
        ).filter(models.Sale.sale_date >= start_date).group_by(
            models.Sale.sale_date).order_by(models.Sale.sale_date).all()
        
        dates = [r[0] for r in results]
        amounts = [float(r[1]) for r in results]
        
        fig, ax = plt.subplots(figsize=(12, 6))
        
        # Create area chart with gradient effect
        ax.fill_between(range(len(dates)), amounts, alpha=0.3, color='#2E86AB', label='Sales Area')
        ax.plot(range(len(dates)), amounts, marker='o', linewidth=2, color='#A23B72', 
               markersize=6, markerfacecolor='white', markeredgewidth=2, label='Daily Sales')
        
        # Add trend line
        z = np.polyfit(range(len(amounts)), amounts, 1)
        p = np.poly1d(z)
        ax.plot(range(len(amounts)), p(range(len(amounts))), "r--", alpha=0.8, 
               linewidth=2, label=f'Trend Line (slope: {z[0]:.2f})')
        
        # Customize
        ax.set_xlabel('Date', fontsize=12, fontweight='bold')
        ax.set_ylabel('Revenue ($)', fontsize=12, fontweight='bold')
        ax.set_title(f'Sales Trend Analysis - Last {days} Days', fontsize=16, fontweight='bold', pad=20)
        ax.set_xticks(range(0, len(dates), max(1, len(dates)//10)))
        ax.set_xticklabels([d.strftime('%m/%d') for d in dates[::max(1, len(dates)//10)]], rotation=45)
        ax.legend(loc='upper left', framealpha=0.9)
        ax.grid(True, alpha=0.3, linestyle='--')
        
        # Add annotation for highest sale
        max_idx = amounts.index(max(amounts))
        ax.annotate(f'Highest: ${max(amounts):,.0f}', 
                   xy=(max_idx, amounts[max_idx]),
                   xytext=(max_idx + 2, amounts[max_idx] + 100),
                   arrowprops=dict(arrowstyle='->', color='green', lw=1.5),
                   fontsize=10, fontweight='bold', color='green')
        
        return self._fig_to_base64(fig)
    
    def create_product_performance_chart(self):
        """Analysis 2: Product performance horizontal bar chart"""
        results = self.db.query(
            models.Product.name,
            func.sum(models.Sale.quantity).label('quantity'),
            func.sum(models.Sale.total_amount).label('revenue')
        ).join(models.Sale).group_by(models.Product.id).order_by(
            func.sum(models.Sale.total_amount).desc()).limit(8).all()
        
        names = [r[0] for r in results]
        revenues = [float(r[2]) for r in results]
        quantities = [int(r[1]) for r in results]
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
        
        # Horizontal bar chart for revenue
        bars1 = ax1.barh(names, revenues, color='#2E86AB', edgecolor='white', linewidth=2)
        ax1.set_xlabel('Revenue ($)', fontsize=11, fontweight='bold')
        ax1.set_title('Top Products by Revenue', fontsize=14, fontweight='bold', pad=15)
        
        # Add value labels
        for i, (bar, revenue) in enumerate(zip(bars1, revenues)):
            ax1.text(revenue + 100, bar.get_y() + bar.get_height()/2, 
                    f'${revenue:,.0f}', va='center', fontsize=9, fontweight='bold')
        
        # Donut chart for quantity distribution
        colors = sns.color_palette('husl', len(names))
        wedges, texts, autotexts = ax2.pie(quantities, labels=names, autopct='%1.1f%%',
                                            colors=colors, startangle=90)
        ax2.set_title('Sales Volume Distribution', fontsize=14, fontweight='bold', pad=15)
        
        # Style the donut chart
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontweight('bold')
            autotext.set_fontsize(10)
        
        centre_circle = plt.Circle((0,0), 0.70, fc='white')
        ax2.add_artist(centre_circle)
        
        plt.tight_layout()
        return self._fig_to_base64(fig)
    
    def create_inventory_heatmap(self):
        """Analysis 3: Inventory health heatmap"""
        results = self.db.query(
            models.Product.name,
            models.Inventory.current_stock,
            models.Product.reorder_point
        ).join(models.Inventory).all()
        
        names = [r[0] for r in results]
        stock_ratio = [(r[1] / r[2]) if r[2] > 0 else 0 for r in results]
        
        fig, ax = plt.subplots(figsize=(12, 6))
        
        # Create heatmap data
        heatmap_data = np.array(stock_ratio).reshape(1, -1)
        
        im = ax.imshow(heatmap_data, cmap='RdYlGn_r', aspect='auto', vmin=0, vmax=2)
        
        # Customize
        ax.set_xticks(range(len(names)))
        ax.set_xticklabels(names, rotation=45, ha='right', fontsize=10)
        ax.set_yticks([0])
        ax.set_yticklabels(['Stock Health Ratio'], fontsize=12, fontweight='bold')
        ax.set_title('Inventory Health Heatmap\n(Green=Healthy, Red=Critical)', 
                    fontsize=14, fontweight='bold', pad=20)
        
        # Add colorbar
        cbar = plt.colorbar(im, ax=ax)
        cbar.set_label('Stock / Reorder Point Ratio', fontsize=11, fontweight='bold')
        
        # Add value labels
        for i, ratio in enumerate(stock_ratio):
            color = 'white' if ratio < 0.8 else 'black'
            ax.text(i, 0, f'{ratio:.1f}', ha='center', va='center', 
                   color=color, fontweight='bold', fontsize=10)
        
        plt.tight_layout()
        return self._fig_to_base64(fig)
    
    def create_weekly_pattern_chart(self):
        """Analysis 4: Weekly pattern with seaborn"""
        from sqlalchemy import extract
        
        results = self.db.query(
            extract('dow', models.Sale.sale_date).label('dow'),
            func.sum(models.Sale.quantity).label('total')
        ).group_by('dow').all()
        
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        sales_by_day = [0] * 7
        
        for dow, total in results:
            # Convert PostgreSQL dow (0=Sunday) to our order
            idx = (dow - 1) if dow > 0 else 6
            sales_by_day[idx] = total
        
        fig, ax = plt.subplots(figsize=(12, 6))
        
        # Create sophisticated bar chart with gradient
        bars = ax.bar(days, sales_by_day, color=sns.color_palette("viridis", 7), 
                     edgecolor='black', linewidth=1.5)
        
        # Add gradient effect
        for i, bar in enumerate(bars):
            bar.set_alpha(0.8)
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height + 5,
                   f'{int(height)}', ha='center', va='bottom', fontweight='bold', fontsize=11)
        
        # Add average line
        avg_sales = np.mean(sales_by_day)
        ax.axhline(y=avg_sales, color='red', linestyle='--', linewidth=2, 
                  label=f'Average: {avg_sales:.0f} units')
        
        ax.set_xlabel('Day of Week', fontsize=12, fontweight='bold')
        ax.set_ylabel('Units Sold', fontsize=12, fontweight='bold')
        ax.set_title('Weekly Sales Pattern Analysis', fontsize=16, fontweight='bold', pad=20)
        ax.legend(loc='upper right', framealpha=0.9)
        ax.grid(True, alpha=0.3, axis='y', linestyle='--')
        
        # Highlight best day
        best_idx = sales_by_day.index(max(sales_by_day))
        bars[best_idx].set_color('#ff6b6b')
        bars[best_idx].set_edgecolor('darkred')
        bars[best_idx].set_linewidth(3)
        
        return self._fig_to_base64(fig)
    
    def create_forecast_chart(self, window=7):
        """Analysis 5: Advanced forecast with confidence bands"""
        from .services.forecast_service import DemandForecast
        
        forecast_service = DemandForecast(self.db)
        forecast_data = forecast_service.simple_moving_average(window)
        
        if 'error' in forecast_data:
            return None
        
        historical = forecast_data['historical_values']
        forecast = forecast_data['forecast_values']
        
        fig, ax = plt.subplots(figsize=(12, 6))
        
        # Plot historical data
        x_hist = range(len(historical))
        ax.plot(x_hist, historical, 'b-o', linewidth=2, markersize=6, 
               label='Historical Sales', markerfacecolor='white', markeredgewidth=2)
        
        # Plot forecast
        x_forecast = range(len(historical), len(historical) + len(forecast))
        ax.plot(x_forecast, forecast, 'r--s', linewidth=2, markersize=8,
               label='Forecast', markerfacecolor='white', markeredgewidth=2)
        
        # Add confidence interval (simulated)
        confidence_upper = [f * 1.15 for f in forecast]
        confidence_lower = [f * 0.85 for f in forecast]
        ax.fill_between(x_forecast, confidence_lower, confidence_upper, 
                        alpha=0.2, color='red', label='85% Confidence Interval')
        
        # Add vertical separation line
        ax.axvline(x=len(historical)-0.5, color='gray', linestyle='--', alpha=0.7,
                  label='Forecast Start')
        
        ax.set_xlabel('Days', fontsize=12, fontweight='bold')
        ax.set_ylabel('Units Sold', fontsize=12, fontweight='bold')
        ax.set_title(f'Demand Forecast - Next {len(forecast)} Days\n(Moving Average: {window}-day window)',
                    fontsize=14, fontweight='bold', pad=20)
        ax.legend(loc='upper left', framealpha=0.9)
        ax.grid(True, alpha=0.3, linestyle='--')
        
        # Add total forecast annotation
        total_forecast = sum(forecast)
        ax.text(0.02, 0.95, f'Total Forecast: {total_forecast:.0f} units', 
               transform=ax.transAxes, fontsize=12, fontweight='bold',
               bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8))
        
        return self._fig_to_base64(fig)
    
    def create_profit_margin_chart(self):
        """Analysis 6: Profit margin gauge chart"""
        results = self.db.query(
            models.Product.name,
            func.sum(models.Sale.total_amount).label('revenue')
        ).join(models.Sale).group_by(models.Product.id).all()
        
        margins = []
        for r in results:
            revenue = float(r[1])
            cost = revenue * 0.6  # Assume 40% margin
            margin = ((revenue - cost) / revenue) * 100 if revenue > 0 else 0
            margins.append({"name": r[0], "margin": margin})
        
        margins = sorted(margins, key=lambda x: x['margin'], reverse=True)[:8]
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
        
        # Profit margin bar chart
        names = [m['name'] for m in margins]
        margin_values = [m['margin'] for m in margins]
        
        bars = ax1.barh(names, margin_values, color=sns.color_palette("RdYlGn", len(margins)))
        ax1.set_xlabel('Profit Margin (%)', fontsize=11, fontweight='bold')
        ax1.set_title('Product Profit Margins', fontsize=14, fontweight='bold', pad=15)
        
        # Color code bars
        for i, (bar, margin) in enumerate(zip(bars, margin_values)):
            color = '#28a745' if margin >= 40 else '#ffc107' if margin >= 20 else '#dc3545'
            bar.set_color(color)
            ax1.text(margin + 1, bar.get_y() + bar.get_height()/2, 
                    f'{margin:.1f}%', va='center', fontweight='bold')
        
        # Average margin gauge
        avg_margin = np.mean(margin_values)
        
        # Create gauge chart
        gauge_angles = np.linspace(0, 180, 100)
        gauge_radians = np.radians(gauge_angles)
        
        # Gauge background
        ax2.plot(np.cos(gauge_radians), np.sin(gauge_radians), 'lightgray', linewidth=20, solid_capstyle='round')
        
        # Fill based on average margin
        fill_angles = gauge_angles[:int(len(gauge_angles) * avg_margin / 100)]
        fill_radians = np.radians(fill_angles)
        ax2.plot(np.cos(fill_radians), np.sin(fill_radians), '#28a745', linewidth=20, solid_capstyle='round')
        
        # Add needle
        needle_angle = np.radians(avg_margin * 180 / 100)
        ax2.arrow(0, 0, np.cos(needle_angle) * 0.8, np.sin(needle_angle) * 0.8,
                 head_width=0.1, head_length=0.1, fc='red', ec='red', linewidth=2)
        
        ax2.set_xlim(-1.2, 1.2)
        ax2.set_ylim(-0.2, 1.2)
        ax2.set_aspect('equal')
        ax2.axis('off')
        ax2.set_title(f'Average Profit Margin: {avg_margin:.1f}%', 
                     fontsize=14, fontweight='bold', pad=20)
        
        # Add text in center
        ax2.text(0, 0.4, f'{avg_margin:.1f}%', ha='center', va='center',
                fontsize=28, fontweight='bold', color='#28a745')
        ax2.text(0, 0.1, 'Average Margin', ha='center', va='center',
                fontsize=12, color='gray')
        
        plt.tight_layout()
        return self._fig_to_base64(fig)
    
    def create_category_radar_chart(self):
        """Analysis 7: Category performance radar chart"""
        results = self.db.query(
            models.Product.category,
            func.sum(models.Sale.total_amount).label('revenue')
        ).join(models.Sale).group_by(models.Product.category).all()
        
        categories = [r[0] for r in results]
        revenues = [float(r[1]) for r in results]
        
        # Normalize to 0-100 scale
        max_revenue = max(revenues)
        normalized = [(r / max_revenue) * 100 for r in revenues]
        
        # Close the polygon
        categories.append(categories[0])
        normalized.append(normalized[0])
        
        fig, ax = plt.subplots(figsize=(10, 8), subplot_kw=dict(projection='polar'))
        
        angles = np.linspace(0, 2 * np.pi, len(categories), endpoint=False).tolist()
        angles.append(angles[0])  # Close the loop
        
        ax.plot(angles, normalized, 'o-', linewidth=2, color='#2E86AB')
        ax.fill(angles, normalized, alpha=0.25, color='#2E86AB')
        
        ax.set_xticks(angles[:-1])
        ax.set_xticklabels(categories[:-1], fontsize=11, fontweight='bold')
        ax.set_ylim(0, 100)
        ax.set_yticks(range(0, 101, 20))
        ax.set_yticklabels([f'{i}%' for i in range(0, 101, 20)], fontsize=9)
        ax.set_title('Category Performance Radar Chart\n(Normalized to 100%)', 
                    fontsize=14, fontweight='bold', pad=20)
        ax.grid(True)
        
        return self._fig_to_base64(fig)
    
    def create_correlation_heatmap(self):
        """Analysis 8: Price vs sales correlation"""
        results = self.db.query(
            models.Product.price,
            func.sum(models.Sale.quantity).label('total_sold')
        ).join(models.Sale).group_by(models.Product.id).all()
        
        prices = [float(r[0]) for r in results]
        sales = [int(r[1]) for r in results]
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
        
        # Scatter plot with regression line
        ax1.scatter(prices, sales, s=100, alpha=0.6, color='#2E86AB', edgecolors='white', linewidth=2)
        
        # Add regression line
        z = np.polyfit(prices, sales, 1)
        p = np.poly1d(z)
        x_line = np.linspace(min(prices), max(prices), 100)
        ax1.plot(x_line, p(x_line), 'r--', linewidth=2, label=f'Correlation: {np.corrcoef(prices, sales)[0,1]:.2f}')
        
        ax1.set_xlabel('Product Price ($)', fontsize=12, fontweight='bold')
        ax1.set_ylabel('Total Units Sold', fontsize=12, fontweight='bold')
        ax1.set_title('Price vs Sales Volume Correlation', fontsize=14, fontweight='bold', pad=15)
        ax1.legend(loc='upper right')
        ax1.grid(True, alpha=0.3)
        
        # Add annotations for each point
        for i, (price, sale) in enumerate(zip(prices, sales)):
            ax1.annotate(f'${price:.0f}', (price, sale), 
                        xytext=(5, 5), textcoords='offset points', fontsize=8)
        
        # Create correlation matrix heatmap
        correlation_matrix = np.corrcoef(prices, sales)
        
        im = ax2.imshow(correlation_matrix, cmap='coolwarm', vmin=-1, vmax=1)
        ax2.set_xticks([0, 1])
        ax2.set_yticks([0, 1])
        ax2.set_xticklabels(['Price', 'Sales'], fontsize=11, fontweight='bold')
        ax2.set_yticklabels(['Price', 'Sales'], fontsize=11, fontweight='bold')
        
        # Add text annotations
        for i in range(2):
            for j in range(2):
                text = ax2.text(j, i, f'{correlation_matrix[i, j]:.2f}',
                               ha='center', va='center', color='white' if abs(correlation_matrix[i, j]) > 0.5 else 'black',
                               fontsize=14, fontweight='bold')
        
        ax2.set_title('Correlation Matrix', fontsize=14, fontweight='bold', pad=15)
        
        plt.colorbar(im, ax=ax2)
        plt.tight_layout()
        return self._fig_to_base64(fig)