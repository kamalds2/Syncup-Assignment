const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');

// GET all feeds
router.get('/feed/getfeeds', feedController.getFeeds);

// POST create feed
router.post('/feed/createfeed', feedController.createFeed);

module.exports = router;