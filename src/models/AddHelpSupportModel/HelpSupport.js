const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String, // 'user' or 'admin'
    required: true
  },
  content: {
    type: String,
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
});

const helpSupportSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  issue: {
    type: String,
    required: true
  },
  subIssue: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  messages: [messageSchema] // 💬 Message thread between user & support
});

module.exports = mongoose.model('HelpSupport', helpSupportSchema);
