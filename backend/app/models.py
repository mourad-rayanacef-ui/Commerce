class Notification:
    def __init__(self, user_id, message, notification_type, timestamp=None):
        self.user_id = user_id  # ID of the user receiving the notification
        self.message = message  # Content of the notification
        self.notification_type = notification_type  # Type of notification (message, order, status change)
        self.timestamp = timestamp if timestamp is not None else '2026-04-07 14:33:25'  # Notification time

    def to_dict(self):
        return {
            'user_id': self.user_id,
            'message': self.message,
            'notification_type': self.notification_type,
            'timestamp': self.timestamp
        }