// routes/blogRoutes.js
const express = require('express');
const router = express.Router();
const BlogController = require('../../controllers/AddBlogController/BlogController');

// Create a new Blog
router.post('/addblog', BlogController.createBlog);

// Get all blogs
router.get('/allblogs', BlogController.getAllBlogs);

// Get a specific Blog by ID
router.get('/blog/:id', BlogController.getBlogById);

// Update a specific Blog by ID
router.put('/blog/:id', BlogController.updateBlogById);

// Delete a specific Blog by ID
router.delete('/blog/:id', BlogController.deleteBlogById);

module.exports = router;
