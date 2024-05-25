require("dotenv").config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require("../models/user.model");
const {addUserToGroupByPhoneNumber} = require("./group.service")
const {DefaultGroupNames} = require("../data/defaultGroups");

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
      await addUserToGroupByPhoneNumber(DefaultGroupNames.GROUPE_TOUS_LES_UTILISATEURS,phoneNumber)
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

async function login(phoneNumber, password) {
  try {
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, error: 'Invalid credentials' };
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return { success: true, token ,user };
  } catch (error) { 
    return { success: false, error: error.message };
  }
}

async function update(phoneNumber, updatedData) { 
  try {
    const updatedUser = await User.findOneAndUpdate(
      { phoneNumber: phoneNumber },
      { $set: updatedData },
      { new: true } // Ceci renvoie le document mis à jour plutôt que l'ancien
    );
    if (updatedUser) {
      return {
        success: true,
        message: "Utilisateur mis à jour avec succès",
        user: updatedUser,
      };
    } else {
      return { success: false, message: "Utilisateur non trouvé" };
    }
  } catch (error) {
    return {
      success: false,
      message: "Erreur lors de la mise à jour de l'utilisateur",
    };
  }
}

async function list(role) {
  try {
    const matchStage = role ? { role } : {};

    const users = await User.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "groups",
          localField: "_id",
          foreignField: "members",
          as: "groups"
        }
      },
      {
        $project: {
          pseudo: 1,
          phoneNumber: 1,
          fullname: 1,
          location: 1,
          email: 1,
          engagementLevel: 1,
          role: 1,
          referralCode: 1,
          createdAt: 1,
          updatedAt: 1,
          groups: { $map: { input: "$groups", as: "group", in: "$$group.name" } } // Map to get group names
        }
      }
    ]);
    if (users.length > 0) {
      return { success: true, total: users.length, users: users };
    } else {
      return { success: true, total: 0, users: [] };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  save,
  login,
  list,
  update
};
