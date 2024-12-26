const { menuData } = require("../../data");
const logger = require('../../helpers/logger');
const { sendMessageToNumber } = require('./whatsappMessaging');
const { kycPersonCommander } = require('./kyc-person');
const { kycEnterpriseCommander } = require('./kyc-enterprise');
const { kycPersonCollectiveCommander } = require("./kyc-person-collective");
const { kycEnterpriseCollectiveCommander } = require("./kyc-enterprise-collective");
const { listAccounts } = require("../../services/account.service");
const { createPaymentIntent } = require("../../services/paymentIntent.service");
const { GainSimulationCommander } = require("./simulator");
let Steps = {};

const UserCommander = async (user, msg, client) => {
  try {
    const Menu = menuData(user.data.pseudo, user.exist);
    const listAccount = (await listAccounts(null, user.data.phoneNumber)).accounts;
    const approvedAccounts = listAccount.filter(item => item.verified === 'approved');
    const pendingAccounts = listAccount.filter(item => item.verified === 'pending');
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
              msg.reply(`*Leadership en Gestion d'Actifs: Votre Réussite, Notre Priorité*\n\nCréée en 2021, *MAKEDA Asset Management* est une Société Anonyme de droit camerounais agréée par la COSUMAF ( Commission de Surveillance du Marché Financier de l’Afrique Centrale) dans la sous-Région CEMAC ( Cameroun, Congo, Gabon, RCA, Gabon et Guinée Equatoriale).\n\nNous adoptons une approche holistique en gestion de portefeuille, alignée sur vos objectifs et valeurs, pour vous aider à atteindre un avenir financier durable et responsable. Nous créeons des véhicules transparents et sécurisés afin de financer l'économie réelle via l'accompagnement des pays de la CEMAC dans la réalisation des différents projets énergétiques, d'adduction d'eau, éducationnels, routiers, agro-alimentaires, etc. Dans le but de les rendre totalement autonomes.\n\n _Tapez # pour revenir au menu principal_`);
              Steps[msg.from]["currentMenu"] = "storyMenu";
              Steps[msg.from]["isSubMenu"] = false;
              break;
            case "2":
              msg.reply(`*Services de Gestion d'Actifs par MAKEDA Asset Management* :\n\n1. *Gestion sous Mandat* :\nVous possédez un patrimoine financier et préférez déléguer sa gestion? Optez pour notre Service de Gestion Sous Mandat.\n- Gestion basée sur votre sensibilité au risque\n- Un large univers d'investissement\n- Support client 24/7\n\n2. *Gestion Collective* :\nNous créons des fonds d'investissement pour agréger les capitaux des investisseurs individuels ou institutionnels en vue de construire des portefeuilles d'investissement offrant une diversification optimale. Ex. OPCVM (FCP, SICAV).\n- Évaluation des besoins\n- Création de véhicule d'investissement\n- Gestion et suivi des performances du véhicule d'investissement\n\n3. *Conseil Financier* :\nLa mission de Makeda est de fournir des solutions innovantes et un service de conseil exceptionnel à ses clients.\n- Définition des objectifs\n- Planification financière et Stratégie de financement\n\n_Tapez # pour revenir au menu principal_`);
              Steps[msg.from]["currentMenu"] = "serviceMenu";
              Steps[msg.from]["isSubMenu"] = false;
              break;
            case "3":
              msg.reply(`⚠  _La réglementation fait obligation aux intermédiaires financiers de collecter des informations sur la situation patrimoniale et financière de l’investisseur et sa connaissance en matière de produits financiers conformément aux règlement N°01/CEMAC/UMAC/CM du 11 avril 2016_\n\n *Veuillez noter que la création du compte peut prendre jusqu'à 7 minutes.* \n\n📋 Choisir le service pour lequel vous voulez ouvrir un compte :\n\n1. Gestion sous Mandat, tapez 1.\n2. Gestion Collective, tapez 2.\n3. Conseil Financier, tapez 3.\n\n_Tapez # pour revenir au menu principal_`);
              Steps[msg.from]["isSubMenu"] = true;
              Steps[msg.from]["currentMenu"] = "accountMenu";
              break;
            case "4":
              msg.reply(`Parrainage :\nPartagez votre code de parrainage unique pour permettre à d'autres de créer un compte sous votre parrainage chez MAKEDA Asset Management.\nEn tant que parrain, vous bénéficiez également d'avantages.\n\nVotre code de parrainage : ${user.data.referralCode}\n\n_Tapez # pour revenir au menu principal_`);
              Steps[msg.from]["isSubMenu"] = false;
              Steps[msg.from]["currentMenu"] = "referralMenu";
              break;
            case "5":
              Steps[msg.from]["isSubMenu"] = true;
              msg.reply(`📋 *Veuillez saisir votre méthode de versement*.\n\n 1-Versement périodique,Tapez 1\n 2-Versement unique,Tapez 2\n\n _Tapez # pour revenir au menu principal_`);
              Steps[msg.from]["currentMenu"] = "simulateGainMenu";
              break;
            case "6":
              let result = '*Voici la liste des comptes que vous avez créé(s)* : \n\n';
              let count = 1;
              listAccount.forEach(item => {
                if (item.accountType === 'personne_morale') {
                  result += `${count}. ${item.socialName} (personne morale)\n`;
                } else if (item.accountType === 'personne_physique') {
                  result += `${count}. ${item.name}  (personne physique)\n`;
                }
                count++;
              });
              const content = listAccount.length == 0 ? `Vous n'avez pas encore souscrit à un service. Pour le faire, tapez 3 dans le menu principal.` : result;
              msg.reply(`${content} \n\n_Tapez # pour revenir au menu principal_`);
              Steps[msg.from]["isSubMenu"] = false;
              Steps[msg.from]["currentMenu"] = "myAccountMenu";
              break;
            case "7":
              let resultVersement = '';
              let countVersement = 1;
              // Add approved services to the list
              if (approvedAccounts.length > 0) {
                resultVersement += '*📋 Veuillez choisir le service pour lequel vous souhaitez faire un versement* : \n\n';
                approvedAccounts.forEach(item => {
                  resultVersement += `${countVersement}. ${item.socialName || item.name}, Tapez ${countVersement}\n`;
                  countVersement++;
                });
              }
              // Add pending services with a title if there are pending accounts
              if (pendingAccounts.length > 0) {
                if (pendingAccounts.length > 0) {
                  resultVersement += `\n*Services en attente de validation par l'équipe Makeda :* \n\n`;
                }
                pendingAccounts.forEach(item => {
                  resultVersement += `- ${item.socialName || item.name}\n`;
                });

                // Message indicating when the user can make a deposit for pending services
                const pendingMessage = pendingAccounts.length === 1
                  ? `\nVous pourrez faire un versement dès qu'il sera approuvé.`
                  : `\nVous pourrez faire un versement dès qu'ils seront approuvés.`;

                resultVersement += pendingMessage;
              }
              // If there are no approved or pending accounts, display an alternative message
              const contentVersement = approvedAccounts.length === 0 && pendingAccounts.length === 0
                ? `Vous n'avez pas encore souscrit à un service pour effectuer un versement. Pour le faire, tapez 3 dans le menu principal.`
                : resultVersement;
              msg.reply(`${contentVersement} \n\n_Tapez # pour revenir au menu principal_`);
              Steps[msg.from]["currentMenu"] = "versementMenu";
              Steps[msg.from]["isSubMenu"] = true;
              break;
            case "#":
              Steps[msg.from]["currentMenu"] = "mainMenu";
              Steps[msg.from]["isSubMenu"] = true;
              msg.reply(Menu);
              break;

            case "noel":
              const messageNoel = `Bienvenue chez MAKEDA! \n
Nous vous remercions pour votre fidélité. \n
Veuillez envoyer vos cordonnées, pour participer à notre Tombola de Noël.\n
Nous avons hâte de vous compter  parmi les gagnants. \n\n\n
Welcome to MAKEDA! \n
Thank you for your loyalty.\n
Please send your contact details to participate in our Christmas Raffle.\n
We look forward to counting you among the winners.`
              await sendMessageToNumber(client, user.data.phoneNumber, messageNoel);
              break;
            default:
              if (typeof Steps[msg.from]["addAccount"] == 'undefined') {
                msg.reply(`Veuillez choisir un menu valide ci-dessus`);
              }
              await sendMessageToNumber(client, user.data.phoneNumber, Menu);
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
              await sendMessageToNumber(client, user.data.phoneNumber, "Gestion sur mesure avec conditions définies dans le cadre d’un mandat de gestion avec vous.\n Caractéristiques :\n - Signature de la convention de gestion\n - Capital minimum : 100 Millions de XAF\n - Rendement escompté : A négocier\n - Performance : A négocier\n - Horizon de placement minimum : 3 ans\n - Marché ciblé : Marché monétaire, Marché financier et Marché hors cote\n\n📋 *Vous êtes* : \n 1-Personne physique , Tapez 1 \n 2-Personne morale , Tapez 2");
              Steps[msg.from]["currentMenu"] = "accountTypeMenu";
              break;
            case "2":
              Steps[msg.from]["addAccount"]["service"] = "Gestion Collective";
              await sendMessageToNumber(client, user.data.phoneNumber, "Gestion mutualisée à travers des organismes de placement collectif, Création des véhicules d'investissement \n *Avantages pour le souscripteur:*\n - Diversification du portefeuille\n - Rendement Optimal\n - Optimisation fiscale\n - Construction du capital pour un projet\n - Planification des Études des enfants\n - la flexibilité du titre ( liquidité : vous pouvez entrer et sortir à tout moment)\n - Gestion assurée par des Professionnels de la Finance\n - La transparence de l'information et la possibilité de participer à des marchés financiers auxquels vous n'aurait pas accès individuellement\n - la transmission du patrimoine\n\n📋 *Vous êtes* : \n 1-Personne physique , Tapez 1 \n 2-Personne morale , Tapez 2");
              Steps[msg.from]["currentMenu"] = "accountTypeMenu";
              break;
            case "3":
              Steps[msg.from]["addAccount"]["service"] = "Conseil Financier";
              await sendMessageToNumber(client, user.data.phoneNumber, "📋 *Vous êtes* : \n 1-Personne physique , Tapez 1 \n 2-Personne morale , Tapez 2");
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
                  msg.reply(`Veuillez choisir un menu valide ci-dessus\n\n_Tapez # pour revenir au menu principal_`);
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
              if (Steps[msg.from]["addAccount"]["service"] === "Gestion Collective") {
                await sendMessageToNumber(client, user.data.phoneNumber, `é𝗍𝖺𝗉𝖾 1/34\n\nVeuillez saisir votre nom et prénom.\n\n_𝖳𝖺𝗉𝖾𝗓 # 𝗉𝗈𝗎𝗋 𝗋𝖾𝗏𝖾𝗇𝗂𝗋 𝖺𝗎 𝗆𝖾𝗇𝗎 𝗉𝗋𝗂𝗇𝖼𝗂𝗉𝖺𝗅._`);
              }
              else {
                await sendMessageToNumber(client, user.data.phoneNumber, `é𝗍𝖺𝗉𝖾 1/29\n\nVeuillez saisir votre nom et prénom.\n\n_𝖳𝖺𝗉𝖾𝗓 # 𝗉𝗈𝗎𝗋 𝗋𝖾𝗏𝖾𝗇𝗂𝗋 𝖺𝗎 𝗆𝖾𝗇𝗎 𝗉𝗋𝗂𝗇𝖼𝗂𝗉𝖺𝗅._`);
              }
              break;
            case "2":
              (Steps[msg.from]["currentMenu"] = "enterpriseMenu");
              if (Steps[msg.from]["addAccount"]["service"] === "Gestion Collective") {
                await sendMessageToNumber(client, user.data.phoneNumber, `é𝗍𝖺𝗉𝖾 1/32\n\nVeuillez saisir votre Dénomination sociale.\n\n_𝖳𝖺𝗉𝖾𝗓 # 𝗉𝗈𝗎𝗋 𝗋𝖾𝗏𝖾𝗇𝗂𝗋 𝖺𝗎 𝗆𝖾𝗇𝗎 𝗉𝗋𝗂𝗇𝖼𝗂𝗉𝖺𝗅._`);
              }
              else {
                await sendMessageToNumber(client, user.data.phoneNumber, `é𝗍𝖺𝗉𝖾 1/27\n\nVeuillez saisir votre Dénomination sociale.\n\n_𝖳𝖺𝗉𝖾𝗓 # 𝗉𝗈𝗎𝗋 𝗋𝖾𝗏𝖾𝗇𝗂𝗋 𝖺𝗎 𝗆𝖾𝗇𝗎 𝗉𝗋𝗂𝗇𝖼𝗂𝗉𝖺𝗅._`);
              }
              break;
          }
          break;

        case "personMenu":
          if (msg.body == "#") {
            Steps[msg.from]["currentMenu"] = "mainMenu";
            Steps[msg.from]["isSubMenu"] = true;
            await sendMessageToNumber(client, user.data.phoneNumber, Menu);
          } else {
            if (Steps[msg.from]["addAccount"]["service"] === "Gestion Collective") {
              await kycPersonCollectiveCommander(user, msg, client, Steps[msg.from]["addAccount"]["service"]);
            }
            else {
              await kycPersonCommander(user, msg, client, Steps[msg.from]["addAccount"]["service"]);
            }
          }
          break;
        case "enterpriseMenu":
          if (msg.body == "#") {
            Steps[msg.from]["currentMenu"] = "mainMenu";
            Steps[msg.from]["isSubMenu"] = true;
            await sendMessageToNumber(client, user.data.phoneNumber, Menu);
          } else {
            if (Steps[msg.from]["addAccount"]["service"] === "Gestion Collective") {
              await kycEnterpriseCollectiveCommander(user, msg, client, Steps[msg.from]["addAccount"]["service"]);
            }
            else {
              await kycEnterpriseCommander(user, msg, client, Steps[msg.from]["addAccount"]["service"]);
            }
          }
          break;
        case "simulateGainMenu":
          if (msg.body == "#") {
            Steps[msg.from]["currentMenu"] = "mainMenu";
            Steps[msg.from]["isSubMenu"] = true;
            await sendMessageToNumber(client, user.data.phoneNumber, Menu);
          } else {
            await GainSimulationCommander(user, msg, client);
          }
          break;
        case "versementMenu":
          if (Steps[msg.from]["currentMenu"] === "versementMenu") {
            const selectedIndex = parseInt(msg.body.trim()) - 1;
            if (!isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex < approvedAccounts.length) {
              const selectedAccount = approvedAccounts[selectedIndex];
              const accountDetails = [
                { label: 'Nom', value: selectedAccount.socialName || selectedAccount.name },
                { label: 'Service', value: selectedAccount.service },
                { label: 'Type compte', value: selectedAccount.accountType },
                { label: 'Type produit', value: selectedAccount.typeProductFCP },
                { label: 'Montant initial', value: selectedAccount.initialAmountFCP },
                { label: 'Frequence FCP', value: selectedAccount.frequenceFCP },
                { label: 'Versement FCP', value: selectedAccount.versementFCP }
              ];
              const accountDetailsMessage = accountDetails
                .filter(detail => detail.value)
                .map(detail => `*${detail.label} :* ${detail.value}`)
                .join('\n');

              const paymentLinkMessage = `\n\nCliquez ici pour faire un versement : https://goto.maviance.info/v1/qg3-sTUSR \n\n_Tapez # pour revenir au menu principal_`;
              msg.reply(`Détails du compte sélectionné :\n\n${accountDetailsMessage}${paymentLinkMessage}`);
              const versement = await createPaymentIntent({
                "account": selectedAccount.id,
                "description": `demande de versement pour le service  ${selectedAccount.service} au nom de ${selectedAccount.socialName || selectedAccount.name}`
              }, client)

            } else {
              Steps[msg.from]["currentMenu"] = "mainMenu";
              msg.reply(`Numéro de compte invalide. Veuillez entrer un numéro de compte valide pour afficher les détails.\n\n_Tapez # pour revenir au menu principal_`);
            }
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
    msg.reply(`Une erreur interne du serveur s'est produite suite à une action de l'utilisateur : ${user.data.pseudo}. Notre équipe y travaille.\n\n_Tapez # pour revenir au menu principal._`);
  }
};

module.exports = {
  UserCommander
};
