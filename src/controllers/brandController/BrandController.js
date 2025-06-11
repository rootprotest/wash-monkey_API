// controllers/Brand.js
const Brand = require("../../models/Brand/BrandModel");

// Create a new brand
exports.createBrand = async (req, res) => {
  try {
    const { name, description, isActive, createdBy, lang, category_id } = req.body;
    console.log(req.files, req.file);

    // Ensure req.fileUrls is properly structured
    const imageUrl = req.fileUrls ? req.fileUrls['imageFile'] : null;
    const categoryImgDesktop = req.fileUrls ? req.fileUrls['ImgDesktop'] : null;
    const categoryImgMobile = req.fileUrls ? req.fileUrls['ImgMobile'] : null;

    console.log('Image URLs:', req.fileUrls);
    const newBrand = await Brand.create({
      name,
      description,
      imageUrl: imageUrl,
      isActive,
      createdBy,
      category_id,
      lang,
      banner_img: categoryImgDesktop,
      banner_mob_img: categoryImgMobile
    });

    res.status(200).json({ success: true, brand: newBrand });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get all Banner
exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find();


    res.status(200).json({ success: true, brands });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get a specific Banner by ID
exports.getBrandById = async (req, res) => {
  try {
    const brandId = req.params.id;
    const brand = await Brand.findById(brandId);

    if (!brand) {
      return res
        .status(404)
        .json({ success: false, message: "Brand not found" });
    }

    res.status(200).json({ success: true, brand });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Update a specific brand by ID
exports.updateBrandById = async (req, res) => {
  try {
    const brandId = req.params.id;
    const { name, description, createdBy, lang, category_id } = req.body;
    // Ensure req.fileUrls is properly structured
    const imageUrl = req.fileUrls ? req.fileUrls['imageFile'] : null;
    const BrandImgDesktop = req.fileUrls ? req.fileUrls['ImgDesktop'] : null;
    const BrandImgMobile = req.fileUrls ? req.fileUrls['ImgMobile'] : null;
    // Check if the brand exists
    const existingBrand = await Brand.findById(brandId);

    if (!existingBrand) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    // Update only the provided fields
    if (name !== undefined) existingBrand.name = name;
    if (description !== undefined) existingBrand.description = description;
    if (createdBy !== undefined) existingBrand.createdBy = createdBy;
    if (category_id !== undefined) existingBrand.category_id = category_id;
    if (lang !== undefined) existingBrand.lang = lang;


    // Update image URLs only if new files are uploaded
    if (imageUrl) {
      existingBrand.imageUrl = imageUrl;
    }
    if (BrandImgDesktop) {
      existingBrand.banner_img = BrandImgDesktop;
    }
    if (BrandImgMobile) {
      existingBrand.banner_mob_img = BrandImgMobile;
    }


    // Save the updated brand
    const updatedBrand = await existingBrand.save();

    res.status(200).json({ success: true, brand: updatedBrand });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Delete a specific brand by ID
exports.deleteBrandById = async (req, res) => {
  try {
    const brandId = req.params.id;

    // Check if the brand exists
    const existingBrand = await Brand.findById(brandId);

    if (!existingBrand) {
      return res
        .status(404)
        .json({ success: false, message: "Brand not found" });
    }

    // Remove the brand from the database
    await Brand.deleteOne({ _id: brandId });

    res.status(200).json({ success: true, message: "Brand deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
