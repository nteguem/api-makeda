const { sendMessageToNumber } = require('./whatsappMessaging');
const {Steps} = require("../utils");

// Objet pour stocker l'étape actuelle et les réponses de l'utilisateur
let userData = {
  step: 1,
  answers: {} // Un objet vide pour stocker les réponses
};
// Fonction pour gérer les commandes de l'utilisateur
const kycEnterpriseCommander = async (user, msg, client,service) => {
  try {
    const userInput = msg.body.trim(); // Entrée de l'utilisateur sans espaces vides
    userData.answers["service"] = service;
    userData.answers["accountType"] = "personne_morale";
    if (userInput === "*") {
      // Revenir à l'étape précédente
      userData.step = Math.max(userData.step - 1, 1); // Ne pas descendre en dessous de l'étape 1
    }
    else {
      // Logique de gestion des étapes du formulaire KYC
      switch (userData.step) {
        case 1:
          userData.answers["socialName"] = userInput;
          userData.step++;
          break;
        case 2:
        // Logique pour joindre une copie des statuts
          userData.answers["statutesCopyFile"] = userInput;
          userData.step++;
          break;
        case 3:
          // Logique pour saisir le pays d'incorporation ou de résidence
          userData.answers["incorporationCountry"] = userInput;
          userData.step++;
          break;
        case 4:
          // Logique pour saisir le numéro du registre de commerce
          userData.answers["commerceRegistryNumber"] = userInput;
          userData.step++;
          break;
        case 5:
          // Logique pour joindre une copie du RCCM
          userData.answers["RCCMFile"] = userInput;
          userData.step++;
          break;
        case 6:
          // Logique pour saisir la date de création de l'entreprise
          userData.answers["incorporationDate"] = userInput;
          userData.step++;
          break;
        case 7:
          // Logique pour saisir l'adresse email de l'entreprise
          userData.answers["email"] = userInput;
          userData.step++;
          break;
        case 8:
          // Logique pour saisir le numéro de téléphone de l'entreprise
          userData.answers["phoneNumber"] = userInput;
          userData.step++;
          break;
        case 9:
          // Logique pour saisir le nom et prénom du représentant légal
          userData.answers["fullName"] = userInput;
          userData.step++;
          break;
        case 10:
          // Logique pour sélectionner le type de représentant légal
          if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B" || userInput.toUpperCase() === "C") {
            userData.answers["legalRepresentative"] = userInput.toUpperCase() === "A" ? "Monsieur" : (userInput.toUpperCase() === "B" ? "Madame" : "Autre");
            userData.step++;
          } else {
            msg.reply("Veuillez choisir A, B ou C.");
          }
          break;
        case 11:
          // Logique pour saisir le rôle du représentant légal
          userData.answers["actingAs"] = userInput;
          userData.step++;
          break;
        case 12:
          // Logique pour saisir l'adresse complète de l'entreprise
          userData.answers["address"] = userInput;
          userData.step++;
          break;
        case 13:
          // Logique pour répondre à la question sur les enquêtes
          if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B") {
            if (userInput.toUpperCase() === "A") {
                msg.reply("Veuillez expliquer et inclure toutes les enquêtes en cours");
              } 
              else if (userInput.toUpperCase().startsWith("A-")) {
                userData.answers["investigationHistory"] = userInput;
                userData.step++;
              }
              else {
            userData.answers["investigationHistory"] = userInput.toUpperCase() === "A" ? "Oui" : "Non";
            userData.step++;
              }
          } else {
            msg.reply("Veuillez choisir A ou B.");
          }
          break;
        case 14:
        if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B" || userInput.toUpperCase() === "C"|| userInput.toUpperCase() === "D" || userInput.toUpperCase() === "E") {
            userData.answers["investmentObjective"] = userInput.toUpperCase() === "A" ? 'Diversification du patrimoine' : 
            userInput.toUpperCase() === "B" ? 'Revenus complémentaires' : 
            userInput.toUpperCase() === "C" ? "Transmission du patrimoine" : 
            userInput.toUpperCase() === "D" ? "Rendement" : "Autres";
            userData.step++;
        } else {
            msg.reply("Veuillez choisir A, B C , D ou E.");
        }
        break;
        case 15:
            if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B" || userInput.toUpperCase() === "C") {
                userData.answers["investmentHorizon"] = userInput.toUpperCase() === "A" ? "Court-terme (moins de 2 ans)" : (userInput.toUpperCase() === "B" ? "Moyen-terme (2-5 ans)" : "Long-terme (Plus de 5 ans)");
                userData.step++;
              } else {
                msg.reply("Veuillez choisir A, B ou C.");
              }
              break; 
        case 16:
            if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B" || userInput.toUpperCase() === "C") {
                userData.answers["riskLevel"] = userInput.toUpperCase() === "A" ? "Faible" : (userInput.toUpperCase() === "B" ? "Moyen" : "Élevé");
                userData.step++;
              } else {
                msg.reply("Veuillez choisir A, B ou C.");
              }
              break; 
        case 17:
            if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B") {
                if (userInput.toUpperCase() === "A") {
                  // Si l'utilisateur choisit l'option A (Oui), demandez le nombre d'années d'expérience
                  msg.reply("Veuillez fournir le nombre d'années d'expérience sur ce format A-[nombre d'année] (eg: A-10)");
                } else {
                  // Si l'utilisateur choisit une autre option, enregistrez simplement la réponse
                  userData.answers["financialMarketExperience"] = userInput.toUpperCase() === "A" ? "Oui" : "Non";
                  userData.step++;
                }
              } else if (userInput.toUpperCase().startsWith("A-")) {
                // Si l'utilisateur saisit le nombre d'années d'expérience dans le format spécifié (A-[nombre d'année])
                const experienceYears = userInput.slice(2).trim();
                userData.answers["financialMarketExperience"] = `Oui - ${experienceYears} année(s)`;
                userData.step++;
              } else {
                msg.reply("Veuillez choisir A ou B.");
              }
              break;
        case 18:
            userData.answers["financialSituationLastThreeYears"] = userInput;
            userData.step++;
            break;
        case 19:
        userData.answers["mainActivity"] = userInput;
        userData.step++;
        break;
        case 20:
        userData.answers["secondaryActivity"] = userInput;
        userData.step++;
        break;
        case 21:
        userData.answers["receivesSubsidies"] = userInput;
        userData.step++;
        break;
        case 22:
        userData.answers["bankDomiciliation"] = userInput;
        userData.step++;
        break;
        case 23:
        userData.answers["ribFile"] = userInput;
        userData.step++;
        break;
        case 24:
        userData.answers["taxNumberCertificateFile"] = userInput;
        userData.step++;
        break;
        default:
          msg.reply("Étape inconnue.");
          break;
      }
    }

    // Envoyer le message correspondant à l'étape actuelle
    const currentStepMessage = getCurrentStepMessage(userData.step);
    if (currentStepMessage) {
      await sendMessageToNumber(client, user.data.phoneNumber, `é𝗍𝖺𝗉𝖾 ${userData.step}/24\n\n${currentStepMessage}\n\n𝖳𝖺𝗉𝖾𝗓 * 𝗉𝗈𝗎𝗋 𝗋𝖾𝗏𝖾𝗇𝗂𝗋 𝖾𝗇 𝖺𝗋𝗋𝗂è𝗋𝖾, # 𝗉𝗈𝗎𝗋 𝗋𝖾𝗏𝖾𝗇𝗂𝗋 𝖺𝗎 𝗆𝖾𝗇𝗎 𝗉𝗋𝗂𝗇𝖼𝗂𝗉𝖺𝗅.`);
    }

  } catch (error) {
    // Gestion des erreurs
    console.log("error",error)
    msg.reply(`Une erreur interne du serveur s'est produite suite à une action de l'utilisateur : ${user.data.pseudo}. Notre équipe y travaille.\n\nVeuillez taper # pour soumettre le formulaire ou * pour revenir en arrière.`);
  }
};

