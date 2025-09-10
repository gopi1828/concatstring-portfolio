const mongoose = require("mongoose");

const IndustrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Industry || mongoose.model("Industry", IndustrySchema);
