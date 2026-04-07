from flask import Blueprint, request, jsonify

notifications_bp = Blueprint('notifications', __name__)

notifications = []  # In-memory notification storage

@notifications_bp.route('/notifications', methods=['GET'])
def get_notifications():
    return jsonify(notifications), 200

@notifications_bp.route('/notifications', methods=['POST'])
def create_notification():
    data = request.get_json()
    new_notification = {
        'id': len(notifications) + 1,
        'message': data['message'],
        'read': False,
        'created_at': data.get('created_at', '2026-04-07 14:36:35')  # Default to current time
    }
    notifications.append(new_notification)
    return jsonify(new_notification), 201

@notifications_bp.route('/notifications/<int:notification_id>', methods=['PATCH'])
def mark_as_read(notification_id):
    for notification in notifications:
        if notification['id'] == notification_id:
            notification['read'] = True
            return jsonify(notification), 200
    return jsonify({'error': 'Notification not found'}), 404

@notifications_bp.route('/notifications/<int:notification_id>', methods=['DELETE'])
def delete_notification(notification_id):
    global notifications
    notifications = [n for n in notifications if n['id'] != notification_id]
    return jsonify({'message': 'Notification deleted'}), 204

