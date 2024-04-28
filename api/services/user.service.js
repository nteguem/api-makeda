require("dotenv").config();
const User = require("../models/user.model");



async function save(phoneNumber, contactName) {
  try {
    const user = await User.findOne({ phoneNumber: phoneNumber });
    if (!user) {
      // Case 1: User not found, create the user
      const newUser = new User({
        pseudo: contactName,
        phoneNumber: phoneNumber,
        password: process.env.DEFAULT_PASSWORD,
      });

      const user = await newUser.save();
      return {
        exist: false,
        data: user,
        message: "User created successfully.",
      };
    } else {
      // Case 2: User found, increment engagement
      user.engagementLevel = (user.engagementLevel || 0) + 1;
      await user.save();
      return {
        exist: true,
        data: user,
        message: "User already exist",
      }
    }
  } catch (error) {
    return {
      error: error,
      message: "We're sorry, but an internal server error has occurred. Our team has been alerted and is working to resolve the issue. Please try again later.",
    }
  }
}

async function listAdmin() {
  const users = await User.find({ role: 'admin' });
  if (users) {
    return { success: true, users: users };
  } else {
    return { success: false, error: 'Error getting admin users' };
  }
}

async function list(data={}) {
  try {
    const { type } = data;
    let query = {};
    if (type) {
      query = { type };
    }
    const users = await User.find(query)
    return { success: true, users: users };
  } catch (error) {
    return { success: false, error: error.message };
  }
}



module.exports = {
  save,
  listAdmin,
  list,
};
