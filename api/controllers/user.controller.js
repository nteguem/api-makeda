const userService = require('../services/user.service');
const ResponseService = require('../services/response.service');

const getAllUser = async (req, res) => {
  const response = await userService.list()
  if (response.success) {
    return ResponseService.success(res, { users: response.users });
  } else {
    return ResponseService.internalServerError(res, { error: response.error });
  }
};

const login = async (req, res) => {
  const { phoneNumber, password } = req.body;
  const response = await userService.login(phoneNumber, password);
  if (response.success) {
    return ResponseService.success(res, { token: response.token });
  } else {
    return ResponseService.unauthorized(res, { error: response.error });
  }
};

module.exports = {
  getAllUser,
  login,
};
