import React, { useState, useEffect, useRef } from 'react';
import './chatroom.css';
import Nav from './nav';
import Sidebar from './sidebar';

const EMOTES = ['😀', '😂', '😍', '😎', '😭', '👍', '🎉', '🔥', '❤️', '😡'];

export default function Chatroom() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showEmotePicker, setShowEmotePicker] = useState(false);
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket server (adjust ws:// URL as needed)
    ws.current = new WebSocket('ws://localhost:8000/ws/chat/room/');
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };
    ws.current.onclose = () => {
      // Optionally handle disconnect
    };
    return () => {
      ws.current.close();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim() && ws.current.readyState === 1) {
      const userid = localStorage.getItem('id');
      console.log(userid);
      ws.current.send(JSON.stringify({ message: input ,username: localStorage.getItem('username') }));
      
      setInput('');
    }
  };

  const handleEmoteSelect = (emote) => {
    setInput(input + emote);
    setShowEmotePicker(false);
  };

  return (
    <div>
      <Nav />
      <Sidebar />
      <div className="chatroom-container" style={{ maxWidth: '900px', width: '90vw', margin: '100px auto 0 250px', minHeight: '500px', padding: '32px 32px 24px 32px' }}>
        <h2>Chatroom</h2>
        <div className="chat-messages">
          {messages.map((msg, idx) => {
            const isOwn = msg.username === localStorage.getItem('username');
            return (
              <div
                key={idx}
                className={`chat-message`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start', // Always align right
                  marginBottom: '8px',
                }}
              >
                <span
                  className="chat-username"
                  style={{
                    color: isOwn ? '#1976d2' : '#333',
                    fontWeight: isOwn ? 'bold' : 'normal',
                  }}
                >
                  {msg.username || 'User'}:
                </span>
                <span
                  className="chat-message-text"
                  style={{
                    background: isOwn ? '#e3f0ff' : '#fffbe8', // Cream white for others
                    color: isOwn ? '#1976d2' : '#222',
                    borderRadius: '16px',
                    padding: '8px 16px',
                    maxWidth: '95%',
                    marginTop: '2px',
                    alignSelf: 'flex-start', // Always right
                  }}
                >
                  {msg.message}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <form className="chat-input-form" onSubmit={handleSend} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            className="chat-input"
            style={{ flex: 1 }}
          />
          <button type="button" className="chat-emote-btn" onClick={() => setShowEmotePicker(v => !v)} style={{ fontSize: '22px', padding: '0 10px', background: 'none', border: 'none', cursor: 'pointer' }}>
            😊
          </button>
          <button type="submit" className="chat-send-btn">Send</button>
          {showEmotePicker && (
            <div className="emote-picker-popup" style={{ position: 'absolute', bottom: '60px', right: '60px', background: '#fff', border: '1px solid #ddd', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', padding: '10px', zIndex: 10, display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {EMOTES.map(emote => (
                <span
                  key={emote}
                  style={{ fontSize: '22px', cursor: 'pointer', padding: '4px' }}
                  onClick={() => handleEmoteSelect(emote)}
                >
                  {emote}
                </span>
              ))}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
