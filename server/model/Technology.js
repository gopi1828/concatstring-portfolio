const mongoose = require('mongoose');

const technologySchema = new mongoose.Schema(
	{
		name: { type: String, required: true, unique: true, trim: true, index: true },
		description: { type: String },
		category: { type: String },
		icon: { type: String },
		color: { type: String },
		count: { type: Number, default: 0 },
		popularity: { type: Number, min: 0, max: 100 },
		website: { type: String },
	},
	{ timestamps: true }
);

module.exports =
	mongoose.models.Technology || mongoose.model('Technology', technologySchema);


