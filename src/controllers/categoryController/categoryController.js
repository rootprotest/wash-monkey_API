// controllers/categoryController.js
const Category = require("../../models/Category/Category");
const {BASEURL} = require("../../utils/Constants")

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, isActive, createdBy, lang } = req.body;

    // Ensure req.fileUrls is properly structured
    const imageUrl = req.fileUrls ? req.fileUrls['imageFile'] : "";
    

    const newCategory = await Category.create({
      name,
      description,
      imageUrl: req.fileUrls.imageFile[0],
      isActive,
      createdBy,
      lang,
    });

    res.status(200).json({ success: true, category: newCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};


// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
   
    res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get a specific category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId);

    if (!category) {category_img_desktop
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Update a specific category by ID
exports.updateCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name, description, isActive, createdBy, lang } = req.body;

    // Check if the category exists
    const existingCategory = await Category.findById(categoryId);

    if (!existingCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Ensure req.fileUrls is properly structured
    const imageUrl = req.fileUrls ? req.fileUrls['imageFile'] : null;
    const categoryImgDesktop = req.fileUrls ? req.fileUrls['ImgDesktop'] : null;
    const categoryImgMobile = req.fileUrls ? req.fileUrls['ImgMobile'] : null;

    // Update the category fields
    existingCategory.name = name;
    existingCategory.isActive = isActive;
    existingCategory.description = description;

    // Update image URLs only if new files are uploaded
    if (imageUrl) {
      existingCategory.imageUrl = imageUrl;
    }
    if (categoryImgDesktop) {
      existingCategory.category_img_desktop = categoryImgDesktop;
    }
    if (categoryImgMobile) {
      existingCategory.category_img_mobile = categoryImgMobile;
    }

    existingCategory.createdBy = createdBy;
    existingCategory.lang = lang;

    // Save the updated category
    const updatedCategory = await existingCategory.save();

    res.status(200).json({ success: true, category: updatedCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};


// Delete a specific category by ID
exports.deleteCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Check if the category exists
    const existingCategory = await Category.findById(categoryId);

    if (!existingCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Remove the category from the database
    await Category.deleteOne({ _id: categoryId });

    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

