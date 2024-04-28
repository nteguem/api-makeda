const mongoose = require('mongoose');

const userRoles = ['admin', 'user'];

const userSchema = new mongoose.Schema({
  pseudo: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true},
  fullname: { type: String},
  location: { type: String},
  engagementLevel: { type: Number },
  role: { type: String, required: true, enum: userRoles, default: 'user' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
