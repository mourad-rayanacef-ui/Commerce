import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import ChatWindow from '../components/Chat/ChatWindow';

// Admin ID — in real app this comes from the backend
const ADMIN_USER_ID = 1;
const ADMIN_USER_NAME = 'Support Team';

export default function ChatPage() {
  const { user, token, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await api.getConversations(token);
      setConversations(Array.isArray(data) ? data : []);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  // Customers: talk directly to admin
  if (!isAdmin) {
    return (
      <div style={styles.page}>
        <div style={styles.customerLayout}>
          <div style={styles.customerHeader}>
            <h1 style={styles.title}>💬 Contact Support</h1>
            <p style={styles.subtitle}>Chat with our admin team for help with orders, products, or anything else.</p>
          </div>
          <div style={styles.chatWrap}>
            <ChatWindow
              conversationUserId={ADMIN_USER_ID}
              conversationUserName={ADMIN_USER_NAME}
            />
          </div>
        </div>
      </div>
    );
  }

  // Admin: see all conversations
  return (
    <div style={styles.page}>
      <div style={styles.adminLayout}>
        {/* Sidebar: conversation list */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h2 style={styles.sidebarTitle}>💬 Conversations</h2>
            <button onClick={loadConversations} style={styles.refreshBtn}>↻</button>
          </div>

          {loading ? (
            <div style={styles.sidebarLoading}>Loading...</div>
          ) : conversations.length === 0 ? (
            <div style={styles.sidebarEmpty}>No conversations yet</div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.user_id || conv.id}
                onClick={() => setSelectedConv(conv)}
                style={{
                  ...styles.convItem,
                  ...(selectedConv?.user_id === conv.user_id ? styles.convItemActive : {}),
                }}
              >
                <div style={styles.convAvatar}>{(conv.username || conv.full_name || 'U')[0].toUpperCase()}</div>
                <div style={styles.convInfo}>
                  <div style={styles.convName}>{conv.full_name || conv.username}</div>
                  <div style={styles.convLast}>{conv.last_message || 'No messages'}</div>
                </div>
                {conv.unread_count > 0 && (
                  <span style={styles.unreadBadge}>{conv.unread_count}</span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Chat Area */}
        <div style={styles.chatArea}>
          {selectedConv ? (
            <ChatWindow
              conversationUserId={selectedConv.user_id || selectedConv.id}
              conversationUserName={selectedConv.full_name || selectedConv.username}
              onBack={() => setSelectedConv(null)}
            />
          ) : (
            <div style={styles.placeholder}>
              <p style={styles.placeholderIcon}>💬</p>
              <h3 style={styles.placeholderTitle}>Select a Conversation</h3>
              <p style={styles.placeholderSub}>Choose a customer from the left to start chatting.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { height: 'calc(100vh - 64px)', background: '#f8f9fa', overflow: 'hidden' },
  // Customer view
  customerLayout: { maxWidth: 800, margin: '0 auto', padding: '32px 20px', height: '100%', display: 'flex', flexDirection: 'column', gap: 20 },
  customerHeader: {},
  title: { fontSize: 28, fontWeight: 800, color: '#2c3e50', margin: '0 0 8px 0' },
  subtitle: { color: '#7f8c8d', margin: 0 },
  chatWrap: { flex: 1, minHeight: 0 },
  // Admin view
  adminLayout: { display: 'flex', height: '100%' },
  sidebar: { width: 320, background: 'white', borderRight: '1px solid #ecf0f1', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  sidebarHeader: { padding: '20px', borderBottom: '1px solid #ecf0f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sidebarTitle: { margin: 0, fontSize: 18, fontWeight: 700, color: '#2c3e50' },
  refreshBtn: { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#3498db' },
  sidebarLoading: { padding: 20, textAlign: 'center', color: '#7f8c8d' },
  sidebarEmpty: { padding: 20, textAlign: 'center', color: '#7f8c8d', fontSize: 14 },
  convItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', cursor: 'pointer', borderBottom: '1px solid #f8f9fa' },
  convItemActive: { background: '#e8f4fd' },
  convAvatar: { width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #3498db, #2980b9)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, flexShrink: 0 },
  convInfo: { flex: 1, overflow: 'hidden' },
  convName: { fontWeight: 600, fontSize: 15, color: '#2c3e50' },
  convLast: { fontSize: 12, color: '#7f8c8d', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  unreadBadge: { background: '#e74c3c', color: 'white', borderRadius: '50%', minWidth: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 },
  chatArea: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 20 },
  placeholder: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 },
  placeholderIcon: { fontSize: 64, margin: 0 },
  placeholderTitle: { fontSize: 22, fontWeight: 700, color: '#2c3e50', margin: 0 },
  placeholderSub: { fontSize: 14, color: '#7f8c8d', margin: 0 },
};
