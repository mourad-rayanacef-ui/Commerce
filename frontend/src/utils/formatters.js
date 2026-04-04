export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getStockStatusClass = (currentStock, reorderPoint) => {
  if (currentStock <= reorderPoint * 0.5) return 'critical';
  if (currentStock <= reorderPoint) return 'low';
  if (currentStock <= reorderPoint * 2) return 'healthy';
  return 'excess';
};