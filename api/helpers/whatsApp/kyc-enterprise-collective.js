const { sendMessageToNumber } = require('./whatsappMessaging');
const { uploadToCloudinary } = require("../../services/uploadFile.service");
const { sendMediaToNumber } = require("./whatsappMessaging");
const { fillPdfFields } = require("../../services/fillFormPdf.service");
const AccountService = require('../../services/account.service');
const { list } = require("../../services/user.service")
const { getRandomDelay } = require("../../helpers/utils")
const logger = require("../logger")
const {ToWords} = require('to-words');
const toWords = new ToWords({
    localeCode: 'fr-FR',
    converterOptions: {
      currency: false,
      ignoreDecimal: true,
      ignoreZeroCurrency: true,
    }
  });

// Objet pour stocker l'étape actuelle et les réponses de l'utilisateur
let userData = {};
let countCase = 0;
const pathTemplateKyc = "../../kyc-template/KYB Personne Morale.pdf"
const pathFCP = "../../kyc-template/FCP Makeda Horizon Enterprise.pdf"

// Fonction pour gérer les commandes de l'utilisateur
const kycEnterpriseCommander = async (user, msg, client, service) => {
  try {
    const phoneNumber = user.data.phoneNumber;
    const listAdmin = await list("admin");
    if (!userData[phoneNumber]) {
      userData[phoneNumber] = {
        step: 1,
        answers: {}
      };
    }
    const userInput = msg.body; // Entrée de l'utilisateur sans espaces vides
    userData[phoneNumber].answers["service"] = service;
    userData[phoneNumber].answers["user"] = user.data._id;
    userData[phoneNumber].answers["accountType"] = "personne_morale";
    if (userInput === "*") {
      // Revenir à l'étape précédente
      userData[phoneNumber].step = Math.max(userData[phoneNumber].step - 1, 1); // Ne pas descendre en dessous de l'étape 1
    }
    else {
      // Logique de gestion des étapes du formulaire KYC
      switch (userData[phoneNumber].step) {
        case 1:
          userData[phoneNumber].answers["socialName"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 2:
          // Logique pour joindre une copie des statuts
          if (msg.hasMedia && (msg.type === "image" || msg.type === "document")) {
            const media = await msg.downloadMedia();
            const bufferData = await Buffer.from(media.data, 'base64');
            const responseClodinary = await uploadToCloudinary(`${userData[phoneNumber].answers["socialName"]}_statutesCopy`, bufferData)
            userData[phoneNumber].answers["statutesCopyFile"] = responseClodinary;
            userData[phoneNumber].step++;
          }
          else {
            msg.reply("Merci de joindre une image ou un PDF.")
          }
          break;
        case 3:
          // Logique pour saisir le pays d'incorporation ou de résidence
          userData[phoneNumber].answers["incorporationCountry"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 4:
          // Logique pour saisir le numéro du registre de commerce
          userData[phoneNumber].answers["commerceRegistryNumber"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 5:
          // Logique pour joindre une copie du RCCM
          if (msg.hasMedia && (msg.type === "image" || msg.type === "document")) {
            const media = await msg.downloadMedia();
            const bufferData = await Buffer.from(media.data, 'base64');
            const responseClodinary = await uploadToCloudinary(`${userData[phoneNumber].answers["socialName"]}_RCCMFile`, bufferData)
            userData[phoneNumber].answers["RCCMFile"] = responseClodinary;
            userData[phoneNumber].step++;
          }
          else {
            msg.reply("Merci de joindre une image ou un PDF.")
          }
          break;
        case 6:
          // Logique pour saisir la date de création de l'entreprise
          userData[phoneNumber].answers["incorporationDate"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 7:
          // Logique pour saisir l'adresse email de l'entreprise
          userData[phoneNumber].answers["email"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 8:
          // Logique pour saisir le numéro de téléphone de l'entreprise
          userData[phoneNumber].answers["phoneNumber"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 9:
          // Logique pour saisir le nom  du représentant légal
          userData[phoneNumber].answers["name"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 10:
          // Logique pour saisir le prénom du représentant légal
          userData[phoneNumber].answers["firstName"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 11:
          // Logique pour sélectionner le type de représentant légal
          if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B" || userInput.toUpperCase() === "C") {
            userData[phoneNumber].answers["civility"] = userInput.toUpperCase() === "A" ? "Monsieur" : (userInput.toUpperCase() === "B" ? "Madame" : "Autre");
            userData[phoneNumber].step++;
          } else {
            msg.reply("Veuillez choisir A, B ou C.");
          }
          break;
        case 12:
          // Logique pour saisir le rôle du représentant légal
          userData[phoneNumber].answers["actingAs"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 13:
          // Logique pour saisir l'adresse complète de l'entreprise
          userData[phoneNumber].answers["address"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 14:
          // Logique pour répondre à la question sur les enquêtes
          countCase = 1;
          if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B") {
            if (userInput.toUpperCase() === "A") {
              msg.reply("Veuillez expliquer et inclure toutes les enquêtes en cours \n\n NB: respecter ce format [A]-[reponse]");
            }
            else {
              userData[phoneNumber].answers["investigationHistory"] = "Non";
              userData[phoneNumber].step++;
              countCase = 0;
            }
          }
          else if (userInput.startsWith("A")) {
            userData[phoneNumber].answers["investigationHistory"] = userInput;
            userData[phoneNumber].step++;
            countCase = 0;
          }
          else {
            msg.reply("Veuillez choisir A ou B.");
          }
          break;
        case 15:
          if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B" || userInput.toUpperCase() === "C" || userInput.toUpperCase() === "D" || userInput.toUpperCase() === "E") {
            userData[phoneNumber].answers["investmentObjective"] =
              userInput.toUpperCase() === "A" ? 'Diversification de placement' :
                userInput.toUpperCase() === "B" ? 'Placement de trésorerie' :
                  userInput.toUpperCase() === "C" ? "Revenus complémentaires" :
                    userInput.toUpperCase() === "D" ? "Rendement" : "Autres";
            userData[phoneNumber].step++;
          } else {
            msg.reply("Veuillez choisir A, B C , D ou E.");
          }
          break;
        case 16:
          if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B" || userInput.toUpperCase() === "C") {
            userData[phoneNumber].answers["investmentHorizon"] = userInput.toUpperCase() === "A" ? "Court-terme" : (userInput.toUpperCase() === "B" ? "Moyen-terme" : "Long-terme");
            userData[phoneNumber].step++;
          } else {
            msg.reply("Veuillez choisir A, B ou C.");
          }
          break;
        case 17:
          if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B" || userInput.toUpperCase() === "C") {
            userData[phoneNumber].answers["riskLevel"] = userInput.toUpperCase() === "A" ? "Faible" : (userInput.toUpperCase() === "B" ? "Moyen" : "Élevé");
            userData[phoneNumber].step++;
          } else {
            msg.reply("Veuillez choisir A, B ou C.");
          }
          break;
        case 18:
          countCase = 1;
          if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B") {
            if (userInput.toUpperCase() === "A") {
              // Si l'utilisateur choisit l'option A (Oui), demandez le nombre d'années d'expérience
              msg.reply("Veuillez fournir le nombre d'années d'expérience sur ce format [nombre d'année] (eg:10)");
            } else {
              // Si l'utilisateur choisit une autre option, enregistrez simplement la réponse
              userData[phoneNumber].answers["financialMarketExperience"] = userInput.toUpperCase() === "A" ? "Oui" : "Non";
              userData[phoneNumber].step++;
              countCase = 0;
            }
          } else if (!isNaN(userInput)) {
            // Si l'utilisateur saisit le nombre d'années d'expérience dans le format spécifié (A-[nombre d'année])
            const experienceYears = userInput.trim();
            userData[phoneNumber].answers["financialMarketExperience"] = `Oui`;
            userData[phoneNumber].answers["financialMarketExperienceNumber"] = experienceYears;
            userData[phoneNumber].step++;
            countCase = 0;
          } else {
            msg.reply("Veuillez choisir A ou B.");
          }
          break;
        case 19:
          userData[phoneNumber].answers["financialSituationLastThreeYears"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 20:
          userData[phoneNumber].answers["mainActivity"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 21:
          userData[phoneNumber].answers["secondaryActivity"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 22:
          userData[phoneNumber].answers["natureActivity"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 23:
          userData[phoneNumber].answers["receivesSubsidies"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 24:
          userData[phoneNumber].answers["bankDomiciliation"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 25:
          if (msg.hasMedia && (msg.type === "image" || msg.type === "document")) {
            const media = await msg.downloadMedia();
            const bufferData = await Buffer.from(media.data, 'base64');
            const responseClodinary = await uploadToCloudinary(`${userData[phoneNumber].answers["socialName"]}_ribFile`, bufferData)
            userData[phoneNumber].answers["ribFile"] = responseClodinary;
            userData[phoneNumber].step++;
          }
          else {
            msg.reply("Merci de joindre une image ou un PDF.")
          }
          break;
        case 26:
          if (msg.hasMedia && (msg.type === "image" || msg.type === "document")) {
            const media = await msg.downloadMedia();
            const bufferData = await Buffer.from(media.data, 'base64');
            const responseClodinary = await uploadToCloudinary(`${userData[phoneNumber].answers["socialName"]}_taxNumberCertificateFile`, bufferData)
            userData[phoneNumber].answers["taxNumberCertificateFile"] = responseClodinary;
            userData[phoneNumber].step++;
          }
          else {
            msg.reply("Merci de joindre une image ou un PDF.")
          }
          break;
        case 27:
          if (userInput == "1") {
            userData[phoneNumber].answers["typeProductFCP"] = "FCP MAKEDA HORIZON"
            userData[phoneNumber].step++;
          }
          else {
            msg.reply("Veuillez choisir 1")
          }
          break;
        case 28:
          userData[phoneNumber].answers["initialAmountFCP"] = userInput;
          userData[phoneNumber].answers["initialAmountLetterFCP"] = toWords.convert(userInput)+" FCFA";
          userData[phoneNumber].step++;
          break;
        case 29:
          if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B") {
            userData[phoneNumber].answers["methodPaiementFCP"] = userInput.toUpperCase() === "A" ? "Virement" : "Mobile money (OM|MOMO)";
            userData[phoneNumber].step++;
          } else {
            msg.reply("Veuillez choisir A, B");
          }
          break;
        case 30:
          if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B" || userInput.toUpperCase() === "C" || userInput.toUpperCase() === "D") {
            userData[phoneNumber].answers["frequenceFCP"] =
              userInput.toUpperCase() === "A" ? "Mensuelle" :
                userInput.toUpperCase() === "B" ? "Trimestrielle" :
                  userInput.toUpperCase() === "C" ? "Semestrielle" :
                    userInput.toUpperCase() === "D" ? "Annuelle" :
                      "";
            userData[phoneNumber].step++;
          } else {
            msg.reply("Veuillez choisir A, B,C ou D");
          }
          break;
        case 31:
          userData[phoneNumber].answers["versementFCP"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 32:
          if (userInput == "Valider") {
            const pdfBufferFiche = await fillPdfFields(pathTemplateKyc, userData[phoneNumber].answers)
            const responseClodinaryFiche = await uploadToCloudinary(`${userData[phoneNumber].answers["socialName"]}_fiche`, pdfBufferFiche)
            userData[phoneNumber].answers["fiche"] = (responseClodinaryFiche);
            const response = await AccountService.createAccount(userData[phoneNumber].answers);
            if (response.success) {
              userData[phoneNumber].step++;
              const pdfBase64Fiche = pdfBufferFiche.toString("base64");
              const pdfNameFiche = `${userData[phoneNumber].answers["socialName"]}_kyb`;
              const documentType = "application/pdf";
              await sendMediaToNumber(client, phoneNumber, documentType, pdfBase64Fiche, pdfNameFiche)
              for (const admin of listAdmin.users) {
                try {
                  const content = `Nouveau compte crée pour le service : ${service} ,${userData[phoneNumber].answers["accountType"]} : ${userData[phoneNumber].answers["socialName"]} \n\n consultez la fiche ci-joint.`;
                  await sendMessageToNumber(client, admin.phoneNumber, content);
                  await sendMediaToNumber(client, admin.phoneNumber, documentType, pdfBase64Fiche, pdfNameFiche)
                  const delay = getRandomDelay(5000, 15000);
                  await new Promise(resolve => setTimeout(resolve, delay));
                } catch (error) {
                  logger(client).error(`Erreur lors de l'envoi ${admin.phoneNumber}`, error);
                }
              }
            } else {
              logger(client).error("response create account:", response);
              msg.reply(`echec creation du compte!`)
            }
          }
          else {
            msg.reply(`Commande${userInput} inconnue veuillez saisir *Valider*`)
          }
          break;
        case 33:
          userData[phoneNumber] = { step: 1, answers: {} };
        default:
          if (userData[phoneNumber].step == 33) {
            msg.reply(`_𝖳𝖺𝗉𝖾𝗓 # 𝗉𝗈𝗎𝗋 𝗋𝖾𝗏𝖾𝗇𝗂𝗋 𝖺𝗎 𝗆𝖾𝗇𝗎 𝗉𝗋𝗂𝗇𝖼𝗂𝗉𝖺𝗅._`)
          }
          else {
            msg.reply("Étape inconnue.");
          }
          break;
      }
    }

    // Envoyer le message correspondant à l'étape actuelle
    const currentStepMessage = getCurrentStepMessage(userData[phoneNumber].step);
    if (currentStepMessage && countCase != 1) {
      const stepMessage = `é𝗍𝖺𝗉𝖾 ${userData[phoneNumber].step}/33\n\n${currentStepMessage}\n\n`;
      const additionalMessage = (userData[phoneNumber].step == 1 || userData[phoneNumber].step == 33) ?
        "_𝖳𝖺𝗉𝖾𝗓  # 𝗉𝗈𝗎𝗋 𝗋𝖾𝗏𝖾𝗇𝗂𝗋 𝖺𝗎 𝗆𝖾𝗇𝗎 𝗉𝗋𝗂𝗇𝖼𝗂𝗉𝖺𝗅._" :
        "_𝖳𝖺𝗉𝖾𝗓 * 𝗉𝗈𝗎𝗋 𝗋𝖾𝗏𝖾𝗇𝗂𝗋 𝖾𝗇 𝖺𝗋𝗋𝗂è𝗋𝖾, # 𝗉𝗈𝗎𝗋 𝗋𝖾𝗏𝖾𝗇𝗂𝗋 𝖺𝗎 𝗆𝖾𝗇𝗎 𝗉𝗋𝗂𝗇𝖼𝗂𝗉𝖺𝗅._";
      await sendMessageToNumber(client, phoneNumber, stepMessage + additionalMessage);
    }


  } catch (error) {
    logger(client).error("error", error);
    msg.reply(`Une erreur interne du serveur s'est produite suite à une action de l'utilisateur : ${user.data.pseudo}. Notre équipe y travaille.\n\n_Veuillez taper # pour soumettre le formulaire ou * pour revenir en arrière._`);
  }
};

// Fonction pour obtenir le message de l'étape actuelle
const getCurrentStepMessage = (step) => {
  switch (step) {
    case 1:
      return "Veuillez saisir votre Dénomination sociale.";
    case 2:
      return "Veuillez joindre une copie des statuts. \n\n NB: _joindre une image ou un document pdf_";
    case 3:
      return "Veuillez saisir le pays d'incorporation ou de résidence";
    case 4:
      return "Veuillez saisir le numéro du registre de commerce.";
    case 5:
      return "Veuillez joindre une copie du RCCM. \n\n NB: _joindre une image ou un document pdf_";
    case 6:
      return "Veuillez saisir la date de création de l'entreprise (eg:_12/12/1990_).";
    case 7:
      return "Veuillez saisir l'adresse email.";
    case 8:
      return "Veuillez saisir le numéro de téléphone (eg:_(+237)697874621_).";
    case 9:
      return "Veuillez saisir le Nom";
    case 10:
      return "Veuillez saisir le Prénom";
    case 11:
      return "📋 *Représentant légal* : \n A-Monsieur ,\n B-Madame ,\n C-Autre ,\n"
    case 12:
      return `*Agissant en qualité de* (⚠_Dûment habilité(e)s_): \n\n Veuillez saisir votre rôle`;
    case 13:
      return "Veuillez saisir l'adresse complete (eg:_Avenue du Général de Gaulle, Quartier Bonapriso, B.P. 12345, Douala, Littoral, Cameroun_).";
    case 14:
      return "📋 *Votre organisation ou l'un de ses propriétaires, administrateurs, dirigeants ou employés ont-ils fait l'objet d'enquêtes, de condamnations, d'exclusions ou de suspensions professionnelles liées à la corruption, à la fraude, au blanchiment d'argent, aux sanctions, au contrôle des exportations, à l'esclavage moderne ou à des infractions connexes ?* : \n A-Oui ,\n B-Non";
    case 15:
      return "📋 *quel objectif répond le placement envisagé ?* : \n A-Diversification de placement ,\n B-Placement de trésorerie ,\n C-Revenus complémentaires ,\n D-Rendement ,\n E-Autres";
    case 16:
      return "📋 *Horizon de placement* : \n A-Court-terme (moins de 2 ans),\n B-Moyen-terme (2-5 ans),\n C-Long-terme (Plus de 5 ans).";
    case 17:
      return "📋 *Quel est votre niveau de risque* : \n A-Faible ,\n B-Moyenne ,\n C-Élevée.";
    case 18:
      return "📋 *Avez-vous une expérience professionnelle vous permettant d’acquérir une bonne connaissance des marchés financiers ?* :\n A-Oui,\n B-Non \n *NB*: si Oui veuillez fournir le nombre d'année d'expérience sur ce format A-[nombre d'année] (eg:A-10)";
    case 19:
      return "Décrivez en une phrase votre situation financière durant les trois (03) dernières années.";
    case 20:
      return "Décrivez votre activité principale";
    case 21:
      return "Décrivez votre activité secondaire";
    case 22:
      return "Décrivez la nature de votre activité";
    case 23:
      return "L'entreprise bénéficie-t-elle parfois à des subventions privées ou d'État?";
    case 24:
      return "Veuillez saisir le nom de votre banque partenaire et domiciliation";
    case 25:
      return "Veuillez joindre le Relevé RIB. \n\n NB: _joindre une image ou un document pdf_";
    case 26:
      return "Veuillez joindre l'attestation Numéro Fiscal. \n\n NB: _joindre une image ou un document pdf_";
    case 27:
      return `Vous avez terminé de créer votre KYC. À quel type de produit souhaitez-vous souscrire ? \n\n 1-FCP MAKEDA HORIZON`;
    case 28:
      return `Nom du produit : FCP MAKEDA HORIZON\nCatégorie : Obligataire\nRendement minimum : 5% net/ an pouvant aller à la hausse selon la flexibilité du marché\nHorizon de placement recommandé : 2 ans\nMinimum de souscription : 10 Milles XAF\nProduit défiscalisé\n\nQuel est votre montant de souscription initiale ? eg:100000`;
        case 29:
      return `📋 *Quel est votre moyen de paiement ?* \n\n A-Virement \n B-Mobile money (OM|MOMO)`;
    case 30:
      return `📋 *Quelle est votre fréquence de versement et le montant souhaité ?*  \n\n A-Mensuelle \n B-Trimestrielle \n C-Semestrielle \n D-Annuelle `;
    case 31:
      return `Quel est votre montant de versement ? eg:10000 `;
    case 32:
      return "Finalisez votre inscription, Makeda Asset Management prendra rendez-vous avec vous par e-mail.\n\n saisir *Valider*";
    case 33:
      return "Votre compte a été créé avec succès, l’un de nos conseillers prendra attache avec vous pour la suite.";
    default:
      return null;
  }
};
module.exports = {
  kycEnterpriseCommander,
};