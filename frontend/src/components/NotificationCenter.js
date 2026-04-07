import React, { useState, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/solid'; // Assuming you're using Heroicons

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    // Fetch notifications (stubbed)
    const fetchNotifications = () => {
        // Replace with real API call
        const newNotifications = [
            { id: 1, message: 'New message from Alice.' },
            { id: 2, message: 'Your order has been shipped.' },
            { id: 3, message: 'Reminder: Meeting at 3 PM.' }
        ];
        setNotifications(newNotifications);
    };

    useEffect(() => {
        // Simulate fetching notifications every 10 seconds
        const interval = setInterval(() => {
            fetchNotifications();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center">
                <BellIcon className="h-6 w-6 text-gray-700" />
                {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-600" />
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    <div className="p-2">
                        <h3 className="font-bold text-gray-800">Notifications</h3>
                        <ul className="list-none">
                            {notifications.map(notification => (
                                <li key={notification.id} className="p-1 hover:bg-gray-100">{notification.message}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;