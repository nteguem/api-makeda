const userService = require('../services/user.service');
const ResponseService = require('../services/response.service');

const getAllUser = async (req, res) => {
  const role = req.query.role;
  const response = await userService.list(role)
  if (response.success) {
    return ResponseService.success(res, { users: response.users,total:response.total });
  } else {
    return ResponseService.internalServerError(res, { error: response.error });
  }
};

const updateUser = async (req, res) => {
  const {...updatedData} = req.body;
  const phoneNumber = req.query.phoneNumber;
  const response = await userService.update(phoneNumber, updatedData);

  if (response.success) {
    return ResponseService.success(res, { users: response.users });
  } else {
    return ResponseService.notFound(res, { message: response.error });
  }
}

const login = async (req, res) => {
  const { phoneNumber, password } = req.body;
  const response = await userService.login(phoneNumber, password);
  if (response.success) {
    return ResponseService.success(res, { token: response.token , user:response.user });
  } else {
    return ResponseService.unauthorized(res, { error: response.error });
  }
};

module.exports = {
  getAllUser,
  login,
  updateUser
};
