const { adminMenuData } = require("../../data");
const logger = require('../../helpers/logger');
const { sendMessageToNumber,sendMediaToNumber } = require('./whatsappMessaging');
const { listGroups } = require("../../services/group.service");
const { createCampaign } = require("../../services/campaign.service");
const { uploadToCloudinary } = require("../../services/uploadFile.service");

let Steps = {};
let serviceChoice = [];
let name = "";
let description = "";
let totalMembers = 0;

const resetVariables = () => {
  serviceChoice = [];
  name = "";
  description = "";
  totalMembers = 0;
};

const AdminCommander = async (user, msg, client) => {
  try {
    const Menu = adminMenuData(user.data.pseudo, user.exist);
    const listGroup = (await listGroups()).groups;

    if (!('participant' in msg.id)) {
      if (!Steps[msg.from]) {
        Steps[msg.from] = {};
        Steps[msg.from]["currentMenu"] = "mainMenu";
        Steps[msg.from]["isSubMenu"] = true;
      }
      const currentMenu = Steps[msg.from]["currentMenu"];
      if (msg.body === "#") {
        Steps[msg.from]["currentMenu"] = "mainMenu";
        Steps[msg.from]["isSubMenu"] = true;
        resetVariables();
        msg.reply(Menu);
        return;
      }

      switch (currentMenu) {
        case "mainMenu":
          switch (msg.body) {
            case "1":
              let groupListMessage = "📋 Sélectionnez un ou plusieurs groupes auxquels vous souhaitez envoyer la campagne (par exemple, tapez 1 ou 1,2,5) :\n\n";
              listGroup.forEach((group, index) => {
                groupListMessage += `${index + 1}. ${group.name} (Nombre d'utilisateurs : ${group.memberCount}), tapez ${index + 1}.\n`;
              });
              groupListMessage += "\n\n _Tapez # pour revenir au menu principal_";
              msg.reply(groupListMessage);
              Steps[msg.from]["currentMenu"] = "selectGroup";
              Steps[msg.from]["isSubMenu"] = true;
              break;
            case "#":
              Steps[msg.from]["currentMenu"] = "mainMenu";
              Steps[msg.from]["isSubMenu"] = true;
              msg.reply(Menu);
              break;
            default:
              Steps[msg.from]["currentMenu"] = "mainMenu";
              Steps[msg.from]["isSubMenu"] = true;
              msg.reply(`Veuillez choisir un menu valide ci-dessus\n\n _Tapez # pour revenir au menu principal_`);
              await sendMessageToNumber(client, user.data.phoneNumber, Menu);
          }
          break;
        case "selectGroup":
          const selectedGroupIndexes = msg.body.split(',').map(num => parseInt(num.trim()) - 1);
          const validGroups = [];
          const invalidGroups = [];

          totalMembers = 0; // Reset totalMembers

          selectedGroupIndexes.forEach(index => {
            if (index >= 0 && index < listGroup.length) {
              validGroups.push({ name: listGroup[index].name, _id: listGroup[index]._id });
              totalMembers += listGroup[index].memberCount; // Ajouter le nombre de membres
            } else {
              invalidGroups.push(index + 1);
            }
          });

          if (validGroups.length > 0) {
            serviceChoice = validGroups;
            let replyMessage = `Vous avez sélectionné les groupes : ${validGroups.map(group => group.name).join(', ')}\n`;
            if (invalidGroups.length > 0) {
              replyMessage += `\nLes numéros suivants ne sont pas valides : ${invalidGroups.join(', ')}\n`;
            }
            replyMessage += `\nVeuillez entrer le titre de la campagne.\n\n _Tapez # pour revenir au menu principal_`;
            msg.reply(replyMessage);
            Steps[msg.from]["currentMenu"] = "enterTitle";
          } else {
            msg.reply(`Numéros de groupes invalides : ${invalidGroups.join(', ')}. Veuillez entrer des numéros valides séparés par des virgules.\n\n _Tapez # pour revenir au menu principal_`);
          }
          break;
        case "enterTitle":
          if (msg.hasMedia && (msg.type === "image" || msg.type === "document")) 
            {
              msg.reply(`Veuillez saisir un texte , fichier non autorisé.\n\n _Tapez # pour revenir au menu principal_`);
            }
            else
            {
              name = msg.body;
              msg.reply(`Titre enregistré : "${name}".\n\nVeuillez entrer la description de la campagne (_saisir un texte ou joindre un document_).\n\n _Tapez # pour revenir au menu principal_`);
              Steps[msg.from]["currentMenu"] = "enterDescription";
            }
          break;
        case "enterDescription":
          if (msg.hasMedia && (msg.type === "image" || msg.type === "document")) {
            const media = await msg.downloadMedia();
            const nameMedia = `${user.data.phoneNumber}_${name}`
            const bufferData = await Buffer.from(media.data, 'base64');
            const responseClodinary = await uploadToCloudinary(`${nameMedia}`, bufferData )
            description = {hasMedia:true,content:responseClodinary} ;
            await sendMediaToNumber(client,user.data.phoneNumber, media.mimetype, bufferData.toString("base64"),nameMedia, `Description enregistrée.\n\nConfirmez-vous l'envoi de la campagne aux groupes : ${serviceChoice.map(group => group.name).join(', ')} (Total des utilisateurs : ${totalMembers}) ? (Tapez OUI pour confirmer ou # pour annuler)\n\nTitre : ${name}\n\n _Tapez # pour revenir au menu principal_`)
            Steps[msg.from]["currentMenu"] = "confirmCampaign"; 
          }
          else {
            description = {hasMedia:false,content:msg.body};
            msg.reply(`Description enregistrée : "${description}".\n\nConfirmez-vous l'envoi de la campagne aux groupes : ${serviceChoice.map(group => group.name).join(', ')} (Total des utilisateurs : ${totalMembers}) ? (Tapez OUI pour confirmer ou # pour annuler)\n\nTitre : ${name}\nDescription : ${description}\n\n _Tapez # pour revenir au menu principal_`);
            Steps[msg.from]["currentMenu"] = "confirmCampaign"; 
              }
          break;
        case "confirmCampaign":
          if (msg.body.toLowerCase() === "oui") {
            await createCampaign({ name, description, type: "Instantly", groups: serviceChoice.map(group => group._id) }, client);

            msg.reply(`La campagne a été envoyée aux utilisateurs abonnés aux groupes : ${serviceChoice.map(group => group.name).join(', ')} (Total des utilisateurs : ${totalMembers}).\n\nTitre : ${name}\n\n _Tapez # pour revenir au menu principal_`);
            resetVariables();
          } else {
            msg.reply(`Envoi de la campagne annulé.\n\n _Tapez # pour revenir au menu principal_`);
            resetVariables();
          }
          Steps[msg.from]["currentMenu"] = "mainMenu";
          Steps[msg.from]["isSubMenu"] = true;
          break;
        default:
          Steps[msg.from]["currentMenu"] = "mainMenu";
          Steps[msg.from]["isSubMenu"] = true;
          msg.reply("Commande saisie incorrecte\n\n _Tapez # pour revenir au menu principal_");
      }
    }
  } catch (error) {
    logger(client).error('Erreur rencontrée Admin', error);
    msg.reply(`An internal server error occurred due to an action by administrator : ${user.data.pseudo}. Our team is working on it. \n\n Please type # to return to the main menu.`);
  }
};

module.exports = {
  AdminCommander,
};
