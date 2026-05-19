const Feed = require('../models/Feed');
const redis = require('../config/redis');

const CACHE_KEY = 'feeds:all';
const CACHE_TTL = 60; // 60 seconds

// Get all feeds (with Redis cache)
exports.getFeeds = async (req, res) => {
  try {
    console.log('GET /feed/getfeeds - Fetching feeds...');
    
    // Check Redis cache first
    const cachedFeeds = await redis.get(CACHE_KEY);
    
    if (cachedFeeds) {
      console.log('Returning feeds from Redis cache');
      return res.status(200).json(JSON.parse(cachedFeeds));
    }
    
    // If not in cache, fetch from MongoDB
    console.log('Cache miss - Fetching from MongoDB');
    const feeds = await Feed.find().sort({ created_date: -1 });
    
    // Store in Redis cache
    if (feeds.length > 0) {
      await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(feeds));
      console.log(`Stored ${feeds.length} feeds in Redis cache`);
    }
    
    res.status(200).json(feeds);
  } catch (error) {
    console.error('Error in getFeeds:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching feeds',
      error: error.message 
    });
  }
};

// Create new feed
exports.createFeed = async (req, res) => {
  try {
    console.log('POST /feed/createfeed - Request received');
    console.log('Request body:', req.body);
    
    const { title, content, author } = req.body;
    
    // Validation
    if (!title || !content) {
      console.log('Validation failed: Missing title or content');
      return res.status(400).json({ 
        success: false,
        message: 'Title and content are required' 
      });
    }
    
    // Create feed (let the schema handle dates)
    const feedData = {
      title: title.trim(),
      content: content.trim(),
      author: author?.trim() || 'Anonymous'
    };
    
    console.log('Creating feed with data:', feedData);
    
    const feed = new Feed(feedData);
    await feed.save();
    
    console.log('Feed saved successfully to MongoDB');
    console.log('Feed ID:', feed._id);
    console.log('Created date:', feed.created_date);
    console.log('Modified date:', feed.modified_date);
    
    // Invalidate Redis cache
    await redis.del(CACHE_KEY);
    console.log('Redis cache invalidated');
    
    // Emit real-time event via Socket.IO
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('new-feed', feed);
        console.log('Real-time update sent to all connected clients');
      } else {
        console.log('Socket.IO not available');
      }
    } catch (socketError) {
      console.log('Socket emission note:', socketError.message);
    }
    
    // Send success response
    res.status(201).json({
      success: true,
      message: 'Feed created successfully',
      data: feed
    });
    
  } catch (error) {
    console.error('Error in createFeed:', error);
    console.error('Error stack:', error.stack);
    
    // Check for specific MongoDB errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error creating feed',
      error: error.message 
    });
  }
};