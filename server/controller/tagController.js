const connectToDatabase = require("../database/config");
const Tag = require("../model/Tag");

exports.createTag = async function createTag(req, res) {
  try {
    await connectToDatabase();
    const { name } = req.body || {};

    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ error: "Name is required" });
    }

    const existing = await Tag.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ error: "Tag already exists" });
    }

    const newTag = await Tag.create({ name: name.trim() });
    return res
      .status(201)
      .json({ message: "Tag created successfully", tag: newTag });
  } catch (error) {
    console.error("Create tag error:", error);
    return res.status(500).json({ error: "server error" });
  }
};

exports.getTags = async function getTags(_req, res) {
  try {
    await connectToDatabase();
    const tags = await Tag.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json(tags);
  } catch (error) {
    console.error("Get tags error:", error);
    return res.status(500).json({ error: "server error" });
  }
};

exports.updateTag = async function updateTag(req, res) {
  try {
    await connectToDatabase();
    const { id } = req.params || {};
    const { name } = req.body || {};

    if (!id) {
      return res.status(400).json({ error: "Tag id is required" });
    }

    const updates = {};
    if (typeof name === "string" && name.trim() !== "")
      updates.name = name.trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    try {
      const updated = await Tag.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      );
      if (!updated) {
        return res.status(404).json({ error: "Tag not found" });
      }
      return res
        .status(200)
        .json({ message: "Tag updated successfully", tag: updated });
    } catch (err) {
      if (err && err.code === 11000) {
        return res.status(400).json({ error: "Tag already exists" });
      }
      console.error("Update tag DB error:", err);
      throw err;
    }
  } catch (error) {
    console.error("Update tag error:", error);
    return res.status(500).json({ error: "Failed to update tag" });
  }
};

exports.deleteTag = async function deleteTag(req, res) {
  try {
    await connectToDatabase();
    const { id } = req.params || {};

    if (!id) {
      return res.status(400).json({ error: "Tag id is required" });
    }

    const deleted = await Tag.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Tag not found" });
    }
    return res.status(200).json({ message: "Tag deleted successfully" });
  } catch (error) {
    console.error("Delete tag error:", error);
    return res.status(500).json({ error: "Failed to delete tag" });
  }
};