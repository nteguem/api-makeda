const { sendMessageToNumber } = require('./whatsappMessaging');
const AccountService = require('../../services/account.service');
const { uploadToCloudinary } = require("../../services/uploadFile.service");
const { sendMediaToNumber } = require("./whatsappMessaging");
const { fillPdfFields } = require("../../services/fillFormPdf.service");
const {list} = require("../../services/user.service")
const { getRandomDelay } = require("../../helpers/utils")

// Objet pour stocker l'étape actuelle et les réponses de l'utilisateur
let userData ={};
let countCase = 0;
const pathTemplateKyc = "../../kyc-template/KYC Personne Physique.pdf"

// Fonction pour gérer les commandes de l'utilisateur
const kycPersonCommander = async (user, msg, client, service) => {
  try {
    const phoneNumber = user.data.phoneNumber;
    const listAdmin = await list("admin");
    if (!userData[phoneNumber]) {
      userData[phoneNumber] = {
        step: 1,
        answers: {} 
      };
    }
    const userInput = msg.body; 
    userData[phoneNumber].answers["service"] = service;
    userData[phoneNumber].answers["user"] = user.data._id;
    userData[phoneNumber].answers["accountType"] = "personne_physique";

    if (userInput === "*") { 
      userData[phoneNumber].step = Math.max(userData[phoneNumber].step - 1, 1); // Ne pas descendre en dessous de l'étape 1
    }
    else {
      // Logique de gestion des étapes du formulaire KYC
      switch (userData[phoneNumber].step) {
        case 1:
          userData[phoneNumber].answers["name"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 2:
          userData[phoneNumber].answers["firstName"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 3:
          if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B" || userInput.toUpperCase() === "C") {
            userData[phoneNumber].answers["civility"] = userInput.toUpperCase() === "A" ? "Monsieur" : (userInput.toUpperCase() === "B" ? "Madame" : "Autres");
            userData[phoneNumber].step++;
          } else {
            msg.reply("Veuillez choisir A, B ou C.");
          }
          break;
        case 4:
          userData[phoneNumber].answers["dateOfBirth"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 5:
          userData[phoneNumber].answers["placeOfBirth"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 6:
          userData[phoneNumber].answers["nationality"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 7:
          userData[phoneNumber].answers["profession"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 8:
          userData[phoneNumber].answers["employerName"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 9:
          userData[phoneNumber].answers["address"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 10:
          userData[phoneNumber].answers["phoneNumber"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 11:
          userData[phoneNumber].answers["email"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 12:
          userData[phoneNumber].answers["niu"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 13:
          if (msg.hasMedia && (msg.type === "image" || msg.type === "document")) {
            const media = await msg.downloadMedia();
            const bufferData = await Buffer.from(media.data, 'base64');
            const responseClodinary = await uploadToCloudinary(`${userData[phoneNumber].answers["name"]}_identityDocument`, bufferData)
            userData[phoneNumber].answers["identityDocument"] = responseClodinary;
            userData[phoneNumber].step++;
          }
          else {
            msg.reply("Merci de joindre une image ou un PDF.")
          }

          break;
        case 14:
          let regex = /^[^\s-]+(\s[^\s-]+)*-\d{9}$/;
          countCase = 1;
          if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B" || userInput.toUpperCase() === "C" || userInput.toUpperCase() === "D") {
            if (userInput.toUpperCase() === "B") {
              // Si l'utilisateur choisit l'option B (Marié.e), demandez le nom et le numéro de téléphone du conjoint(e)
              msg.reply("Veuillez fournir le nom et le numéro de téléphone de votre conjoint(e) dans le format suivant : [Nom(s) du conjoint(e)] - [Numéro de téléphone du conjoint(e)] (eg: Ateba matin-697436273)");
            } else {
              // Si l'utilisateur choisit une autre option, enregistrez simplement la réponse
              userData[phoneNumber].answers["maritalStatus"] = userInput.toUpperCase() === "A" ? "Célibataire" : (userInput.toUpperCase() === "B" ? "Marié.e" : (userInput.toUpperCase() === "C" ? "Divorcé.e" : "Veuf.ve"));
              userData[phoneNumber].step++;
              countCase = 0;
            }
          } else if (regex.test(userInput)) {
            // Si l'utilisateur saisit les informations du conjoint(e) dans le format spécifié (B- [Nom(s) du conjoint(e)] - [Numéro de téléphone du conjoint(e)])
            userData[phoneNumber].answers["maritalStatus"] = `Marié.e`;
            userData[phoneNumber].answers["conjoint"] = userInput;
            userData[phoneNumber].step++;
            countCase = 0;
          } else {
            msg.reply("Veuillez choisir A, B, C ou D.");
          }
          break;
        case 15:
          userData[phoneNumber].answers["emergencyContacts"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 16:
          if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B" || userInput.toUpperCase() === "C" || userInput.toUpperCase() === "D" || userInput.toUpperCase() === "E") {
            userData[phoneNumber].answers["investmentObjective"] = userInput.toUpperCase() === "A" ? 'Diversification du patrimoine' :
              userInput.toUpperCase() === "B" ? 'Revenus complémentaires' :
                userInput.toUpperCase() === "C" ? "Transmission du patrimoine" :
                  userInput.toUpperCase() === "D" ? "Rendement" : "Autres";
            userData[phoneNumber].step++;
          } else {
            msg.reply("Veuillez choisir A, B C , D ou E.");
          }
          break;
        case 17:
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
        case 18:
          if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B" || userInput.toUpperCase() === "C") {
            userData[phoneNumber].answers["investmentHorizon"] = userInput.toUpperCase() === "A" ? "Court-terme" : (userInput.toUpperCase() === "B" ? "Moyen-terme" : "Long-terme");
            userData[phoneNumber].step++;
          } else {
            msg.reply("Veuillez choisir A, B ou C.");
          }
          break;
        case 19:
          if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B" || userInput.toUpperCase() === "C") {
            userData[phoneNumber].answers["riskLevel"] = userInput.toUpperCase() === "A" ? "Faible" : (userInput.toUpperCase() === "B" ? "Moyen" : "Élevé");
            userData[phoneNumber].step++;
          } else {
            msg.reply("Veuillez choisir A, B ou C.");
          }
          break;
        case 20:
          userData[phoneNumber].answers["financialSituationLastThreeYears"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 21:
          if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B" || userInput.toUpperCase() === "C" || userInput.toUpperCase() === "D" || userInput.toUpperCase() === "E" || userInput.toUpperCase() === "F") {
            userData[phoneNumber].answers["capitalOrigin"] = userInput.toUpperCase() === "A" ? "épargne" : (userInput.toUpperCase() === "B" ? "crédit" : (userInput.toUpperCase() === "C" ? 'cession d\'actifs' : (userInput.toUpperCase() === "D" ? 'fonds propres' : (userInput.toUpperCase() === "E" ? 'héritage familiale' : 'autres'))));
            userData[phoneNumber].step++;
          } else {
            msg.reply("Veuillez choisir A, B, C, D, E ou F");
          }
          break;
        case 22:
          userData[phoneNumber].answers["bankDomiciliation"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 23:
          if (msg.hasMedia && (msg.type === "image" || msg.type === "document")) {
            const media = await msg.downloadMedia();
            const bufferData = await Buffer.from(media.data, 'base64');
            const responseClodinary = await uploadToCloudinary(`${userData[phoneNumber].answers["name"]}_ribFile`, bufferData)
            userData[phoneNumber].answers["ribFile"] = responseClodinary;
            userData[phoneNumber].step++;
          }
          else {
            msg.reply("Merci de joindre une image ou un PDF.")
          }
          break;
        case 24:
          if (msg.hasMedia && (msg.type === "image" || msg.type === "document")) {
            const media = await msg.downloadMedia();
            const bufferData = await Buffer.from(media.data, 'base64');
            const responseClodinary = await uploadToCloudinary(`${userData[phoneNumber].answers["name"]}_taxNumberCertificateFile`, bufferData)
            userData[phoneNumber].answers["taxNumberCertificateFile"] = responseClodinary;
            userData[phoneNumber].step++;
          }
          else {
            msg.reply("Merci de joindre une image ou un PDF.")
          }
          break;
        case 25:
          if (msg.hasMedia && (msg.type === "image" || msg.type === "document")) {
            const media = await msg.downloadMedia();
            const bufferData = await Buffer.from(media.data, 'base64');
            const responseClodinary = await uploadToCloudinary(`${userData[phoneNumber].answers["name"]}_taxNumberCertificateFile`, bufferData)
            userData[phoneNumber].answers["incomeProof"] = responseClodinary;
            userData[phoneNumber].step++;
          }
          else {
            msg.reply("Merci de joindre une image ou un PDF.")
          }
          break;
        case 26:
          if (userInput == "Valider") {
            const pdfBuffer = await fillPdfFields(pathTemplateKyc, userData[phoneNumber].answers)
            const responseClodinary = await uploadToCloudinary(`${userData[phoneNumber].answers["name"]}_fiche`, pdfBuffer)
            userData[phoneNumber].answers["fiche"] = (responseClodinary);
            const response = await AccountService.createAccount(userData[phoneNumber].answers);
            if (response.success) {
              userData[phoneNumber].step++;
              const pdfBase64 = pdfBuffer.toString("base64");
              const pdfName = `${userData[phoneNumber].answers["name"]}_kyc`;
              const documentType = "application/pdf";
              await sendMediaToNumber(client, phoneNumber, documentType, pdfBase64, pdfName)
              for (const admin of listAdmin.users) {
                try {
                    const content = `Nouveau compte crée pour le service : ${service} ,${userData[phoneNumber].answers["accountType"]} : ${userData[phoneNumber].answers["name"]} \n\n consultez la fiche ci-joint.`;
                    await sendMessageToNumber(client,admin.phoneNumber, content);
                    await sendMediaToNumber(client, admin.phoneNumber, documentType, pdfBase64, pdfName)
                    const delay = getRandomDelay(5000, 15000);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } catch (error) {
                    console.log(`Erreur lors de l'envoi ${admin.phoneNumber}`, error);
                }
            }
            } else {
              console.log("response create account:",response)
              msg.reply(`echec creation du compte!`)
            }
          }
          else {
            msg.reply(`Commande${userInput} inconnue veuillez saisir *Valider*`)
          }
          break;
        case 27:

        default:
          if(userData[phoneNumber].step == 27)
            {
              msg.reply(`_𝖳𝖺𝗉𝖾𝗓 # 𝗉𝗈𝗎𝗋 𝗋𝖾𝗏𝖾𝗇𝗂𝗋 𝖺𝗎 𝗆𝖾𝗇𝗎 𝗉𝗋𝗂𝗇𝖼𝗂𝗉𝖺𝗅._`)
            }
            else{
              msg.reply("Étape inconnue.");
            }
          break;
      }
    }
    // Envoyer le message correspondant à l'étape actuelle
    const currentStepMessage = getCurrentStepMessage(userData[phoneNumber].step);
    if (currentStepMessage && countCase != 1) {
      const stepMessage = `é𝗍𝖺𝗉𝖾 ${userData[phoneNumber].step}/27\n\n${currentStepMessage}\n\n`;
      const additionalMessage = (userData[phoneNumber].step == 1 || userData[phoneNumber].step == 27 || userData[phoneNumber].step == 26) ?
          "_𝖳𝖺𝗉𝖾𝗓  # 𝗉𝗈𝗎𝗋 𝗋𝖾𝗏𝖾𝗇𝗂𝗋 𝖺𝗎 𝗆𝖾𝗇𝗎 𝗉𝗋𝗂𝗇𝖼𝗂𝗉𝖺𝗅._" :
          "_𝖳𝖺𝗉𝖾𝗓 * 𝗉𝗈𝗎𝗋 𝗋𝖾𝗏𝖾𝗇𝗂𝗋 𝖾𝗇 𝖺𝗋𝗋𝗂è𝗋𝖾, # 𝗉𝗈𝗎𝗋 𝗋𝖾𝗏𝖾𝗇𝗂𝗋 𝖺𝗎 𝗆𝖾𝗇𝗎 𝗉𝗋𝗂𝗇𝖼𝗂𝗉𝖺𝗅._";
      await sendMessageToNumber(client, phoneNumber, stepMessage + additionalMessage);
  }
  
  } catch (error) {
    // Gestion des erreurs      
    console.log("error", error)
    msg.reply(`Une erreur interne du serveur s'est produite suite à une action de l'utilisateur : ${user.data.pseudo}. Notre équipe y travaille.\n\nVeuillez taper # pour soumettre le formulaire ou * pour revenir en arrière.`);
  }
};

// Fonction pour obtenir le message de l'étape actuelle
const getCurrentStepMessage = (step) => {
  switch (step) {
    case 1:
      return "Veuillez saisir le nom  de la personne en charge de l'investissement.";
    case 2:
      return "Veuillez saisir le prénom  de la personne en charge de l'investissement.";
    case 3:
      return "📋 *Titre de civilité* : \n A-Monsieur ,\n B-Madame ,\n C-Autres ,\n"
    case 4:
      return "Veuillez saisir la date de naissance (eg:_12/12/1990_).";
    case 5:
      return "Veuillez saisir le lieu de naissance.";
    case 6:
      return "Veuillez saisir la nationalité.";
    case 7:
      return "Veuillez saisir la profession.";
    case 8:
      return "Veuillez saisir le nom de l'employeur.";
    case 9:
      return "Veuillez saisir l'adresse complete (eg:_Avenue du Général de Gaulle, Quartier Bonapriso, B.P. 12345, Douala, Littoral, Cameroun_).";
    case 10:
      return "Veuillez saisir le numéro de téléphone (eg:_(+237)697874621_).";
    case 11:
      return "Veuillez saisir l'email.";
    case 12:
      return "Veuillez saisir le numéro fiscal (NIU).";
    case 13:
      return "Veuillez joindre le document d'identité (_Passeport, Carte d'identité, Carte de Séjour_). \n\n NB: _joindre une image ou un document pdf_";
    case 14:
      return `📋 *Veuillez saisir l'état Civil* : \n A-Célibataire ,\n B-Marié.e ,\n C-Divorcé.e ,\n D-Veuf.ve \n *NB* : Si vous êtes marié.e, veuillez fournir le nom et le numéro de téléphone de votre conjoint(e) dans le format suivant : B- [Nom(s) du conjoint(e)] - [Numéro de téléphone du conjoint(e)] (eg:_B-Ateba matin-697436273_)`;
    case 15:
      return "Veuillez saisir Nom(s) et Numéro de deux personnes à contacter en cas de besoin.";
    case 16:
      return "📋 *quel objectif répond le placement envisagé ?* : \n A-Diversification du patrimoine ,\n B-Revenus complémentaires ,\n C-Transmission du patrimoine ,\n D-Rendement ,\n E-Autres";
    case 17:
      return "📋 *Avez-vous une expérience professionnelle vous permettant d’acquérir une bonne connaissance des marchés financiers ?* :\n A-Oui,\n B-Non \n *NB*: si Oui veuillez fournir le nombre d'année d'expérience sur ce format [nombre d'année] (eg:10)";
    case 18:
      return "📋 *Horizon de placement* : \n A-Court-terme (moins de 2 ans),\n B-Moyen-terme (2-5 ans),\n C-Long-terme (Plus de 5 ans).";
    case 19:
      return "📋 *Quel est votre niveau de risque* : \n A-Faible ,\n B-Moyenne ,\n C-Élevée.";
    case 20:
      return "Décrivez en une phrase votre situation financière durant les trois (03) dernières années.";
    case 21:
      return "📋 *Nature et origine des capitaux investis* :\n A-Epargne ,\n B-Credit ,\n C-Cession d'actifs ,\n D-Fonds propres,\n E-Héritage Familiale,\n F-Autres";
    case 22:
      return "Veuillez saisir le nom de votre banque et domiciliation.";
    case 23:
      return "Veuillez joindre le Relevé RIB \n\n NB: _joindre une image ou un document pdf_";
    case 24:
      return "Veuillez joindre l'attestation Numéro Fiscal.\n\n NB: _joindre une image ou un document pdf_";
    case 25:
      return "Veuillez joindre le justificatif de revenu.\n\n NB: _joindre une image ou un document pdf_";
    case 26:
      return "Finalisez votre inscription, Makeda Asset Management prendra rendez-vous avec vous par e-mail.\n\n saisir *Valider*";
    case 27:
      return "Votre compte a été créé avec succès !";
    default:
      return null;
  }
};
module.exports = {
  kycPersonCommander,
};
