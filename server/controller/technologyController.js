const connectToDatabase = require('../database/config');
const Technology = require('../model/Technology');

exports.listTechnologies = async function listTechnologies(_req, res) {
	try {
		await connectToDatabase();
		const techs = await Technology.find({}).sort({ createdAt: -1 }).lean();
		return res.status(200).json(techs);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

exports.createTechnology = async function createTechnology(req, res) {
	try {
		await connectToDatabase();
		const { name, description, category, icon, color, website, popularity } = req.body || {};

		if (!name || typeof name !== 'string' || name.trim() === '') {
			return res.status(400).json({ message: 'Technology name is required' });
		}

		const tech = await Technology.create({
			name: name.trim(),
			description,
			category,
			icon,
			color,
			website,
			popularity,
		});
		return res.status(201).json(tech);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

exports.updateTechnology = async function updateTechnology(req, res) {
	try {
		await connectToDatabase();
		const { id } = req.params || {};
		const { name, description, category, icon, color, website, popularity } = req.body || {};

		if (!id) {
			return res.status(400).json({ message: 'Technology id is required' });
		}
		if (!name || typeof name !== 'string' || name.trim() === '') {
			return res.status(400).json({ message: 'Name is required' });
		}

		const updated = await Technology.findByIdAndUpdate(
			id,
			{ name: name.trim(), description, category, icon, color, website, popularity },
			{ new: true }
		);
		if (!updated) {
			return res.status(404).json({ message: 'Technology not found' });
		}
		return res.status(200).json(updated);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

exports.deleteTechnology = async function deleteTechnology(req, res) {
	try {
		await connectToDatabase();
		const { id } = req.params || {};
		if (!id) {
			return res.status(400).json({ message: 'Technology id is required' });
		}
		await Technology.findByIdAndDelete(id);
		return res.status(200).json({ message: 'Technology deleted' });
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};


