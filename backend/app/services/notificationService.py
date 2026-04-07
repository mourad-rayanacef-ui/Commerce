class NotificationService:
    def __init__(self):
        pass

    def create_message_notification(self, message):
        # Logic for creating a message notification
        return f"Notification created for message: {message}"

    def create_order_notification(self, order_id):
        # Logic for creating an order notification
        return f"Notification created for order ID: {order_id}"

    def create_status_change_notification(self, order_id, new_status):
        # Logic for creating a status change notification
        return f"Notification created for order ID {order_id} with new status: {new_status}"
