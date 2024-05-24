const { adminMenuData } = require("../../data");
const logger = require('../logger');
const { sendMessageToNumber } = require('./whatsappMessaging');

let Steps = {};
let serviceChoice;
const AdminCommander = async (user, msg,client) => {
  try {
    const Menu = adminMenuData(user.data.pseudo, user.exist);
    if (!('participant' in msg.id)) {
      if (!Steps[msg.from]) {
        Steps[msg.from] = {};
        Steps[msg.from]["currentMenu"] = "mainMenu";
        Steps[msg.from]["isSubMenu"] = true;
      }
      const currentMenu = Steps[msg.from]["currentMenu"];
      switch (currentMenu) {
        case "mainMenu":
          switch (msg.body) {
            case "1":
              msg.reply(`📋 Sélectionnez le service auquel vous souhaitez envoyer la campagne aux utilisateurs abonnés. :\n\n 1. Gestion sous Mandat, tapez 1.\n 2. Gestion Collective, tapez 2.\n 3. Conseil Financier, tapez 3. \n\n _Tapez # pour revenir au menu principal_`);
              Steps[msg.from]["currentMenu"] = "menuCampaign";
              Steps[msg.from]["isSubMenu"] = true;
              break;
            case "2":
              msg.reply(`*n `);
              Steps[msg.from]["currentMenu"] = "listAccountPeriodMenu";
              Steps[msg.from]["isSubMenu"] = false;
              break;
            case "#":
              Steps[msg.from]["currentMenu"] = "mainMenu";
              Steps[msg.from]["isSubMenu"] = true;
              msg.reply(Menu);
              break;
            default:
              Steps[msg.from]["currentMenu"] = "mainMenu";
              Steps[msg.from]["isSubMenu"] = true;
              msg.reply(`Veuillez choisir un menu valide ci-dessus`);
              await sendMessageToNumber(client, user.data.phoneNumber, Menu);

          }
          break;
          case "menuCampaign":
            serviceChoice = msg.body == 1 ? "Gestion sous Mandat" :( msg.body == 2 ? "Gestion collective" : "Conseil financier")
            msg.reply(`Veuillez lancer la campagne qui sera envoyée aux utilisateurs abonnés au service ${serviceChoice}. La campagne peut inclure un document (PDF ou image), une vidéo ou un texte. \n\n _Tapez # pour revenir au menu principal_`);
            Steps[msg.from]["currentMenu"] = "sendCampaignMenu";
          case "sendCampaignMenu":
            msg.reply(`La campagne : ${msg.body} sera envoyé aux utilisateurs du service : ${serviceChoice}`)
          case "listAccountPeriodMenu":
          break;
        default:
          Steps[msg.from]["currentMenu"] = "mainMenu";
          Steps[msg.from]["isSubMenu"] = true;
          msg.reply("Commande saisie incorrecte");
      }
    }
  } catch (error) {
    logger(client).error('Erreur rencontrée Admin', error);
    msg.reply(`An internal server error occurred due to an action by administrator : ${user.data.pseudo}. Our team is working on it. \n\n Please type # to return to the main menu.`)
  }
};

module.exports = {
  AdminCommander,
};
