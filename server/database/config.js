const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

let isConnected = false;

async function connectToDatabase() {
	if (isConnected) {
		return mongoose.connection;
	}

	const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/concatstring_portfolio';

	mongoose.set('strictQuery', true);

	await mongoose.connect(mongoUri, {
		// keep options minimal for modern mongoose
	});

	isConnected = true;
	return mongoose.connection;
}

module.exports = connectToDatabase;


