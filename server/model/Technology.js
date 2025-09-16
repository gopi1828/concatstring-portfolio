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
    category: { type: String },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Technology || mongoose.model("Technology", technologySchema);
