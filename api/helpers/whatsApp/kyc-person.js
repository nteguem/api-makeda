const { sendMessageToNumber } = require('./whatsappMessaging');

// Objet pour stocker l'étape actuelle et les réponses de l'utilisateur
let userData = {
  step: 1,
  answers: {} // Un objet vide pour stocker les réponses
};
// Fonction pour gérer les commandes de l'utilisateur
const kycPersonCommander = async (user, msg, client,service) => {
  try {
    const userInput = msg.body.trim(); // Entrée de l'utilisateur sans espaces vides
    userData.answers["service"] = service;
    userData.answers["accountType"] = "personne_physique";
    
    if(userInput === "*")
      {
        userData.step = Math.max(userData.step - 1, 1); // Ne pas descendre en dessous de l'étape 1
      }
      else
      {
      // Logique de gestion des étapes du formulaire KYC
      switch (userData.step) {
        case 1:
          userData.answers["fullName"] = userInput;
          userData.step++;
          break;
        case 2:
          userData.answers["dateOfBirth"] = userInput;
          userData.step++;
          break;
        case 3:
          userData.answers["placeOfBirth"] = userInput;
          userData.step++;
          break;
        case 4:
          userData.answers["nationality"] = userInput;
          userData.step++;
          break;
        case 5:
          userData.answers["profession"] = userInput;
          userData.step++;
          break;
        case 6:
          userData.answers["employerName"] = userInput;
          userData.step++;
          break;
        case 7:
          userData.answers["address"] = userInput;
          userData.step++;
          break;
        case 8:
          userData.answers["phoneNumber"] = userInput;
          userData.step++;
          break; 
        case 9:
          userData.answers["email"] = userInput;
          userData.step++;
          break;
        case 10:
          userData.answers["niu"] = userInput;
          userData.step++;
          break;
        case 11:
          userData.answers["identityDocument"] = userInput;
          userData.step++;
          break;
        case 12:
          if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B" || userInput.toUpperCase() === "C" || userInput.toUpperCase() === "D") {
            if (userInput.toUpperCase() === "B") {
              // Si l'utilisateur choisit l'option B (Marié.e), demandez le nom et le numéro de téléphone du conjoint(e)
              msg.reply("Veuillez fournir le nom et le numéro de téléphone de votre conjoint(e) dans le format suivant : B- [Nom(s) du conjoint(e)] - [Numéro de téléphone du conjoint(e)] (eg: B-Ateba matin-697436273)");
            } else {
              // Si l'utilisateur choisit une autre option, enregistrez simplement la réponse
              userData.answers["maritalStatus"] = userInput.toUpperCase() === "A" ? "Célibataire" : (userInput.toUpperCase() === "B" ? "Marié.e" : (userInput.toUpperCase() === "C" ? "Divorcé.e" : "Veuf.ve"));
              userData.step++;
            }
          } else if (userInput.toUpperCase().startsWith("B-")) {
            // Si l'utilisateur saisit les informations du conjoint(e) dans le format spécifié (B- [Nom(s) du conjoint(e)] - [Numéro de téléphone du conjoint(e)])
            const [nomConjoint, numeroConjoint] = userInput.slice(2).split("-").map(item => item.trim());
            userData.answers["maritalStatus"] = `Marié.e à ${nomConjoint} - ${numeroConjoint}`;
            userData.step++;
          } else {
            msg.reply("Veuillez choisir A, B, C ou D.");
          }
          break; 
        case 13:
          userData.answers["emergencyContacts"] = userInput;
          userData.step++;
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
        case 16:
          if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B" || userInput.toUpperCase() === "C") {
            userData.answers["investmentHorizon"] = userInput.toUpperCase() === "A" ? "Court-terme (moins de 2 ans)" : (userInput.toUpperCase() === "B" ? "Moyen-terme (2-5 ans)" : "Long-terme (Plus de 5 ans)");
            userData.step++;
          } else {
            msg.reply("Veuillez choisir A, B ou C.");
          }
          break;  
        case 17:
          if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B" || userInput.toUpperCase() === "C") {
            userData.answers["riskLevel"] = userInput.toUpperCase() === "A" ? "Faible" : (userInput.toUpperCase() === "B" ? "Moyen" : "Élevé");
            userData.step++;
          } else {
            msg.reply("Veuillez choisir A, B ou C.");
          }
          break;          
        case 18:
          userData.answers["financialSituationLastThreeYears"] = userInput;
          userData.step++;
          break;
        case 19:
          if (userInput.toUpperCase() === "A" || userInput.toUpperCase() === "B" || userInput.toUpperCase() === "C" || userInput.toUpperCase() === "D" || userInput.toUpperCase() === "E" || userInput.toUpperCase() === "F") {
            userData.answers["capitalOrigin"] = userInput.toUpperCase() === "A" ? "Epargne" : (userInput.toUpperCase() === "B" ? "Crédit" : (userInput.toUpperCase() === "C" ? "Cession d'actifs" : (userInput.toUpperCase() === "D" ? "Fonds propres" : (userInput.toUpperCase() === "E" ? "Héritage Familial" : "Autres"))));
            userData.step++;
          } else {
            msg.reply("Veuillez choisir A, B, C, D, E ou F");
          }
          break;   
        case 20:
          userData.answers["bankDomiciliation"] = userInput;
          userData.step++;
          break;
        case 21:
          userData.answers["ribFile"] = userInput;
          userData.step++;
          break;
        case 22:
          userData.answers["taxNumberCertificateFile"] = userInput;
          userData.step++;
          break;
        case 23:
          userData.answers["incomeProof"] = userInput;
          userData.step++;
          break;
        case 24:
          console.log("userData",userData)
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
    case 1:
      return "Veuillez saisir le nom complet de la personne en charge de l'investissement.";
    case 2:
      return "Veuillez saisir la date de naissance (eg:_12/12/1990_).";
    case 3:
      return "Veuillez saisir le lieu de naissance.";
    case 4:
      return "Veuillez saisir la nationalité.";
    case 5:
      return "Veuillez saisir la profession.";
    case 6:
      return "Veuillez saisir le nom de l'employeur.";
    case 7:
      return "Veuillez saisir l'adresse complete (eg:_Avenue du Général de Gaulle, Quartier Bonapriso, B.P. 12345, Douala, Littoral, Cameroun_).";
    case 8:
      return "Veuillez saisir le numéro de téléphone (eg:_(+237)697874621_).";
    case 9:
      return "Veuillez saisir l'email.";
    case 10:
      return "Veuillez saisir le numéro fiscal (NIU).";
    case 11:
      return "Veuillez joindre le document d'identité (_Passeport, Carte d'identité, Carte de Séjour_).";
    case 12:
      return `*Veuillez saisir l'état Civil* : \n A-Célibataire ,\n B-Marié.e ,\n C-Divorcé.e ,\n D-Veuf.ve \n *NB* : Si vous êtes marié.e, veuillez fournir le nom et le numéro de téléphone de votre conjoint(e) dans le format suivant : B- [Nom(s) du conjoint(e)] - [Numéro de téléphone du conjoint(e)] (eg:_B-Ateba matin-697436273_)`;  
    case 13:
      return "Veuillez saisir Nom(s) et Numéro de deux personnes à contacter en cas de besoin.";
    case 14:
      return "*quel objectif répond le placement envisagé ?* : \n A-Diversification du patrimoine ,\n B-Revenus complémentaires ,\n C-Transmission du patrimoine ,\n D-Rendement ,\n E-Autres";
    case 15:
      return "*Avez-vous une expérience professionnelle vous permettant d’acquérir une bonne connaissance des marchés financiers ?* :\n A-Oui,\n B-Non \n *NB*: si Oui veuillez fournir le nombre d'année d'expérience sur ce format A-[nombre d'année] (eg:A-10)";
    case 16:
      return "*Horizon de placement* : \n A-Court-terme (moins de 2 ans),\n B-Moyen-terme (2-5 ans),\n C-Long-terme (Plus de 5 ans).";
    case 17:
      return "*Quel est votre niveau de risque* : \n A-Faible ,\n B-Moyenne ,\n C-Élevée.";
    case 18:
      return "Décrivez en une phrase votre situation financière durant les trois (03) dernières années.";
    case 19:
      return "*Nature et origine des capitaux investis* :\n A-Epargne ,\n B-Credit ,\n C-Cession d'actifs ,\n D-Fonds propres,\n E-Héritage Familiale,\n F-Autres";
    case 20:
      return "Veuillez saisir le nom de votre banque et domiciliation.";
    case 21:
      return "Veuillez joindre le Relevé RIB";
    case 22:
      return "Veuillez joindre l'attestation Numéro Fiscal";
    case 23:
      return "Veuillez joindre le justificatif de revenu";
    default:
      return null;
  }
};
module.exports = {
  kycPersonCommander,
};
