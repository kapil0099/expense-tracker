const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  email: String,
  type: String, // "income" or "expense"
  amount: Number,
  category: String,
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Entry', entrySchema);