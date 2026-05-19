import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Link from 'next/link';

export default function Home() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const socketInstance = io('http://localhost:5000', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    setSocket(socketInstance);
    
    socketInstance.on('connect', () => {
      console.log('Connected to server');
      setError(null);
    });
    
    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
      setError('Connection lost. Reconnecting...');
    });
    
    socketInstance.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Failed to connect to server');
    });
    
    socketInstance.on('new-feed', (newFeed) => {
      console.log('New feed received!', newFeed);
      setFeeds(prevFeeds => [newFeed, ...prevFeeds]);
      setLastUpdate(new Date());
    });
    
    fetchFeeds();
    
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);
  
  const fetchFeeds = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/feed/getfeeds');
      setFeeds(response.data);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load feeds. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && feeds.length === 0) {
    return (
      <div className="spinner">
        <div className="spinner-circle"></div>
      </div>
    );
  }
  
  return (
    <div>
      <nav className="navbar">
        <h1>SyncUp Feed</h1>
        <div className="nav-links">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/admin" className="btn-primary">Admin Panel</Link>
        </div>
      </nav>
      
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' }}>Live Feed</h2>
            {lastUpdate && (
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            )}
          </div>
          <button onClick={fetchFeeds} className="btn-secondary">
            Refresh
          </button>
        </div>
        
        {error && (
          <div className="alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {socket && socket.connected && (
          <div className="live-indicator">
            <div className="live-dot"></div>
            Live: Connected to real-time updates
          </div>
        )}
        
        {feeds.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>No feeds yet.</p>
            <p style={{ color: '#9ca3af', marginTop: '0.5rem' }}>Go to Admin Panel to create your first feed!</p>
          </div>
        ) : (
          feeds.map((feed) => (
            <div key={feed._id} className="feed-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 className="feed-title">{feed.title}</h3>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  {new Date(feed.created_date).toLocaleDateString()}
                </span>
              </div>
              <p className="feed-content">{feed.content}</p>
              <div className="feed-meta">
                <span>👤 {feed.author}</span>
                <span>•</span>
                <span>🕒 {new Date(feed.created_date).toLocaleTimeString()}</span>
              </div>
            </div>
          ))
        )}
        
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
          <p>Total feeds: {feeds.length} | Real-time updates via WebSocket</p>
        </div>
      </div>
    </div>
  );
}