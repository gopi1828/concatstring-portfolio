const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const connectToDatabase = require('../database/config');
const User = require('../model/User');

dotenv.config();

function signAuthToken(payload) {
	const secret = process.env.JWT_SECRETKEY || process.env.JWT_SECRET || 'dev_secret_key_change_me';
	return jwt.sign(payload, secret, { expiresIn: '2h' });
}

exports.register = async function register(req, res) {
	try {
		await connectToDatabase();
		const { name, username, password } = req.body || {};

		if (!name || !username || !password) {
			return res.status(400).json({ message: 'name, username and password are required' });
		}

		const existing = await User.findOne({ username });
		if (existing) {
			return res.status(400).json({ message: 'Username already exists' });
		}

		const salt = await bcryptjs.genSalt(12);
		const hashedPassword = await bcryptjs.hash(password, salt);

		const newUser = await User.create({ name, username, password: hashedPassword });

		return res.status(201).json({ message: 'User registered successfully', user: { id: newUser._id, username: newUser.username, role: newUser.role, name: newUser.name } });
	} catch (error) {
		return res.status(500).json({ message: 'Something went wrong while registering', error: error.message });
	}
};

exports.login = async function login(req, res) {
	try {
		await connectToDatabase();
		const { username, password } = req.body || {};

		if (!username || !password) {
			return res.status(401).json({ message: 'Username and password are required' });
		}

		const user = await User.findOne({ username });
		if (!user) {
			return res.status(400).json({ message: 'Username does not exist' });
		}

		const validPassword = await bcryptjs.compare(password, user.password);
		if (!validPassword) {
			return res.status(400).json({ message: 'Incorrect password' });
		}

		const tokenPayload = { id: user._id, username: user.username, role: user.role };
		const token = signAuthToken(tokenPayload);

		res.cookie('token', token, {
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 2 * 1000,
			path: '/',
		});

		return res.status(200).json({ message: 'Login Successfully', token, user: tokenPayload });
	} catch (error) {
		return res.status(500).json({ message: 'Something went wrong while logging', error: error.message });
	}
};

exports.logout = async function logout(_req, res) {
	try {
		res.cookie('token', '', {
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			expires: new Date(0),
			path: '/',
		});
		return res.status(200).json({ message: 'Logout Successfully', status: true });
	} catch (error) {
		return res.status(500).json({ message: 'Something went wrong while logout', error: error.message });
	}
};

exports.getUserById = async function getUserById(req, res) {
	try {
		await connectToDatabase();
		const { id } = req.params || {};
		if (!id) {
			return res.status(400).json({ message: 'User id is required' });
		}

		const user = await User.findById(id).select('-password');
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		return res.status(200).json(user);
	} catch (error) {
		return res.status(500).json({ message: 'Something went wrong while fetching user', error: error.message });
	}
};

exports.updateUserById = async function updateUserById(req, res) {
	try {
		await connectToDatabase();
		const { id } = req.params || {};
		if (!id) {
			return res.status(400).json({ message: 'User id is required' });
		}

		const { name, username, password } = req.body || {};
		const updates = {};
		if (typeof name === 'string' && name.trim() !== '') updates.name = name.trim();
		if (typeof username === 'string' && username.trim() !== '') updates.username = username.trim();
		if (typeof password === 'string' && password.trim() !== '') {
			const salt = await bcryptjs.genSalt(12);
			updates.password = await bcryptjs.hash(password, salt);
		}

		if (Object.keys(updates).length === 0) {
			return res.status(400).json({ message: 'No valid fields to update' });
		}

		try {
			const updatedUser = await User.findByIdAndUpdate(
				id,
				{ $set: updates },
				{ new: true, runValidators: true }
			).select('-password');

			if (!updatedUser) {
				return res.status(404).json({ message: 'User not found' });
			}

			return res.status(200).json({ message: 'User updated successfully', user: updatedUser });
		} catch (err) {
			if (err && err.code === 11000) {
				return res.status(400).json({ message: 'Username already exists' });
			}
			throw err;
		}
	} catch (error) {
		return res.status(500).json({ message: 'Something went wrong while updating user', error: error.message });
	}
};


