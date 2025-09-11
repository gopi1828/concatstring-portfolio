const mongoose = require("mongoose");

const technologySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    description: { type: String },
    category: { type: String },
    icon: { type: String },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Technology || mongoose.model("Technology", technologySchema);
