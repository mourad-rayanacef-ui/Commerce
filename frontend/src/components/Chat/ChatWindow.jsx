import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import '../../styles/chat.css';

const ChatWindow = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    if (token) fetchConversations();
    const interval = setInterval(() => {
      if (token) fetchConversations();
    }, 3000);
    return () => clearInterval(interval);
  }, [token]);

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
    setLoading(true);
    try {
      const response = await fetch(`/api/chat/messages/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMessages(data);
      setSelectedUser(userId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
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
      <div className="chat-header">
        <h3>💬 Chat</h3>
      </div>
      
      <div className="chat-container">
        <div className="conversations-list">
          <h4>Conversations</h4>
          {conversations.length === 0 ? (
            <p className="no-conversations">No conversations yet</p>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.user_id}
                className={`conversation ${selectedUser === conv.user_id ? 'active' : ''}`}
                onClick={() => fetchMessages(conv.user_id)}
              >
                <p className="conv-name">{conv.username}</p>
                <p className="conv-last-msg">{conv.last_message?.substring(0, 30)}...</p>
                {conv.unread_count > 0 && (
                  <span className="unread-badge">{conv.unread_count}</span>
                )}
              </div>
            ))
          )}
        </div>

        {selectedUser && (
          <div className="messages-container">
            <div className="messages-header">
              <h5>
                {conversations.find(c => c.user_id === selectedUser)?.username}
              </h5>
            </div>
            
            <div className="messages-list">
              {loading ? (
                <p className="loading-msg">Loading messages...</p>
              ) : messages.length === 0 ? (
                <p className="no-messages">No messages yet. Start the conversation!</p>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`message ${msg.sender_id === user.id ? 'sent' : 'received'}`}
                  >
                    <p className="msg-content">{msg.message}</p>
                    <small className="msg-time">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </small>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={sendMessage} className="message-input-form">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                className="message-input"
              />
              <button type="submit" className="send-btn">Send</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;