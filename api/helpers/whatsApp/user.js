const { menuData } = require("../../data");
const logger = require('../logger');
const { sendMessageToNumber } = require('./whatsappMessaging');
const { kycPersonCommander } = require('./kyc-person');
const { kycEnterpriseCommander } = require('./kyc-enterprise');

let Steps = {};

const UserCommander = async (user, msg, client) => {
  try {
    const Menu = menuData(user.data.pseudo, user.exist);
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
              msg.reply(`*Leadership en Gestion d'Actifs: Votre Réussite, Notre Priorité*\n\nCréée en 2021, *MAKEDA Asset Management* est une Société Anonyme de droit camerounais agréée par la COSUMAF ( Commission de Surveillance du Marché Financier de l’Afrique Centrale) dans la sous-Région CEMAC ( Cameroun, Congo, Gabon, RCA, Gabon et Guinée Equatoriale).\n\nNous adoptons une approche holistique en gestion de portefeuille, alignée sur vos objectifs et valeurs, pour vous aider à atteindre un avenir financier durable et responsable. Nous créeons des véhicules transparents et sécurisés afin de financer l'économie réelle via l'accompagnement des pays de la CEMAC dans la réalisation des différents projets énergétiques, d'adduction d'eau, éducationnels, routiers, agro-alimentaires, etc. Dans le but de les rendre totalement autonomes.\n\n Tapez # pour revenir au menu principal`);
              Steps[msg.from]["currentMenu"] = "storyMenu";
              Steps[msg.from]["isSubMenu"] = false;
              break;
            case "2":
              msg.reply(`*Services de Gestion d'Actifs par MAKEDA Asset Management* :\n\n1. *Gestion sous Mandat* :\nVous possédez un patrimoine financier et préférez déléguer sa gestion? Optez pour notre Service de Gestion Sous Mandat.\n- Gestion basée sur votre sensibilité au risque\n- Un large univers d'investissement\n- Support client 24/7\n\n2. *Gestion Collective* :\nNous créons des fonds d'investissement pour agréger les capitaux des investisseurs individuels ou institutionnels en vue de construire des portefeuilles d'investissement offrant une diversification optimale. Ex. OPCVM (FCP, SICAV).\n- Évaluation des besoins\n- Création de véhicule d'investissement\n- Gestion et suivi des performances du véhicule d'investissement\n\n3. *Conseil Financier* :\nLa mission de Makeda est de fournir des solutions innovantes et un service de conseil exceptionnel à ses clients.\n- Définition des objectifs\n- Planification financière et Stratégie de financement\n\nTapez # pour revenir au menu principal`);
              Steps[msg.from]["currentMenu"] = "serviceMenu";
              Steps[msg.from]["isSubMenu"] = false;
              break;
            case "3":
              msg.reply(`⚠  _La réglementation fait obligation aux intermédiaires financiers de collecter des informations sur la situation patrimoniale et financière de l’investisseur et sa connaissance en matière de produits financiers conformément aux règlement N°01/CEMAC/UMAC/CM du 11 avril 2016_\n*Choisir le service pour lequel vous voulez ouvrir un compte* :\n\n1. Gestion sous Mandat, tapez 1.\n2. Gestion Collective, tapez 2.\n3. Conseil Financier, tapez 3.\n\nTapez # pour revenir au menu principal`);
              Steps[msg.from]["isSubMenu"] = true;
              Steps[msg.from]["currentMenu"] = "accountMenu";
              break;
            case "4":
              msg.reply(`Parrainage :\nPartagez votre code de parrainage unique pour permettre à d'autres de créer un compte sous votre parrainage chez MAKEDA Asset Management.\nEn tant que parrain, vous bénéficiez également d'avantages.\n\nVotre code de parrainage : 14GNR\n\nTapez # pour revenir au menu principal`);
              Steps[msg.from]["isSubMenu"] = false;
              Steps[msg.from]["currentMenu"] = "referralMenu";
              break;
            case "5":
              msg.reply("Simulation des gains");
              Steps[msg.from]["isSubMenu"] = true;
              Steps[msg.from]["currentMenu"] = "simulateGainMenu";
              break;
            case "6":
              msg.reply(`Vous n'avez pas encore souscris a un service pour le faire Tapez 3. \n\nTapez # pour revenir au menu principal`);
              Steps[msg.from]["isSubMenu"] = false;
              Steps[msg.from]["currentMenu"] = "myAccountMenu";
              break;
            case "#":
              Steps[msg.from]["currentMenu"] = "mainMenu";
              Steps[msg.from]["isSubMenu"] = true;
              msg.reply(Menu);
              break;
            default:
              if (typeof Steps[msg.from]["addAccount"] == 'undefined') {
                msg.reply(`Veuillez choisir un menu valide ci-dessus`);
              }
          }
          break;

        case "accountMenu":
          if (!Steps[msg.from]["addAccount"]) {
            Steps[msg.from]["addAccount"] = {};
            Steps[msg.from]["stepCreate"] = 0;
          }
          switch (msg.body) {
            case "1":
              Steps[msg.from]["addAccount"]["service"] = "Gestion sous Mandat";
              await sendMessageToNumber(client, user.data.phoneNumber, "*Vous êtes* : \n 1-Personne physique , Tapez 1 \n 2-Personne morale , Tapez 2");
              Steps[msg.from]["currentMenu"] = "accountTypeMenu";
              break;
            case "2":
              Steps[msg.from]["addAccount"]["service"] = "Gestion Collective";
              await sendMessageToNumber(client, user.data.phoneNumber, "*Vous êtes* : \n 1-Personne physique , Tapez 1 \n 2-Personne morale , Tapez 2");
              Steps[msg.from]["currentMenu"] = "accountTypeMenu";
              break;
            case "3":
              Steps[msg.from]["addAccount"]["service"] = "Conseil Financier";
              await sendMessageToNumber(client, user.data.phoneNumber, "*Vous êtes* : \n 1-Personne physique , Tapez 1 \n 2-Personne morale , Tapez 2");
              Steps[msg.from]["currentMenu"] = "accountTypeMenu";
              break;
            case "#":
              Steps[msg.from]["currentMenu"] = "mainMenu";
              Steps[msg.from]["isSubMenu"] = true;
              msg.reply(Menu);
              break;
            default:
              if (Steps[msg.from]["isSubMenu"]) {
                if (typeof Steps[msg.from]["addAccount"] == 'undefined') {
                  msg.reply(`Veuillez choisir un menu valide ci-dessus\n\nTapez # pour revenir au menu principal`);
                }
              }
              else {
                msg.reply("Commande saisie incorrecte");
                await sendMessageToNumber(client, user.data.phoneNumber, Menu);
              }
          }
          break;

        case "accountTypeMenu":
          switch (msg.body) {
            case "1":
              (Steps[msg.from]["currentMenu"] = "personMenu");
              await sendMessageToNumber(client, user.data.phoneNumber, `é𝗍𝖺𝗉𝖾 1/24\n\nVeuillez saisir le nom complet de la personne en charge de l'investissement.\n\n𝖳𝖺𝗉𝖾𝗓 * 𝗉𝗈𝗎𝗋 𝗋𝖾𝗏𝖾𝗇𝗂𝗋 𝖾𝗇 𝖺𝗋𝗋𝗂è𝗋𝖾, # 𝗉𝗈𝗎𝗋 𝗋𝖾𝗏𝖾𝗇𝗂𝗋 𝖺𝗎 𝗆𝖾𝗇𝗎 𝗉𝗋𝗂𝗇𝖼𝗂𝗉𝖺𝗅.`);
              break;
            case "2":
               (Steps[msg.from]["currentMenu"] = "enterpriseMenu");
               await sendMessageToNumber(client, user.data.phoneNumber, `é𝗍𝖺𝗉𝖾 1/25\n\nVeuillez saisir la Dénomination sociale en charge de l'investissement.\n\n𝖳𝖺𝗉𝖾𝗓 * 𝗉𝗈𝗎𝗋 𝗋𝖾𝗏𝖾𝗇𝗂𝗋 𝖾𝗇 𝖺𝗋𝗋𝗂è𝗋𝖾, # 𝗉𝗈𝗎𝗋 𝗋𝖾𝗏𝖾𝗇𝗂𝗋 𝖺𝗎 𝗆𝖾𝗇𝗎 𝗉𝗋𝗂𝗇𝖼𝗂𝗉𝖺𝗅.`);
               break; 
          }
          break;

         case "personMenu":   
          if (msg.body == "#") {
            Steps[msg.from]["currentMenu"] = "mainMenu";
            Steps[msg.from]["isSubMenu"] = true;
            await sendMessageToNumber(client, user.data.phoneNumber, Menu);
          } else {
            await kycPersonCommander(user, msg, client,Steps[msg.from]["addAccount"]["service"]);
          }
            break;
         case "enterpriseMenu":
          if (msg.body == "#") {
            Steps[msg.from]["currentMenu"] = "mainMenu";
            Steps[msg.from]["isSubMenu"] = true;
            await sendMessageToNumber(client, user.data.phoneNumber, Menu);
          } else {
            await kycEnterpriseCommander(user, msg, client,Steps[msg.from]["addAccount"]["service"]);
          }
            break;
        default:
          Steps[msg.from]["currentMenu"] = "mainMenu";
          Steps[msg.from]["isSubMenu"] = true;
          if (msg.body == "#") {
            await sendMessageToNumber(client, user.data.phoneNumber, Menu);
          } else {
            msg.reply("Commande saisie incorrecte");
            await sendMessageToNumber(client, user.data.phoneNumber, Menu);
          }
      }
    }
  } catch (error) {
    logger(client).error('Erreur rencontrée User', error);
    msg.reply(`Une erreur interne du serveur s'est produite suite à une action de l'utilisateur : ${user.data.pseudo}. Notre équipe y travaille.\n\nVeuillez taper # pour revenir au menu principal.`);
  }
};

module.exports = {
  UserCommander,
  Steps
};
