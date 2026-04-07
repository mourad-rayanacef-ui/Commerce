// notificationService.js

const API_URL = 'https://your-api-url.com/notifications';

export const fetchNotifications = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error('Failed to fetch notifications');
    }
    return await response.json();
};

export const createNotification = async (notification) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(notification)
    });
    if (!response.ok) {
        throw new Error('Failed to create notification');
    }
    return await response.json();
};

export const markAsRead = async (id) => {
    const response = await fetch(`${API_URL}/${id}/read`, {
        method: 'PATCH',
    });
    if (!response.ok) {
        throw new Error('Failed to mark notification as read');
    }
    return await response.json();
};

export const deleteNotification = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete notification');
    }
};
