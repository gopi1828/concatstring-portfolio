const dotenv = require("dotenv");
const connectToDatabase = require("../database/config");
const Portfolio = require("../model/portfolio");

dotenv.config();

exports.createPortfolio = async function createPortfolio(req, res) {
  try {
    await connectToDatabase();
    const {
      projectName,
      websiteLink,
      technology,
      category,
      industry,
      description,
      pageBuilder,
      clientInvoices,
      bidPlatform,
      bidPlatformUrl,
      invoiceAmount,
      startDate,
      completionDate,
      salesPerson,
      clientName,
      testimonials,
      tag,
    } = req.body || {};

    if (
      !projectName ||
      typeof projectName !== "string" ||
      projectName.trim() === ""
    ) {
      return res.status(400).json({ message: "projectName is required" });
    }

    const existing = await Portfolio.findOne({
      projectName: projectName.trim(),
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Project with same name already exists" });
    }

    const portfolio = await Portfolio.create({
      projectName: projectName.trim(),
      websiteLink:
        typeof websiteLink === "string" ? websiteLink.trim() : undefined,
      technology:
        typeof technology === "string" ? technology.trim() : undefined,
      category: typeof category === "string" ? category.trim() : undefined,
      industry: typeof industry === "string" ? industry.trim() : undefined,
      description:
        typeof description === "string" ? description.trim() : undefined,
      pageBuilder:
        typeof pageBuilder === "string" ? pageBuilder.trim() : undefined,

      clientInvoices: Array.isArray(clientInvoices)
        ? clientInvoices
        : undefined,
      bidPlatform:
        typeof bidPlatform === "string" ? bidPlatform.trim() : undefined,
      bidPlatformUrl:
        typeof bidPlatformUrl === "string" ? bidPlatformUrl.trim() : undefined,
      invoiceAmount:
        typeof invoiceAmount === "number" ? invoiceAmount : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      completionDate: completionDate ? new Date(completionDate) : undefined,
      salesPerson:
        typeof salesPerson === "string" ? salesPerson.trim() : undefined,
      clientName:
        typeof clientName === "string" ? clientName.trim() : undefined,
      testimonials:
        typeof testimonials === "string" ? testimonials.trim() : undefined,
      tag: Array.isArray(tag) ? tag : undefined,
    });

    return res
      .status(201)
      .json({ message: "Portfolio created successfully", portfolio });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to create portfolio", error: error.message });
  }
};

exports.getPortfolios = async function getPortfolios(req, res) {
  try {
    await connectToDatabase();
    const portfolios = await Portfolio.find({})
      .collation({ locale: "en", strength: 1 })
      .sort({ projectName: 1 }).lean();
    return res.status(200).json(portfolios);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch portfolios", error: error.message });
  }
};

exports.getPortfolioById = async function getPortfolioById(req, res) {
  try {
    await connectToDatabase();
    const { id } = req.params || {};
    if (!id) {
      return res.status(400).json({ message: "portfolio id is required" });
    }
    const portfolio = await Portfolio.findById(id);
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }
    return res.status(200).json(portfolio);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch portfolio", error: error.message });
  }
};

exports.updatePortfolioById = async function updatePortfolioById(req, res) {
  try {
    await connectToDatabase();
    const { id } = req.params || {};
    if (!id) {
      return res.status(400).json({ message: "portfolio id is required" });
    }

    const {
      projectName,
      websiteLink,
      technology,
      category,
      industry,
      description,
      pageBuilder,
      clientInvoices,
      bidPlatform,
      bidPlatformUrl,
      invoiceAmount,
      startDate,
      completionDate,
      salesPerson,
      clientName,
      testimonials,
      tag,
    } = req.body || {};

    // Check for duplicate project name if projectName is being updated
    if (
      projectName &&
      typeof projectName === "string" &&
      projectName.trim() !== ""
    ) {
      const existing = await Portfolio.findOne({
        projectName: projectName.trim(),
        _id: { $ne: id }, // Exclude current portfolio from duplicate check
      });
      if (existing) {
        return res
          .status(400)
          .json({ message: "Project with same name already exists" });
      }
    }

    const updates = {};
    if (typeof projectName === "string" && projectName.trim() !== "")
      updates.projectName = projectName.trim();
    if (typeof websiteLink === "string")
      updates.websiteLink = websiteLink.trim();
    if (typeof technology === "string") updates.technology = technology.trim();
    if (typeof category === "string") updates.category = category.trim();
    if (typeof industry === "string") updates.industry = industry.trim();
    if (typeof description === "string")
      updates.description = description.trim();
    if (typeof pageBuilder === "string")
      updates.pageBuilder = pageBuilder.trim();
    if (Array.isArray(clientInvoices)) updates.clientInvoices = clientInvoices;
    if (typeof bidPlatform === "string")
      updates.bidPlatform = bidPlatform.trim();
    if (typeof bidPlatformUrl === "string")
      updates.bidPlatformUrl = bidPlatformUrl.trim();
    if (typeof invoiceAmount === "number")
      updates.invoiceAmount = invoiceAmount;
    if (startDate) updates.startDate = new Date(startDate);
    if (completionDate) updates.completionDate = new Date(completionDate);
    if (typeof salesPerson === "string")
      updates.salesPerson = salesPerson.trim();
    if (typeof clientName === "string") updates.clientName = clientName.trim();

    if (typeof testimonials === "string")
      updates.testimonials = testimonials.trim();
    if (Array.isArray(tag)) updates.tag = tag;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    try {
      const portfolio = await Portfolio.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }

      return res
        .status(200)
        .json({ message: "Portfolio updated successfully", portfolio });
    } catch (err) {
      if (err && err.code === 11000) {
        return res.status(400).json({ message: "Project name already exists" });
      }
      throw err;
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update portfolio", error: error.message });
  }
};

exports.deletePortfolioById = async function deletePortfolioById(req, res) {
  try {
    await connectToDatabase();
    const { id } = req.params || {};
    if (!id) {
      return res.status(400).json({ message: "portfolio id is required" });
    }
    const deleted = await Portfolio.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Portfolio not found" });
    }
    return res.status(200).json({ message: "Portfolio deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete portfolio", error: error.message });
  }
};

exports.getPortfoliosByCategory = async function getPortfoliosByCategory(
  req,
  res
) {
  try {
    await connectToDatabase();
    const { category } = req.params || {};
    if (!category) {
      return res.status(400).json({ message: "category is required" });
    }
    const portfolios = await Portfolio.find({ category: category.trim() }).sort(
      { createdAt: -1 }
    );
    return res.status(200).json(portfolios);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch portfolios by category",
      error: error.message,
    });
  }
};