// Fonction pour obtenir le message de l'étape actuelle
const getCurrentStepMessage = (step) => {
  switch (step) {
    case 2:
      return "Veuillez saisir la Dénomination sociale en charge de l'investissement.";
    case 3:
      return "Veuillez joindre une copie des statuts";
    case 4:
      return "Veuillez saisir le pays d'incorporation ou de résidence";
    case 5:
      return "Veuillez saisir le numéro du registre de commerce.";
    case 6:
      return "Veuillez joindre une copie du RCCM";
    case 7:
      return "Veuillez saisir la date de création de l'entreprise (eg:_12/12/1990_).";
    case 8:
      return "Veuillez saisir l'adresse email.";
    case 9:
      return "Veuillez saisir le numéro de téléphone (eg:_(+237)697874621_).";
    case 10:
      return "Veuillez saisir le Nom et Prénom";
    case 11:
        return "*Représentant légal* : \n A-Monsieur ,\n B-Madame ,\n C-Autre ,\n"  
    case 12:
      return `*Agissant en qualité de* (⚠_Dûment habilité(e)s_): \n\n Veuillez saisir votre rôle`;
    case 13:
      return "Veuillez saisir l'adresse complete (eg:_Avenue du Général de Gaulle, Quartier Bonapriso, B.P. 12345, Douala, Littoral, Cameroun_).";
        case 14:
      return "*Votre organisation ou l'un de ses propriétaires, administrateurs, dirigeants ou employés ont-ils fait l'objet d'enquêtes, de condamnations, d'exclusions ou de suspensions professionnelles liées à la corruption, à la fraude, au blanchiment d'argent, aux sanctions, au contrôle des exportations, à l'esclavage moderne ou à des infractions connexes ?* : \n A-Oui ,\n B-Non";
        case 15:
      return "*quel objectif répond le placement envisagé ?* : \n A-Diversification du patrimoine ,\n B-Revenus complémentaires ,\n C-Transmission du patrimoine ,\n D-Rendement ,\n E-Autres";
        case 16:
      return "*Horizon de placement* : \n A-Court-terme (moins de 2 ans),\n B-Moyen-terme (2-5 ans),\n C-Long-terme (Plus de 5 ans).";
    case 17:
      return "*Quel est votre niveau de risque* : \n A-Faible ,\n B-Moyenne ,\n C-Élevée.";
        case 18:
      return "*Avez-vous une expérience professionnelle vous permettant d’acquérir une bonne connaissance des marchés financiers ?* :\n A-Oui,\n B-Non \n *NB*: si Oui veuillez fournir le nombre d'année d'expérience sur ce format A-[nombre d'année] (eg:A-10)";
        case 19:
      return "Décrivez en une phrase votre situation financière durant les trois (03) dernières années.";
    case 20:
      return "Décrivez votre activité principale";
    case 21:
      return "Décrivez votre activité secondaire";
    case 22:
      return "L'entreprise bénéficie-t-elle parfois à des subventions privées ou d'État?";
    case 23:
      return "Veuillez saisir le nom de votre banque partenaire et domiciliation";
    case 24:
      return "Veuillez joindre le Relevé RIB";
    case 25:
      return "Veuillez joindre l'attestation Numéro Fiscal";
    default:
      return null;
  }
};
module.exports = {
  kycEnterpriseCommander,
};