const Campaign = require('../models/campaign.model');
const cron = require('node-cron');
const {sendMessageToNumber} = require('../helpers/whatsApp/whatsappMessaging')
const {list} = require('./user.service')
const { getRandomDelay } = require("../helpers/utils")

let tasks = {};
async function createCampaign(campaignData, client) {
  try {
    const newCampaign = new Campaign(campaignData);
    await newCampaign.save();
    await updateCampaignTasks(client);
    return { success: true, message: 'Campagne créée avec succès' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function updateCampaign(campaignId, updatedData, client) {
  try {
    const campaign = await Campaign.findByIdAndUpdate(campaignId, updatedData, { new: true });
    if (!campaign) {
      return { success: false, error: 'Campagne non trouvée' };
    }
    await updateCampaignTasks(client);
    return { success: true, message: 'Campagne mise à jour avec succès', campaign };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function deleteCampaign(campaignId, client) {
  try {
    const campaign = await Campaign.findByIdAndDelete(campaignId);
    if (!campaign) {
      return { success: false, error: 'Campagne non trouvée' };
    }
    await updateCampaignTasks(client);
    return { success: true, message: 'Campagne supprimée avec succès' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function listCampaigns(data,client) {
  try {
    const { type } = data;
    let query = {};
    if (type) {
      query = { type };
    }
    const campaigns = await Campaign.find(query);
    return { success: true, campaigns };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function updateCampaignTasks(client) {
    await scheduleCampaignTasks("stop");
    await scheduleCampaignTasks("start",client);
}

async function sendCampaignWhatapp(client, titre, description) {
    let listUser;
    const successfulTargets = []; 
    try {
        listUser = await list();
        for (const targetUser of listUser.users) {
            try {
                const content = `Salut ${targetUser.pseudo},\n\n${titre} \n\n*${description}* \n\n Votre avenir financier, notre expertise personnalisée 🤝`;
                await sendMessageToNumber(client, `${targetUser.phoneNumber}@c.us`, content);
                successfulTargets.push(targetUser); 
                const delay = getRandomDelay(5000, 15000);
                await new Promise(resolve => setTimeout(resolve, delay));
            } catch (error) {
                console.log(`Erreur lors de l'envoi de la campagne sur WhatsApp pour ${targetUser.pseudo}`, error);
            }
        }
    } catch (error) {
        console.log(`Erreur lors de la récupération de la liste des utilisateurs`, error);
    } finally {
        console.log("Liste des utilisateurs ayant reçu la campagne avec succès :\n ",successfulTargets);
    }
}


  // Fonction pour exécuter une campagne
function runCampaign(campaign,client) {
    sendCampaignWhatapp(client,campaign.name,campaign.description)
}

// Fonction pour planifier les tâches de campagne
async function scheduleCampaignTasks(launch,client) {
    if(launch === "stop")
    {
        Object.keys(tasks).forEach(task => {
            tasks[task].stop();
          });
    }
    const result = await listCampaigns({ type: 'Automatically' });
    result?.campaigns?.forEach((campaign, index) => {
        let cronExpression;

        switch (campaign.periodicity.toLowerCase()) {
            case "daily":
                cronExpression = '27 21 * * *';
                break;
            case "weekly":
                cronExpression = '02 21 * * *';
                break;
            case "monthly":
                cronExpression = '03 21 * * *';
                break;
            default:
                console.error(`Périodicité non prise en charge pour la campagne "${campaign.name}"`);
                return;
        }

        // Planifier la tâche pour la campagne
       tasks[`campaignTask${index}`] =  cron.schedule(cronExpression, () => {
            runCampaign(campaign, client);
        }, { scheduled: false,  name: `campaignTask${index}`
    });

        if(launch === "start")
        {
            tasks[`campaignTask${index}`].start();
        }
    });
}

module.exports = {
  createCampaign,
  updateCampaign,
  deleteCampaign,
  listCampaigns,
  scheduleCampaignTasks
};
