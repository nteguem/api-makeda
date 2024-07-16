const { sendMessageToNumber } = require('./whatsappMessaging');
const AccountService = require('../../services/account.service');
const { uploadToCloudinary } = require("../../services/uploadFile.service");
const { sendMediaToNumber } = require("./whatsappMessaging");
const { fillPdfFields } = require("../../services/fillFormPdf.service");
const { list } = require("../../services/user.service")
const { getRandomDelay } = require("../../helpers/utils")
const logger = require("../logger")
// Objet pour stocker l'étape actuelle et les réponses de l'utilisateur
let userData = {};
let countCase = 0;
const pathTemplateKyc = "../../kyc-template/KYC Personne Physique.pdf"
const pathFCP = "../../kyc-template/FCP Makeda Horizon Person.pdf"

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
          if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B" || userInput.toUpperCase() === "C") {
            userData[phoneNumber].answers["civility"] = userInput.toUpperCase() === "A" ? "Monsieur" : (userInput.toUpperCase() === "B" ? "Madame" : "Autres");
            userData[phoneNumber].step++;
          } else {
            msg.reply("Veuillez choisir A, B ou C.");
          }
          break;
        case 3:
          const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
          if (dateRegex.test(userInput.trim())) {
              userData[phoneNumber].answers["dateOfBirth"] = userInput.trim();
              userData[phoneNumber].step++;
          } else {
              msg.reply("Veuillez entrer votre date de naissance au format dd/mm/yyyy (ex: 01/01/2000).");
          }
          break;
        case 4:
          userData[phoneNumber].answers["placeOfBirth"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 5:
          userData[phoneNumber].answers["nationality"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 6:
          const regexC = /^[A-Za-zÀ-ÖØ-öø-ÿ]+ *- *[A-Za-zÀ-ÖØ-öø-ÿ]+$/;
        if (regexC.test(userInput.trim())) {
            const [country, city] = userInput.split('-');
            userData[phoneNumber].answers["countryOfResidence"] = country.trim();
            userData[phoneNumber].answers["cityOfResidence"] = city.trim();
            userData[phoneNumber].step++;
          } else {
            msg.reply("Veuillez respecter le format [Pays-Ville].");
          }
          break;
        case 7:
          userData[phoneNumber].answers["profession"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 8:
          if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B" || userInput.toUpperCase() === "C" || userInput.toUpperCase() === "D" || userInput.toUpperCase() === "E" || userInput.toUpperCase() === "F" || userInput.toUpperCase() === "G" || userInput.toUpperCase() === "H") {
            userData[phoneNumber].answers["typeProfession"] = userInput.toUpperCase() === "A" ? 'Fonctionnaire/Salarié du secteur public' :
              userInput.toUpperCase() === "B" ? 'Etudiant' :
                userInput.toUpperCase() === "C" ? 'Planteur/Exploitant rural' :
                  userInput.toUpperCase() === "D" ? 'Salarié du secteur privé' :
                    userInput.toUpperCase() === "E" ? 'Commerçant et entrepreneur individuel' :
                      userInput.toUpperCase() === "F" ? 'Agent d’organismes internationaux' :
                        userInput.toUpperCase() === "G" ? 'Profession Libérale' :
                          'Autre';
            userData[phoneNumber].step++;
          } else {
            msg.reply("Veuillez choisir A, B, C, D, E, F, G ou H.");
          }
          break;
        case 9:
          userData[phoneNumber].answers["employerName"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 10:
          userData[phoneNumber].answers["address"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 11:
          userData[phoneNumber].answers["phoneNumber"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 12:
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (emailRegex.test(userInput.trim())) {
              userData[phoneNumber].answers["email"] = userInput.trim();
              userData[phoneNumber].step++;
          } else {
              msg.reply("Veuillez entrer une adresse email valide (ex: exemple@domaine.com).");
          }
          break;
        case 13:
          countCase = 1;
          const validationMessage = validateIdentity(userInput);
          if (validationMessage === "identification valide") {
            const parts = userInput.split('/');
            userData[phoneNumber].answers["typeDocument"] = parts[0] === 'A' ? "Carte d'identité" : parts[0] === 'B' ? "Passeport " : "Carte de Séjour";
            userData[phoneNumber].answers["numberDocument"] = parts[1]
            userData[phoneNumber].answers["issuedDateDocument"] = parts[2]
            userData[phoneNumber].answers["placeIssueDocument"] = parts[3]
            userData[phoneNumber].answers["expiryDateDocument"] = parts[4]
            userData[phoneNumber].step++;
            countCase = 0;
          } else {
            msg.reply(validationMessage);
          }
          break;
        case 14:
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
        case 15:
          userData[phoneNumber].answers["niu"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 16:
          let regex = /^[^\s-]+(\s[^\s-]+)*-\d{9}$/;
          countCase = 1;
          if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B" || userInput.toUpperCase() === "C" || userInput.toUpperCase() === "D") {
            if (userInput.toUpperCase() === "B") {
              // Si l'utilisateur choisit l'option B (Marié.e), demandez le nom et le numéro de téléphone du conjoint(e)
              msg.reply("Veuillez fournir le nom et le numéro de téléphone de votre conjoint(e) dans le format suivant : [Nom(s) du conjoint(e)]-[Numéro de téléphone du conjoint(e)] (eg: Ateba matin-697436273)");
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
        case 17:
          userData[phoneNumber].answers["emergencyContacts"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 18:
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
        case 19:
          if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B") {
              // Si l'utilisateur choisit une autre option, enregistrez simplement la réponse
              userData[phoneNumber].answers["financialMarketExperience"] = userInput.toUpperCase() === "A" ? "Oui" : "Non";
              userData[phoneNumber].step++;
              countCase = 0; 
          }  else {
            msg.reply("Veuillez choisir A ou B.");
          }
          break;
        case 20:
          if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B" || userInput.toUpperCase() === "C") {
            userData[phoneNumber].answers["investmentHorizon"] = userInput.toUpperCase() === "A" ? "Court-terme" : (userInput.toUpperCase() === "B" ? "Moyen-terme" : "Long-terme");
            userData[phoneNumber].step++;
          } else {
            msg.reply("Veuillez choisir A, B ou C.");
          }
          break;
        case 21:
          if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B" || userInput.toUpperCase() === "C"|| userInput.toUpperCase() === "D") {
            userData[phoneNumber].answers["riskLevel"] = userInput.toUpperCase() === "A" ? "Très faible" : userInput.toUpperCase() === "B" ? "Faible": userInput.toUpperCase() === "C" ? "Moyen" : "Très élevé";
            userData[phoneNumber].step++;
          } else {
            msg.reply("Veuillez choisir A, B , C ou D.");
          }
          break;
        case 22:
          if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B" || userInput.toUpperCase() === "C"|| userInput.toUpperCase() === "D") {
            userData[phoneNumber].answers["financialSituationLastThreeYears"] = userInput.toUpperCase() === "A" ? "Difficile" : userInput.toUpperCase() === "B" ? "Stable": userInput.toUpperCase() === "C" ? "Bonne performance" : "Très bonne croissance";
            userData[phoneNumber].step++;
          } else {
            msg.reply("Veuillez choisir A, B , C ou D.");
          }
          break;
        case 23:
          if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B" || userInput.toUpperCase() === "C" || userInput.toUpperCase() === "D" || userInput.toUpperCase() === "E" || userInput.toUpperCase() === "F") {
            userData[phoneNumber].answers["capitalOrigin"] = userInput.toUpperCase() === "A" ? "épargne" : (userInput.toUpperCase() === "B" ? "crédit" : (userInput.toUpperCase() === "C" ? 'cession d\'actifs' : (userInput.toUpperCase() === "D" ? 'fonds propres' : (userInput.toUpperCase() === "E" ? 'héritage familiale' : 'autres'))));
            userData[phoneNumber].step++;
          } else {
            msg.reply("Veuillez choisir A, B, C, D, E ou F");
          }
          break;
        case 24:
          userData[phoneNumber].answers["bankDomiciliation"] = userInput;
          userData[phoneNumber].step++;
          break;
        case 25:
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
        case 26:
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
        case 27:
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
        case 28:
          if (userInput == "Valider") {
            const pdfBufferFiche = await fillPdfFields(pathTemplateKyc, userData[phoneNumber].answers)
            const responseClodinaryFiche = await uploadToCloudinary(`${userData[phoneNumber].answers["name"]}_fiche`, pdfBufferFiche)
            userData[phoneNumber].answers["fiche"] = (responseClodinaryFiche);
            const response = await AccountService.createAccount(userData[phoneNumber].answers);
            if (response.success) {
              userData[phoneNumber].step++;
              const pdfBase64Fiche = pdfBufferFiche.toString("base64");
              const pdfNameFiche = `${userData[phoneNumber].answers["name"]}_kyc`;
              const documentType = "application/pdf";
              await sendMediaToNumber(client, phoneNumber, documentType, pdfBase64Fiche, pdfNameFiche)
              for (const admin of listAdmin.users) {
                try {
                  const content = `Nouveau compte crée pour le service : ${service} ,${userData[phoneNumber].answers["accountType"]} : ${userData[phoneNumber].answers["name"]} \n\n consultez la fiche ci-joint.`;
                  await sendMessageToNumber(client, admin.phoneNumber, content);
                  await sendMediaToNumber(client, admin.phoneNumber, documentType, pdfBase64Fiche, pdfNameFiche)
                  const delay = getRandomDelay(5000, 15000);
                  await new Promise(resolve => setTimeout(resolve, delay));
                } catch (error) {
                  logger(client).error(`Erreur lors de l'envoi ${admin.phoneNumber}`, error);
                }
              }
            } else {
              console.log("response create account:", response)
              msg.reply(`echec creation du compte!`)
            }
          }
          else {
            msg.reply(`Commande${userInput} inconnue veuillez saisir *Valider*`)
          }
          break;
        case 29:
          userData[phoneNumber] = { step: 1, answers: {} };
        default:
          if (userData[phoneNumber].step == 29) {
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
      const stepMessage = `é𝗍𝖺𝗉𝖾 ${userData[phoneNumber].step}/29\n\n${currentStepMessage}\n\n`;
      const additionalMessage = (userData[phoneNumber].step == 1 || userData[phoneNumber].step == 29 || userData[phoneNumber].step == 29) ?
        "_𝖳𝖺𝗉𝖾𝗓  # 𝗉𝗈𝗎𝗋 𝗋𝖾𝗏𝖾𝗇𝗂𝗋 𝖺𝗎 𝗆𝖾𝗇𝗎 𝗉𝗋𝗂𝗇𝖼𝗂𝗉𝖺𝗅._" :
        "_𝖳𝖺𝗉𝖾𝗓 * 𝗉𝗈𝗎𝗋 𝗋𝖾𝗏𝖾𝗇𝗂𝗋 𝖾𝗇 𝖺𝗋𝗋𝗂è𝗋𝖾, # 𝗉𝗈𝗎𝗋 𝗋𝖾𝗏𝖾𝗇𝗂𝗋 𝖺𝗎 𝗆𝖾𝗇𝗎 𝗉𝗋𝗂𝗇𝖼𝗂𝗉𝖺𝗅._";
      await sendMessageToNumber(client, phoneNumber, stepMessage + additionalMessage);
    }

  } catch (error) {
    logger(client).error("error", error);
    msg.reply(`Une erreur interne du serveur s'est produite suite à une action de l'utilisateur : ${user.data.pseudo}. Notre équipe y travaille.\n\nVeuillez taper # pour soumettre le formulaire ou * pour revenir en arrière.`);
  }
};

// fonction pour verifier le document d'identité 
function validateIdentity(msg) {
  const parts = msg.split('/');

  if (parts.length !== 5) {
    return "Le reponse n'est pas valide. Assurez-vous de suivre le format : A/Numéro/Délivré le/Lieu de délivrance/Date de validité";
  }

  const [type, number, issuedDate, place, expiryDate] = parts;

  if (!['A', 'B', 'C'].includes(type)) {
    return "Le type de document n'est pas valide. Il doit être A, B, ou C.";
  }

  const numberPattern = /^[a-zA-Z0-9]+$/;
  if (!numberPattern.test(number)) {
    return "Le numéro de document n'est pas valide. Il doit être une chaîne de caractères alphanumérique.";
  }

  const datePattern = /^\d{2}-\d{2}-\d{4}$/;
  if (!datePattern.test(issuedDate)) {
    return "La date de délivrance n'est pas valide. Utilisez le format jj-mm-aaaa.";
  }

  if (!datePattern.test(expiryDate)) {
    return "La date de validité n'est pas valide. Utilisez le format jj-mm-aaaa.";
  }

  const placePattern = /^[a-zA-ZÀ-ÖØ-öø-ÿ\s]+$/;
  if (!placePattern.test(place)) {
    return "Le lieu de délivrance n'est pas valide. Il doit être une chaîne de caractères alphabétiques.";
  }

  return "identification valide";
}

// Fonction pour obtenir le message de l'étape actuelle
const getCurrentStepMessage = (step) => {
  switch (step) {
    case 1:
      return "Veuillez saisir votre nom et prénom.";
    case 2:
      return "📋 *Titre de civilité* : \n A-Monsieur ,\n B-Madame ,\n C-Autres ,\n"
    case 3:
      return "Veuillez saisir la date de naissance (eg:_12/12/1990_).";
    case 4:
      return "Veuillez saisir le lieu de naissance.";
    case 5:
      return "Veuillez saisir la nationalité.";
    case 6:
      return "Veuillez indiquer votre pays de résidence et votre ville au format suivant : [Pays-Ville] (eg : Gabon-Libreville)";
    case 7:
      return "Veuillez saisir la profession.";
    case 8:
      return "📋 *À quelle catégorie appartenez-vous  ?* : \n A-Fonctionnaire/Salarié du secteur public,\n B-Etudiant,\n C-Planteur/Exploitant rural,\n D-Salarié du secteur privé,\n E-Commerçant et entrepreneur individuel,\n F-Agent d’organismes internationaux,\n G-Profession Libérale,\n H-Autre";
    case 9:
      return "Veuillez saisir le nom de l'employeur.";
    case 10:
      return "Veuillez saisir l'adresse complete (eg:_Avenue du Général de Gaulle, Quartier Bonapriso, B.P. 12345, Douala, Littoral, Cameroun_).";
    case 11:
      return "Veuillez saisir le numéro de téléphone (eg:_(+237)697874621_).";
    case 12:
      return "Veuillez saisir l'email.";
    case 13:
      return "📋 *Quel type de document d'identité ?* \n A - Carte d'identité \n B - Passeport \n C - Carte de Séjour \n\n *Veuillez saisir les informations de la manière suivante* : \n\n [Type document/Numéro carte d'identité/Délivré le/Lieu de délivrance/Date de validité] \n\n Exemple (pour la Carte d'identité) : \n A/12345678/01-01-2020/Yaoundé/01-01-2030";
    case 14:
      return "Veuillez joindre le document d'identité (_Passeport, Carte d'identité, Carte de Séjour_). \n\n NB: _joindre une image ou un document pdf_";
    case 15:
      return "Veuillez saisir le numéro fiscal (NIU).";
    case 16:
      return `📋 *Veuillez saisir l'état Civil* : \n A-Célibataire ,\n B-Marié.e ,\n C-Divorcé.e ,\n D-Veuf.ve \n *NB* : Si marié(e), renseignez ensuite le nom et le téléphone de votre conjoint(e) dans le format suivant : [Nom(s) du conjoint(e)]-[Numéro de téléphone du conjoint(e)] (eg:_Ateba matin-697436273_)`;
    case 17:
      return "Veuillez saisir Nom(s) et Numéro de deux personnes à contacter en cas de besoin.";
    case 18:
      return "📋 *quel objectif répond le placement envisagé ?* : \n A-Diversification du patrimoine ,\n B-Revenus complémentaires ,\n C-Transmission du patrimoine ,\n D-Rendement ,\n E-Autres";
    case 19:
      return "📋 *Avez-vous connaissance des produits de trésorerie et du marché financier ?* :\n A-Oui,\n B-Non ";
    case 20:
      return "📋 *Horizon de placement* : \n A-Court-terme (moins de 2 ans),\n B-Moyen-terme (2-5 ans),\n C-Long-terme (Plus de 5 ans).";
    case 21:
      return "📋 *Quel est votre niveau d’échelle de risque face au marché financier* : \n A-Très faible ,\n B-Faible ,\n C-Moyen \n D-Très élevé.";
    case 22:
      return "Décrivez en une phrase votre situation financière durant les trois (03) dernières années.";
    case 23:
      return "📋 *Nature et origine des capitaux investis* :\n A-Epargne ,\n B-Credit ,\n C-Cession d'actifs ,\n D-Fonds propres,\n E-Héritage Familiale,\n F-Autres";
    case 24:
      return "Veuillez saisir le nom de votre banque et domiciliation.";
    case 25:
      return "Veuillez joindre le Relevé RIB \n\n NB: _joindre une image ou un document pdf_";
    case 26:
      return "Veuillez joindre l'attestation Numéro Fiscal.\n\n NB: _joindre une image ou un document pdf_";
    case 27:
      return "Veuillez joindre le justificatif de revenu.\n\n NB: _joindre une image ou un document pdf_";
    case 28:
      return "Finalisez votre inscription, Makeda Asset Management prendra rendez-vous avec vous par e-mail.\n\n saisir *Valider*";
    case 29:
      return "Votre compte a été créé avec succès, l’un de nos conseillers prendra attache avec vous pour la suite.";
    default:
      return null;
  }
};
module.exports = {
  kycPersonCommander,
};
