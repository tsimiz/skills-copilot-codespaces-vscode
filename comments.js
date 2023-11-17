// Create web server

// Import modules
const express = require('express');
const { check, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Create router
const router = express.Router();

// @route   POST api/comments
// @desc    Add comment
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('text', 'Text is required.')
        .not()
        .isEmpty(),
      check('post', 'Post is required.')
        .not()
        .isEmpty(),
      check('user', 'User is required.')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    // Check if there are any errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return error messages
      return res.status(400).json({ errors: errors.array() });
    }

    // Destructure request body
    const { text, post, user } = req.body;

    try {
      // Check if post exists
      const postExists = await Post.findById(post);
      if (!postExists) {
        // Return error message
        return res.status(404).json({ msg: 'Post not found.' });
      }

      // Check if user exists
      const userExists = await User.findById(user);
      if (!userExists) {
        // Return error message
        return res.status(404).json({ msg: 'User not found.' });
      }

      // Create new comment
      const comment = new Comment({
        text,
        post,
        user
      });

      // Save comment to database
      await comment.save();

      // Return comment
      res.json(comment);
    } catch (err) {
      // Log error to console
      console.error(err.message);
      // Return error message
      res.status(500).send('Server error.');
    }
  }
);

// @route   GET api/comments
// @desc    Get all comments
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Get all comments
    const comments = await Comment.find();

    // Return comments
    res.json(comments);
  } catch (err) {
    // Log error to