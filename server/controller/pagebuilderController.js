const connectToDatabase = require("../database/config");
const pagebuilder = require("../model/pagebuilder");
const portfolio = require("../model/portfolio");

exports.createPageBuilder = async function createPageBuilder(req, res) {
  try {
    await connectToDatabase();
    const { name } = req.body || {};

    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ error: "Name is required" });
    }

    const existing = await pagebuilder.findOne({ name: name.trim() });
    if (existing) {
      return res
        .status(400)
        .json({ error: `Page Builder "${name.trim()}" already exists` });
    }

    const newPageBuilder = await pagebuilder.create({ name: name.trim() });
    return res
      .status(201)
      .json({
        message: "Page Builder created successfully",
        pagebuilder: newPageBuilder,
      });
  } catch (error) {
    console.error("Create page builder error:", error);
    return res.status(500).json({ error: "server error" });
  }
};

exports.getPageBuilders = async function getPageBuilders(_req, res) {
  try {
    await connectToDatabase();
    const pagebuilders = await pagebuilder
      .find()
      .collation({ locale: "en", strength: 1 })
      .sort({ name: 1 })
      .lean();

    const pagebuildersWithCounts = await Promise.all(
      pagebuilders.map(async (pagebuilder) => {
        const count = await portfolio.countDocuments({
          pagebuilder: pagebuilder.name,
        });
        return {
          ...pagebuilder,
          count,
        };
      })
    );
    return res.status(200).json(pagebuildersWithCounts);
  } catch (error) {
    console.error("Get page builders error:", error);
    return res.status(500).json({ error: "server error" });
  }
};

exports.updatePageBuilder = async function updatePageBuilder(req, res) {
  try {
    await connectToDatabase();
    const { id } = req.params || {};
    const { name } = req.body || {};

    if (!id) {
      return res.status(400).json({ error: "Page Builder id is required" });
    }

    const updates = {};
    if (typeof name === "string" && name.trim() !== "")
      updates.name = name.trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    try {
      const updated = await pagebuilder.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      );
      if (!updated) {
        return res.status(404).json({ error: "Page Builder not found" });
      }
      return res
        .status(200)
        .json({
          message: "Page Builder updated successfully",
          pagebuilder: updated,
        });
    } catch (err) {
      if (err && err.code === 11000) {
        return res.status(400).json({ error: "Page Builder already exists" });
      }
      console.error("Update page builder DB error:", err);
      throw err;
    }
  } catch (error) {
    console.error("Update pag builder error:", error);
    return res.status(500).json({ error: "Failed to update page builder" });
  }
};

exports.deletePageBuilder = async function deletePageBuilder(req, res) {
  try {
    await connectToDatabase();
    const { id } = req.params || {};

    if (!id) {
      return res.status(400).json({ error: "Page Builder id is required" });
    }

    const deleted = await pagebuilder.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Page Builder not found" });
    }
    return res
      .status(200)
      .json({ message: "Page Builder deleted successfully" });
  } catch (error) {
    console.error("Delete page builder error:", error);
    return res.status(500).json({ error: "Failed to delete page builder" });
  }
};
