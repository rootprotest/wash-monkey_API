// models/Faq.js
const mongoose = require('mongoose');

const QuestionAnswerSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String },
  isActive: { type: Boolean, default: true },

});

const FaqSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questionsAndAnswers: [QuestionAnswerSchema],
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lang: { type: String, required: true },
});

const Faq = mongoose.model('Faq', FaqSchema);

module.exports = Faq;
