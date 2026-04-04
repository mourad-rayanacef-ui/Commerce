import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

export default function ChatWindow({ conversationUserId, conversationUserName, onBack }) {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const targetUserId = conversationUserId;

  useEffect(() => {
    if (targetUserId) loadMessages();
  }, [targetUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await api.getMessages(targetUserId, token);
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    const tempMsg = {
      id: Date.now(),
      sender_id: user.id,
      receiver_id: targetUserId,
      message: newMessage.trim(),
      created_at: new Date().toISOString(),
      is_read: false,
      _temp: true,
    };
    setMessages(prev => [...prev, tempMsg]);
    const text = newMessage.trim();
    setNewMessage('');
    try {
      await api.sendMessage({ receiver_id: targetUserId, message: text }, token);
      await loadMessages();
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      setNewMessage(text);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={styles.window}>
      {/* Header */}
      <div style={styles.header}>
        {onBack && (
          <button onClick={onBack} style={styles.backBtn}>← Back</button>
        )}
        <div style={styles.headerInfo}>
          <div style={styles.avatar}>{(conversationUserName || 'U')[0].toUpperCase()}</div>
          <div>
            <div style={styles.headerName}>{conversationUserName || 'Support'}</div>
            <div style={styles.headerSub}>Active chat</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {loading ? (
          <div style={styles.loading}>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div style={styles.empty}>
            <p>💬</p>
            <p>No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMine = msg.sender_id === user?.id;
            return (
              <div key={msg.id} style={{ ...styles.msgRow, justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                <div style={{ ...styles.bubble, ...(isMine ? styles.myBubble : styles.theirBubble) }}>
                  <p style={styles.msgText}>{msg.message}</p>
                  <span style={styles.msgTime}>{formatTime(msg.created_at)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={styles.inputForm}>
        <input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={styles.input}
          disabled={sending}
        />
        <button type="submit" disabled={!newMessage.trim() || sending} style={styles.sendBtn}>
          {sending ? '...' : '➤'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  window: { display: 'flex', flexDirection: 'column', height: '100%', background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 20px rgba(0,0,0,0.1)' },
  header: { background: 'linear-gradient(135deg, #1a1a2e, #16213e)', color: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 },
  backBtn: { background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
  headerInfo: { display: 'flex', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: '50%', background: '#3498db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18 },
  headerName: { fontWeight: 700, fontSize: 16 },
  headerSub: { fontSize: 12, opacity: 0.7 },
  messages: { flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12, background: '#f8f9fa' },
  loading: { textAlign: 'center', color: '#7f8c8d', padding: 40 },
  empty: { textAlign: 'center', color: '#7f8c8d', fontSize: 30, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  msgRow: { display: 'flex' },
  bubble: { maxWidth: '70%', padding: '10px 14px', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
  myBubble: { background: 'linear-gradient(135deg, #3498db, #2980b9)', color: 'white', borderBottomRightRadius: 4 },
  theirBubble: { background: 'white', color: '#2c3e50', borderBottomLeftRadius: 4 },
  msgText: { margin: '0 0 4px 0', fontSize: 14, lineHeight: 1.5 },
  msgTime: { fontSize: 11, opacity: 0.7 },
  inputForm: { padding: '16px 20px', borderTop: '1px solid #ecf0f1', display: 'flex', gap: 10, background: 'white' },
  input: { flex: 1, padding: '12px 16px', border: '2px solid #ecf0f1', borderRadius: 24, fontSize: 14, outline: 'none' },
  sendBtn: { width: 44, height: 44, background: 'linear-gradient(135deg, #3498db, #2980b9)', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' },
};
