// controllers/AddCartController.js
const BannerCard = require("../../models/BannerCard/BannerModel");
const Category = require("../../models/Category/Category");
const Product = require("../../models/ProductModel/NewModelProduct");
const SubBrands = require("../../models/SubBrand/SubBrandModel");
const { BASEURL } = require("../../utils/Constants");

const LANGID = {
  1: "IND",
  2: "JPN",
  3: "KOR",
  4: "AUS",
};

// Create a new item in the banner
exports.createBannerItem = async (req, res) => {
  try {
    const { name, description, createdBy, lang } = req.body;

    if (!name || !description || !createdBy || !lang ) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    const imageUrl = req.fileUrls ? req.fileUrls['imageFile'] : null;
    const BannerImgMobile = req.fileUrls ? req.fileUrls['ImgMobile'] : null;

    const newBanner = await BannerCard.create({
      name,
      description,
      imageUrl: req.fileUrls.imageFile[0],
      createdBy,
      lang,
    });

    res.status(200).json({ success: true, banner: newBanner });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Update an item in the banner
exports.updateBannerItem = async (req, res) => {
  try {
    const { id: bannerItemId } = req.params;
    const { name, description, isActive, createdBy, lang, link_brand } = req.body;

    // Validate required fields
    if (!name || !description || !isActive || !createdBy) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    // Check if the banner item exists
    const existingBannerItem = await BannerCard.findById(bannerItemId);

    if (!existingBannerItem) {
      return res.status(404).json({ success: false, message: "Banner item not found" });
    }

    // Extract file URLs if present
    const imageUrl = req.fileUrls ? req.fileUrls['imageFile'] : null;
    const bannerImgMobile = req.fileUrls ? req.fileUrls['ImgMobile'] : null;

    // Update the banner item fields
    existingBannerItem.name = name;
    existingBannerItem.description = description;
    existingBannerItem.isActive = isActive;
    existingBannerItem.createdBy = createdBy;
    existingBannerItem.lang = lang;
    existingBannerItem.link_brand = link_brand;

    // Update image URLs only if new files are uploaded
    if (imageUrl) {
      existingBannerItem.imageUrl = imageUrl[0];
    }
    if (bannerImgMobile) {
      existingBannerItem.banner_img_mob = bannerImgMobile;
    }

    // Save the updated banner item
    const updatedBannerItem = await existingBannerItem.save();

    res.status(200).json({ success: true, bannerItem: updatedBannerItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Delete an item from the banner
exports.deleteBannerItem = async (req, res) => {
  try {
    const bannerItemId = req.params.id;

    const existingBannerItem = await BannerCard.findById(bannerItemId);

    if (!existingBannerItem) {
      return res
        .status(404)
        .json({ success: false, message: "Banner item not found" });
    }

    // Remove the banner item from the database
    await BannerCard.deleteOne({ _id: existingBannerItem._id });

    res
      .status(200)
      .json({ success: true, message: "Banner item deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get all banner items
exports.getAllBanners = async (req, res) => {
  try {
    const { lang } = req.query;

    // Validate 'lang' parameter
    if (!lang || !LANGID[lang]) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid 'lang' parameter" });
    }
    const banners = await BannerCard.find({ lang: LANGID[lang] });


    const Categorys = await Category.find({ lang: LANGID[lang] });


    res.status(200).json({ success: true, banners, Categorys });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
exports.getBannerslist = async (req, res) => {
  try {
    const { lang } = req.query;


   
    console.log(products);
    // Validate 'lang' parameter
    if (!lang || !LANGID[lang]) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid 'lang' parameter" });
    }
    const banners = await BannerCard.find({ lang: LANGID[lang] });
    res.status(200).json({ success: true, banners });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
// Get all banner product items





// Get a specific banner item by ID
exports.getBannerById = async (req, res) => {
  try {
    const bannerId = req.params.id;
    const banner = await BannerCard.findById(bannerId);

    if (!banner) {
      return res
        .status(404)
        .json({ success: false, message: "Banner not found" });
    }

    res.status(200).json({ success: true, banner });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
