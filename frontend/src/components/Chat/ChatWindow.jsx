import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import '../../styles/chat.css';

const ChatWindow = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [peerLabel, setPeerLabel] = useState('');
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [contactSearch, setContactSearch] = useState('');
  const [panel, setPanel] = useState('inbox');
  const [sendError, setSendError] = useState('');
  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    if (token) fetchConversations();
    const interval = setInterval(() => {
      if (token) fetchConversations();
    }, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/chat/contacts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setContacts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContacts([]);
    }
  };

  useEffect(() => {
    if (token && panel === 'new') {
      fetchContacts();
    }
  }, [token, panel]);

  const filteredContacts = useMemo(() => {
    const q = contactSearch.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) =>
        c.username.toLowerCase().includes(q) ||
        (c.full_name && c.full_name.toLowerCase().includes(q))
    );
  }, [contacts, contactSearch]);

  const fetchMessages = async (userId, label) => {
    setLoading(true);
    setSendError('');
    try {
      const response = await fetch(`/api/chat/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setMessages(Array.isArray(data) ? data : []);
      setSelectedUser(userId);
      if (label) setPeerLabel(label);
      setPanel('inbox');
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const openConversation = (conv) => {
    setPeerLabel(conv.username);
    fetchMessages(conv.user_id, conv.username);
  };

  const startWithContact = (c) => {
    setPeerLabel(c.username);
    fetchMessages(c.id, c.username);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUser) return;
    setSendError('');
    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiver_id: selectedUser, message: messageText.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setSendError(err.detail || 'Could not send message');
        return;
      }
      setMessageText('');
      await fetchMessages(selectedUser, peerLabel);
      await fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      setSendError('Network error');
    }
  };

  const preview = (text) => {
    if (!text) return 'No messages yet';
    return text.length > 40 ? `${text.slice(0, 40)}…` : text;
  };

  const headerName =
    peerLabel ||
    conversations.find((c) => c.user_id === selectedUser)?.username ||
    'Conversation';

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div>
          <h3>Messages</h3>
          <p className="chat-header-hint">Support & team chat</p>
        </div>
      </div>

      <div className="chat-container">
        <div className="conversations-sidebar">
          <div className="chat-panel-tabs">
            <button
              type="button"
              className={panel === 'inbox' ? 'active' : ''}
              onClick={() => setPanel('inbox')}
            >
              Inbox
            </button>
            <button
              type="button"
              className={panel === 'new' ? 'active' : ''}
              onClick={() => setPanel('new')}
            >
              New chat
            </button>
          </div>

          {panel === 'inbox' && (
            <>
              <h4 className="conversations-heading">Recent</h4>
              {conversations.length === 0 ? (
                <div className="chat-empty-state">
                  <p>No threads yet.</p>
                  <button type="button" className="chat-link-btn" onClick={() => setPanel('new')}>
                    Start a conversation →
                  </button>
                </div>
              ) : (
                <ul className="conversation-list">
                  {conversations.map((conv) => (
                    <li key={conv.user_id}>
                      <button
                        type="button"
                        className={`conversation-item ${
                          selectedUser === conv.user_id ? 'conversation-item--active' : ''
                        }`}
                        onClick={() => openConversation(conv)}
                      >
                        <span className="conversation-item-name">{conv.username}</span>
                        <span className="conversation-item-preview">{preview(conv.last_message)}</span>
                        {conv.unread_count > 0 && (
                          <span className="unread-badge">{conv.unread_count}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {panel === 'new' && (
            <div className="chat-new-panel">
              <p className="chat-new-help">
                {user?.role === 'admin'
                  ? 'Choose a customer or teammate to message.'
                  : 'Message a store admin for help with your order.'}
              </p>
              <input
                type="search"
                className="chat-contact-search"
                placeholder="Search by name…"
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
              />
              {filteredContacts.length === 0 ? (
                <p className="no-conversations">
                  {contacts.length === 0 ? 'No contacts available.' : 'No matches.'}
                </p>
              ) : (
                <ul className="contact-picker">
                  {filteredContacts.map((c) => (
                    <li key={c.id}>
                      <button type="button" className="contact-picker-item" onClick={() => startWithContact(c)}>
                        <span className="contact-picker-name">{c.username}</span>
                        <span className="contact-picker-meta">
                          {c.full_name} · {c.role}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="messages-pane">
          {!selectedUser ? (
            <div className="chat-placeholder">
              <div className="chat-placeholder-inner">
                <h4>Select a conversation</h4>
                <p>Pick a thread on the left, or open <strong>New chat</strong> to reach someone.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="messages-header">
                <h5>{headerName}</h5>
                <button
                  type="button"
                  className="chat-back-mobile"
                  onClick={() => {
                    setSelectedUser(null);
                    setMessages([]);
                  }}
                >
                  Close
                </button>
              </div>

              <div className="messages-list">
                {loading ? (
                  <p className="loading-msg">Loading messages…</p>
                ) : messages.length === 0 ? (
                  <p className="no-messages">No messages yet. Say hello below.</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message ${msg.sender_id === user.id ? 'sent' : 'received'}`}
                    >
                      <p className="msg-content">{msg.message}</p>
                      <small className="msg-time">
                        {new Date(msg.created_at).toLocaleString()}
                      </small>
                    </div>
                  ))
                )}
              </div>

              {sendError && <div className="chat-send-error">{sendError}</div>}

              <form onSubmit={sendMessage} className="message-input-form">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Write a message…"
                  className="message-input"
                  autoComplete="off"
                />
                <button type="submit" className="send-btn" disabled={!messageText.trim()}>
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
