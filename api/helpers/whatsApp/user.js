const { welcomeData, menuData } = require("../../data");


const welcomeStatusUser = {};


const UserCommander = async (client, msg) => {
  const contact = await msg.getContact();
  const welcomeMessage = welcomeData(contact.pushname);

  const MenuPrincipal = menuData();

  if (!welcomeStatusUser[msg.from]) {
    // Envoyer le message de bienvenue la première fois
    msg.reply(welcomeMessage);

    // Enregistrer l'état de bienvenue pour cet utilisateur
    welcomeStatusUser[msg.from] = true;
  } else if (!msg.isGroupMsg) {
    const userResponse = msg.body.trim();

        msg.reply(userResponse);
      
    }
};

module.exports = {
  UserCommander,
};
