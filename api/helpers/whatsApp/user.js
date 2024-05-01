const { menuData,processMenuChoice } = require("../../data");
const logger = require('../logger');

const Steps = {};

const UserCommander = async (user, msg,client) => {
  try {
    const Menu = menuData(user.data.pseudo, user.exist);
    if (!('participant' in msg.id)) {
      if(msg.body == 1)
      {
        msg.reply(`*Leadership en Gestion d'Actifs: Votre Réussite, Notre Priorité*\n\nCréée en 2021, *MAKEDA Asset Management* est une Société Anonyme de droit camerounais agréée par la COSUMAF ( Commission de Surveillance du Marché Financier de l’Afrique Centrale) dans la sous-Région CEMAC ( Cameroun, Congo, Gabon, RCA, Gabon et Guinée Equatoriale).\n\nNous adoptons une approche holistique en gestion de portefeuille, alignée sur vos objectifs et valeurs, pour vous aider à atteindre un avenir financier durable et responsable. Nous créeons des véhicules transparents et sécurisés afin de financer l'économie réelle via l'accompagnement des pays de la CEMAC dans la réalisation des différents projets énergétiques, d'adduction d'eau, éducationnels, routiers, agro-alimentaires, etc. Dans le but de les rendre totalement autonomes.\n\n Tapez # pour revenir au menu principal`)
       Steps[msg.from] = "story"
      }
      else if(msg.body == 2)
      {
        msg.reply(`*Services de Gestion d'Actifs par MAKEDA Asset Management* :\n
        
        1. *Gestion sous Mandat* :
           Vous possédez un patrimoine financier et préférez déléguer sa gestion?
           Optez pour notre Service de Gestion Sous Mandat. 
           - Gestion basée sur votre sensibilité au risque
           - Un large univers d'investissement
           - Support client 24/7
        
        2. *Gestion Collective* :
           Nous créons des fonds d'investissement pour agréger les capitaux des investisseurs 
           individuels ou institutionnels en vue de construire des portefeuilles d'investissement 
           offrant une diversification optimale. Ex. OPCVM (FCP, SICAV).
           - Évaluation des besoins
           - Création de véhicule d'investissement
           - Gestion et suivi des performances du véhicule d'investissement
        
        3. *Conseil Financier* :
           La mission de Makeda est de fournir des solutions innovantes et un service de 
           conseil exceptionnel à ses clients.
           - Définition des objectifs
           - Planification financière et Stratégie de financement
        
        Tapez # pour revenir au menu principal
        `);
         Steps[msg.from] = "service"
      }
      else if(msg.body == 3)
      {
        msg.reply(3) 
      }
      else if(msg.body == 4)
      {
        msg.reply(`Parrainage :\n
       Partagez votre code de parrainage unique pour permettre à d'autres de créer un compte sous votre parrainage chez MAKEDA Asset Management.\n
       En tant que parrain, vous bénéficiez également d'avantages.\n
    
       Votre code de parrainage : 14GNR

       Tapez # pour revenir au menu principal
    `);
      }
      else if(msg.body == 5)
      {
        msg.reply(5) 
      }
      else if(msg.body == 6)
      {
        msg.reply(`Vous n'avez pas encore souscris a un service pour le faire Tapez 3.`) 
      }
      else if (msg.body === "#")
      {
        delete Steps[msg.from];
        msg.reply(Menu);
      }else
      {
        msg.reply("Veillez choisir un menu valide");
      }
    }
  } catch (error) {
    logger(client).error('Erreur rencontrée User', error);
    msg.reply(`An internal server error occurred due to an action by user : ${user.data.pseudo}. Our team is working on it. \n\n Please type # to return to the main menu.`)
  }
};

module.exports = {
  UserCommander,
};
