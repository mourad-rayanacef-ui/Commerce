// frontend/src/components/Chat/ChatWindow.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import '../../styles/chat.css';

const ChatWindow = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageText, setMessageText] = useState('');
  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await fetch(`/api/chat/messages/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMessages(data);
      setSelectedUser(userId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageText || !selectedUser) return;

    try {
      await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ receiver_id: selectedUser, message: messageText })
      });
      setMessageText('');
      fetchMessages(selectedUser);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="chat-window">
      <div className="conversations-list">
        <h3>Conversations</h3>
        {conversations.map(conv => (
          <div
            key={conv.user_id}
            className={`conversation ${selectedUser === conv.user_id ? 'active' : ''}`}
            onClick={() => fetchMessages(conv.user_id)}
          >
            <p><strong>{conv.username}</strong></p>
            <p className="last-message">{conv.last_message}</p>
          </div>
        ))}
      </div>

      {selectedUser && (
        <div className="messages-container">
          <div className="messages-list">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`message ${msg.sender_id === user.id ? 'sent' : 'received'}`}
              >
                <p>{msg.message}</p>
                <small>{new Date(msg.created_at).toLocaleTimeString()}</small>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="message-input">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;