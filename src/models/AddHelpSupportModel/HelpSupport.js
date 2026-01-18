const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String, // 'user' or 'admin'
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

const helpSupportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // ✅ Reference to the User model
    ref: 'User',
  },
  ticketNumber: {
  type: String,
  unique: true,
},

  issue: {
    type: String,
  },
  subIssue: {
    type: String,
  },
  description: {
    type: String,
  },
details: {
    type: Object, // ✅ Changed from String to Object
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  messages: [messageSchema], // 💬 Message thread between user & support
});

module.exports = mongoose.model('HelpSupport', helpSupportSchema);
