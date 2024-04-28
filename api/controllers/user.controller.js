const userService = require('../services/user.service');


const getAllUser = async (req, res) => {
  let { phoneNumber } = req.body;
  const page = req.query.page;
  const limit = req.query.limit;
  const response = await userService.getAllUserPagination(phoneNumber || null, page, limit);

  if (response.success) {
    res.json({users: response.users, totalCount: response.totalUsers, success: true });
  } else {
    res.status(500).json({ message: 'Erreur lors de la récupération des users', error: response.error });
  }
};


module.exports = {
  getAllUser,
};
