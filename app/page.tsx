'use client';

import { useState, useRef, useEffect } from 'react';
import './morpheus.css';

export default function Home() {
  // State management
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'morpheus',
      content: 'I am Morpheus, Lord of Dreams. How may I guide you today?',
      timestamp: new Date(),
    },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([
    { role: 'system', content: 'You are Morpheus, a philosophical guide to the digital realm. Respond with wisdom, metaphor, and insight.' },
    { role: 'assistant', content: 'I am Morpheus, Lord of Dreams. How may I guide you today?' }
  ]);
  
  // Reference for scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Send message to Morpheus API
  const callMorpheusAPI = async (message: string) => {
    try {
      const response = await fetch('/api/morpheus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history: conversationHistory
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get response from Morpheus');
      }
      
      return data.response;
    } catch (error) {
      console.error('Error calling Morpheus API:', error);
      return 'I apologize, but I encountered an error processing your request.';
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!currentInput.trim() || isThinking) return;

    // Add user message to UI
    const newUserMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newUserMessage]);
    
    // Add user message to conversation history
    const updatedHistory = [
      ...conversationHistory,
      { role: 'user', content: currentInput }
    ];
    setConversationHistory(updatedHistory);
    
    setCurrentInput('');
    setIsThinking(true);
    
    try {
      // Get response from Morpheus
      const morpheusResponse = await callMorpheusAPI(currentInput);
      
      setIsThinking(false);
      
      // Add Morpheus response to UI
      const morpheusMessage = {
        id: Date.now().toString(),
        role: 'morpheus',
        content: morpheusResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, morpheusMessage]);
      
      // Add Morpheus response to conversation history
      setConversationHistory([
        ...updatedHistory,
        { role: 'assistant', content: morpheusResponse }
      ]);
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      setIsThinking(false);
      
      // Add error message
      const errorMessage = {
        id: Date.now().toString(),
        role: 'morpheus',
        content: 'I apologize, but I encountered an error processing your request.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <main className="morpheus-container">
      {/* Header */}
      <header className="morpheus-header">
        <h1 className="morpheus-title">Morpheus</h1>
        <p className="morpheus-subtitle">Lord of Dreams • Guide to the Digital Realm</p>
      </header>

      {/* Chat messages container */}
      <div className="morpheus-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={message.role === 'user' ? 'message user-message' : 'message morpheus-message'}
          >
            <pre className="whitespace-pre-wrap">{message.content}</pre>
            <div className="message-time">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="message morpheus-message">
            <div className="thinking-indicator">
              <div className="thinking-dot"></div>
              <div className="thinking-dot"></div>
              <div className="thinking-dot"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input area */}
      <div className="morpheus-input">
        <input
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder="Type your message here..."
          disabled={isThinking}
        />
        <button
          onClick={handleSendMessage}
          disabled={!currentInput.trim() || isThinking}
        >
          Send
        </button>
      </div>
    </main>
  );
}