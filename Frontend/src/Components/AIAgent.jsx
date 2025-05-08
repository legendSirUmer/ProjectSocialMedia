import React from 'react';
import Nav from './nav';
import Sidebar from './sidebar';
import './AIAgent.css';

export default function AIAgent() {
  return (
    <div>
      <header className='navheader'>
        <Nav />
      </header>
      <Sidebar />
      <div className="ai-agent-page" style={{ marginLeft: "250px", marginTop: "100px", padding: "20px" }}>
        <h1>AI Agent</h1>
        <p>Welcome to the AI Agent page. Here you can interact with various AI-powered tools and features.</p>
        <div className="ai-tools">
          <div className="tool">
            <h2>Google Search Agent</h2>
            <p>Perform intelligent searches using AI.</p>
            <button>Try Now</button>
          </div>
          <div className="tool">
            <h2>Weather Agent</h2>
            <p>Get real-time weather updates.</p>
            <button>Check Weather</button>
          </div>
          <div className="tool">
            <h2>Streaming Agent</h2>
            <p>Stream data seamlessly with AI assistance.</p>
            <button>Start Streaming</button>
          </div>
        </div>
      </div>
    </div>
  );
}