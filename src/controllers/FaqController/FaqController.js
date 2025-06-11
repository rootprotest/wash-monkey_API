// controllers/FaqController.js
const Faq = require("../../models/AddFaq/FaqModel"); // Adjust the import path based on your project structure

// Create a new FAQ
exports.createFaq = async (req, res) => {
    try {
      const { title, questionsAndAnswers, createdBy, lang } = req.body;
  
      if (!title || !questionsAndAnswers || !createdBy || !lang) {
        return res
          .status(400)
          .json({ success: false, error: "Missing required fields" });
      }
  
      const newFaq = await Faq.create({
        title,
        questionsAndAnswers,
        createdBy,
        lang,
      });
  
      res.status(200).json({ success: true, faq: newFaq });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  };
  
  // Update a FAQ by ID
  exports.updateFaq = async (req, res) => {
    try {
      const faqId = req.params.id;
      const { title, questionsAndAnswers, createdBy, lang } = req.body;
  
      if (!title || !questionsAndAnswers || !createdBy || !lang) {
        return res
          .status(400)
          .json({ success: false, error: "Missing required fields" });
      }
  
      const existingFaq = await Faq.findByIdAndUpdate(
        faqId,
        {
          title,
          questionsAndAnswers,
          createdBy,
          lang,
        },
        { new: true }
      );
  
      if (!existingFaq) {
        return res.status(404).json({ success: false, message: "FAQ not found" });
      }
  
      res.status(200).json({ success: true, faq: existingFaq });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  };
  
  // Delete a FAQ by ID
  exports.deleteFaq = async (req, res) => {
    try {
      const faqId = req.params.id;
  
      const existingFaq = await Faq.findById(faqId);
  
      if (!existingFaq) {
        return res.status(404).json({ success: false, message: "FAQ not found" });
      }
  
      // Remove the FAQ from the database
      await Faq.deleteOne({ _id: existingFaq._id });
  
      res
        .status(200)
        .json({ success: true, message: "FAQ deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  };
  
  // Get all FAQs
  exports.getAllFaqs = async (req, res) => {
    try {
      const { lang } = req.query;
  
      // Validate 'lang' parameter
      if (!lang) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid 'lang' parameter" });
      }
  
      const faqs = await Faq.find({ lang });
  
      res.status(200).json({ success: true, faqs });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  };
  
  // Get a specific FAQ by ID
  exports.getFaqById = async (req, res) => {
    try {
      const faqId = req.params.id;
      const faq = await Faq.findById(faqId);
  
      if (!faq) {
        return res.status(404).json({ success: false, message: "FAQ not found" });
      }
  
      res.status(200).json({ success: true, faq });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  };