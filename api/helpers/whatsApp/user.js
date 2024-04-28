const { menuData } = require("../../data");
const logger = require('../logger');


const UserCommander = async (user, msg,client) => {
  try {
    const Menu = menuData(user.data.pseudo, user.exist);
    if (!('participant' in msg.id)) {
      msg.reply(Menu);
    }
  } catch (error) {
    logger(client).error('Erreur rencontrée User', error);
    msg.reply(`An internal server error occurred due to an action by user : ${user.data.pseudo}. Our team is working on it. \n\n Please type # to return to the main menu.`)
  }
};

module.exports = {
  UserCommander,
};
