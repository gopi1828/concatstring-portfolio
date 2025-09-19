const dotenv = require("dotenv");
const connectToDatabase = require("../database/config");
const Category = require("../model/category");
const Portfolio = require("../model/portfolio");

dotenv.config();

exports.createCategory = async function createCategory(req, res) {
  try {
    await connectToDatabase();
    const { name, count } = req.body || {};

    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ message: "name is required" });
    }

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: "Category name already exists" });
    }

    const category = await Category.create({
      name: name.trim(),
      count: typeof count === "number" ? count : undefined,
    });

    return res
      .status(201)
      .json({ message: "Category created successfully", category });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to create category", error: error.message });
  }
};

exports.getCategories = async function getCategories(_req, res) {
  try {
    await connectToDatabase();
    const categories = await Category.find({})
    .collation({ locale: "en", strength: 1 })
    .sort({ name: 1 });

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Portfolio.countDocuments({ category: cat.name });
        return {
          ...cat.toObject(),
          count,
        }
      })
    );
    return res.status(200).json(categoriesWithCount);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch categories", error: error.message });
  }
};

exports.getCategoryById = async function getCategoryById(req, res) {
  try {
    await connectToDatabase();
    const { id } = req.params || {};
    if (!id) {
      return res.status(400).json({ message: "category id is required" });
    }
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    return res.status(200).json(category);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch category", error: error.message });
  }
};

exports.updateCategoryById = async function updateCategoryById(req, res) {
  try {
    await connectToDatabase();
    const { id } = req.params || {};
    if (!id) {
      return res.status(400).json({ message: "category id is required" });
    }

    const { name, count } = req.body || {};
    const updates = {};
    if (typeof name === "string" && name.trim() !== "")
      updates.name = name.trim();
    if (typeof count === "number") updates.count = count;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    try {
      const category = await Category.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      return res
        .status(200)
        .json({ message: "Category updated successfully", category });
    } catch (err) {
      if (err && err.code === 11000) {
        return res
          .status(400)
          .json({ message: "Category name already exists" });
      }
      throw err;
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update category", error: error.message });
  }
};

exports.deleteCategoryById = async function deleteCategoryById(req, res) {
  try {
    await connectToDatabase();
    const { id } = req.params || {};
    if (!id) {
      return res.status(400).json({ message: "category id is required" });
    }
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }
    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete category", error: error.message });
  }
};
