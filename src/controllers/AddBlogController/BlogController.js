// controllers/Blog.js
const Blog = require("../../models/AddBlog/AddBlogModel");

// Create a new blog
exports.createBlog = async (req, res) => {
  try {
    const { name, description, createdBy,imageUrl, lang,blog_type } = req.body;

    const newBlog = await Blog.create({
      name,
      description,
      imageUrl,
      isActive: true,
      blog_type,
      createdBy,
      lang,
    });

    res.status(200).json({ success: true, blog: newBlog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get all Blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();

    res.status(200).json({ success: true, blogs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get a specific Blog by ID
exports.getBlogById = async (req, res) => {
  try {
    const blogId = req.params.id;
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    res.status(200).json({ success: true, blog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Update a specific Blog by ID
exports.updateBlogById = async (req, res) => {
  try {
    const blogId = req.params.id;
    const { name, description,imageUrl, createdBy, lang ,blog_type } = req.body;

    // Check if the Blog exists
    const existingBlog = await Blog.findById(blogId);

    if (!existingBlog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    // Update the Blog fields
    existingBlog.name = name;
    existingBlog.description = description;
    existingBlog.blog_type = blog_type;
    existingBlog.imageUrl = imageUrl;
    existingBlog.createdBy = createdBy;
    existingBlog.lang = lang;

    // Save the updated Blog
    const updatedBlog = await existingBlog.save();

    res.status(200).json({ success: true, blog: updatedBlog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Delete a specific Blog by ID
exports.deleteBlogById = async (req, res) => {
  try {
    const blogId = req.params.id;

    // Check if the Blog exists
    const existingBlog = await Blog.findById(blogId);

    if (!existingBlog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    // Remove the Blog from the database
    await Blog.deleteOne({ _id: blogId });

    res.status(200).json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
