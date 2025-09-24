const mongoose = require("mongoose");

const pagebuilderSchema = new mongoose.Schema(
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

module.exports =
  mongoose.models.PageBuilder ||
  mongoose.model("PageBuilder", pagebuilderSchema);
