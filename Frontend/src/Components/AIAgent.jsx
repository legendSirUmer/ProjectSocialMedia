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
    
          <iframe 
      src="http://localhost:6999" 
      width="1000" 
      height="800" 
      marginLeft ="200px"
      title="Localhost Page"
      style={{ border: "none" }}
    />
      </div>
   
    </div>
  );
}