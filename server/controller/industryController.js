const connectToDatabase = require("../database/config");
const Industry = require("../model/Industry");
const Portfolio = require("../model/portfolio");


exports.createIndustry = async function createIndustry(req, res) {
  try {
    await connectToDatabase();
    const { name } = req.body || {};

    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ error: "Name is required" });
    }

    const existing = await Industry.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ error: `Industry "${name.trim()}" already exists` });
    }

    const newIndustry = await Industry.create({ name: name.trim() });
    return res
      .status(201)
      .json({ message: "Industry created successfully", industry: newIndustry });
  } catch (error) {
    console.error("Create industry error:", error);
    return res.status(500).json({ error: "server error" });
  }
};

exports.getIndustry = async function getIndustry(_req, res) {
  try {
    await connectToDatabase();
    const industry = await Industry.find().sort({ createdAt: -1 }).lean();
    const industryWithCounts = await Promise.all(
      industry.map(async(ind) => {
        const count = await Portfolio.countDocuments({ industry: ind.name})
        return{
          ...ind,
          count,
        } 
      })
    )
    return res.status(200).json(industryWithCounts);
  } catch (error) { 
    console.error("Get industry error:", error);
    return res.status(500).json({ error: "server error" });
  }
};

exports.updateIndustry = async function updateIndustry(req, res) {
  try {
    await connectToDatabase();
    const { id } = req.params || {};
    const { name } = req.body || {};

    if (!id) {
      return res.status(400).json({ error: "Industry id is required" });
    }

    const updates = {};
    if (typeof name === "string" && name.trim() !== "")
      updates.name = name.trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    try {
      const updated = await Industry.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      );
      if (!updated) {
        return res.status(404).json({ error: "Industry not found" });
      }
      return res
        .status(200)
        .json({ message: "Industry updated successfully", industry: updated });
    } catch (err) {
      if (err && err.code === 11000) {
        return res.status(400).json({ error: "Industry already exists" });
      }
      console.error("Update Industry DB error:", err);
      throw err;
    }
  } catch (error) {
    console.error("Update industry error:", error);
    return res.status(500).json({ error: "Failed to update industry" });
  }
};

exports.deleteIndustry = async function deleteIndustry(req, res) {
  try {
    await connectToDatabase();
    const { id } = req.params || {};

    if (!id) {
      return res.status(400).json({ error: "Industry id is required" });
    }

    const deleted = await Industry.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Industry not found" });
    }
    return res.status(200).json({ message: "Industry deleted successfully" });
  } catch (error) {
    console.error("Delete industry error:", error);
    return res.status(500).json({ error: "Failed to delete industry" });
  }
};
