import React, { useState, useEffect, useRef } from 'react';
import './chatroom.css';
import Nav from './nav';
import Sidebar from './sidebar';

export default function Chatroom() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
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

  return (
    <div>
      <Nav />
      <Sidebar />
      <div className="chatroom-container" style={{ maxWidth: '900px', width: '90vw', margin: '100px auto 0 250px', minHeight: '500px', padding: '32px 32px 24px 32px' }}>
        <h2>Chatroom</h2>
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className="chat-message">
              <span className="chat-username">{msg.username || 'User'}:</span> {msg.message}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form className="chat-input-form" onSubmit={handleSend}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            className="chat-input"
          />
          <button type="submit" className="chat-send-btn">Send</button>
        </form>
      </div>
    </div>
  );
}
