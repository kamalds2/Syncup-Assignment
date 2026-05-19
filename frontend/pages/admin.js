import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Admin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setMessage({
        type: 'error',
        text: 'Please fill in both title and content'
      });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await axios.post('http://localhost:5000/api/feed/createfeed', {
        title: formData.title.trim(),
        content: formData.content.trim(),
        author: formData.author.trim() || 'Anonymous'
      });
      
      console.log('Response:', response.data);
      
      if (response.data.success) {
        setMessage({
          type: 'success',
          text: 'Feed created successfully! It will appear in real-time on the home page.'
        });
        
        // Clear form
        setFormData({
          title: '',
          content: '',
          author: ''
        });
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Failed to create feed');
      }
    } catch (error) {
      console.error('Error creating feed:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create feed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {/* Navigation Bar */}
      <nav className="navbar">
        <h1>SyncUp Admin</h1>
        <div className="nav-links">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/admin" className="btn-primary">Admin Panel</Link>
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="container">
        <div className="form-container">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem' }}>
            Create New Feed
          </h2>
          
          {/* Message Display */}
          {message && (
            <div className={message.type === 'success' ? 'alert-success' : 'alert-error'}>
              {message.text}
            </div>
          )}
          
          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Title Field */}
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Title <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter feed title"
                maxLength="100"
                className="form-input"
                required
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                {formData.title.length}/100 characters
              </p>
            </div>
            
            {/* Content Field */}
            <div className="form-group">
              <label htmlFor="content" className="form-label">
                Content <span style={{ color: 'red' }}>*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Write your feed content here..."
                rows="6"
                maxLength="1000"
                className="form-textarea"
                required
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                {formData.content.length}/1000 characters
              </p>
            </div>
            
            {/* Author Field */}
            <div className="form-group">
              <label htmlFor="author" className="form-label">
                Author (Optional)
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="Your name or anonymous"
                maxLength="50"
                className="form-input"
              />
            </div>
            
            {/* Submit Button */}
            <div style={{ paddingTop: '1rem' }}>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%' }}
              >
                {loading ? 'Creating...' : 'Create Feed'}
              </button>
            </div>
          </form>
             </div>
      </div>
    </div>
  );
}