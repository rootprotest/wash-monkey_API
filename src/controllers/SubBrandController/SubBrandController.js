// controllers/SubBrandController.js
const SubBrand = require("../../models/SubBrand/SubBrandModel");

// Create a new sub brand
exports.createSubBrand = async (req, res) => {
  try {
    const { name, description, isActive, createdBy, lang, category_id ,brand_id} = req.body;

    const imageUrl = req.fileUrls ? req.fileUrls['imageFile'] : null;
   
    const newSubBrand = await SubBrand.create({
      name,
      description,
      imageUrl: imageUrl,
      isActive,
      createdBy,
      category_id,
      lang,
      brand_id
    });

    res.status(200).json({ success: true, subbrand: newSubBrand });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get all sub brands
exports.getAllSubBrands = async (req, res) => {
  try {
    const subbrands = await SubBrand.find();

    res.status(200).json({ success: true, subbrands });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get a specific sub brand by ID
exports.getSubBrandById = async (req, res) => {
  try {
    const subbrandId = req.params.id;
    const subbrand = await SubBrand.findById(subbrandId);

    if (!subbrand) {
      return res
        .status(404)
        .json({ success: false, message: "Sub Brand not found" });
    }

    res.status(200).json({ success: true, subbrand });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Update a specific sub brand by ID
exports.updateSubBrandById = async (req, res) => {
  try {
    const subbrandId = req.params.id;
    const { name, description, createdBy, lang ,category_id,brand_id} = req.body;

    // const imagePaths = req.files ? req.files.map(file => `${file.filename}`) : null;

    // Check if the sub brand exists
    const existingSubBrand = await SubBrand.findById(subbrandId);

    const imageUrl = req.fileUrls ? req.fileUrls['imageFile'] : null;


    if (!existingSubBrand) {
      return res
        .status(404)
        .json({ success: false, message: "Sub Brand not found" });
    }

    // Update the sub brand fields
    existingSubBrand.name = name;
    existingSubBrand.description = description;
     // Update image URLs only if new files are uploaded
     if (imageUrl) {
      existingSubBrand.imageUrl = imageUrl;
    }
    // existingSubBrand.imageUrl = req.fileUrls[0];
    existingSubBrand.createdBy = createdBy;
    existingSubBrand.lang = lang;
    existingSubBrand.category_id = category_id;
    existingSubBrand.brand_id = brand_id;

    // Save the updated sub brand
    const updatedSubBrand = await existingSubBrand.save();

    res.status(200).json({ success: true, subbrand: updatedSubBrand });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Delete a specific sub brand by ID
exports.deleteSubBrandById = async (req, res) => {
  try {
    const subbrandId = req.params.id;

    // Check if the sub brand exists
    const existingSubBrand = await SubBrand.findById(subbrandId);

    if (!existingSubBrand) {
      return res
        .status(404)
        .json({ success: false, message: "Sub Brand not found" });
    }

    // Remove the sub brand from the database
    await SubBrand.deleteOne({ _id: subbrandId });

    res.status(200).json({ success: true, message: "Sub Brand deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
