const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    websiteLink: {
      type: String,
      trim: true,
    },
    technology: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    pageBuilder: {
      type: String,
      trim: true,
    },
    clientName: {
      type: String,
      trim: true,
    },
    clientInvoices: {
      type: [String],
      default: [],
    },
    bidPlatform: {
      type: String,
      trim: true,
    },
    bidPlatformUrl: {
      type: String,
      trim: true,
    },
    invoiceAmount: {
      type: Number,
      min: 0,
    },
    startDate: {
      type: Date,
    },
    completionDate: {
      type: Date,
    },
    testimonials: {
      type: String,
      trim: true,
    },
    tag: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Portfolio || mongoose.model('Portfolio', portfolioSchema);

