const logger = require('../../helpers/logger');
const { sendMessageToNumber } = require('./whatsappMessaging');

let Steps = {};

const defaultRate = 0.0525; // Taux de placement annuel par défaut (5,25%)

const calculatePeriodicInvestment = (amount, duration, frequency) => {
    let i;
    switch (frequency.toLowerCase()) {
        case 'mensuelle':
            i = Math.pow(1 + defaultRate, 1 / 12) - 1;
            break;
        case 'trimestrielle':
            i = Math.pow(1 + defaultRate, 1 / 4) - 1;
            break;
        case 'semestrielle':
            i = Math.pow(1 + defaultRate, 1 / 2) - 1;
            break;
        case 'annuelle':
        default:
            i = defaultRate;
            break;
    }
    const n = duration * (frequency.toLowerCase() === 'annuelle' ? 1 : frequency.toLowerCase() === 'semestrielle' ? 2 : frequency.toLowerCase() === 'trimestrielle' ? 4 : 12);
    const VP = amount * (((Math.pow(1 + i, n) - 1) * (1 + i)) / i); // Correction de la formule
    const totalPeriodicInvestments = amount * n;
    return {
        capitalizedValue: Math.round(VP), // Arrondi à la valeur la plus proche
        totalPeriods: n,
        totalPeriodicInvestments: totalPeriodicInvestments
    };
};

const cleanAmount = (amountStr) => {
    return parseFloat(amountStr.replace(/[^0-9,.]/g, '').replace(/,/g, '.').replace(/\.(?=.*\.)/g, ''));
};

const cleanDuration = (durationStr) => {
    return parseInt(durationStr.replace(/[^0-9]/g, ''));
};

const calculateSingleInvestment = (amount, duration) => {
    const VP = amount * Math.pow(1 + defaultRate, duration);
    return Math.round(VP); // Arrondi à la valeur la plus proche
};

const GainSimulationCommander = async (user, msg, client) => {
    try {
        if (!('participant' in msg.id)) {
            if (!Steps[msg.from]) {
                Steps[msg.from] = {};
                Steps[msg.from]["currentMenu"] = "selectInvestmentMethod";
            } else if (msg.body == "*") {
                Steps[msg.from]["currentMenu"] = "selectInvestmentMethod";
            }
            const currentMenu = Steps[msg.from]["currentMenu"];

            switch (currentMenu) {
                case "selectInvestmentMethod":
                    switch (msg.body) {
                        case "1":
                            msg.reply(`Veuillez saisir le montant à investir (exemple : 100 000 FCFA) :`);
                            Steps[msg.from]["currentMenu"] = "enterPeriodicAmount";
                            break;
                        case "2":
                            msg.reply(`Veuillez saisir le montant à investir (exemple : 10 000 000 FCFA) :`);
                            Steps[msg.from]["currentMenu"] = "enterSingleAmount";
                            break;
                        default:
                            msg.reply(`📋 *Veuillez saisir votre méthode de versement*.\n\n 1-Versement périodique, Tapez 1\n 2-Versement unique, Tapez 2\n\n_Tapez * 𝗉𝗈𝗎𝗋 une nouvelle simulation, # pour revenir au menu principal_`);
                    }
                    break;

                case "enterPeriodicAmount":
                    const periodicAmount = cleanAmount(msg.body);
                    if (isNaN(periodicAmount)) {
                        msg.reply(`Montant invalide. Veuillez saisir un montant valide (exemple : 100 000 FCFA) :`);
                    } else {
                        Steps[msg.from]["periodicAmount"] = periodicAmount;
                        msg.reply(`Veuillez saisir la durée de placement (exemple : 2 ans) :`);
                        Steps[msg.from]["currentMenu"] = "enterPeriodicDuration";
                    }
                    break;

                case "enterPeriodicDuration":
                    const periodicDuration = cleanDuration(msg.body);
                    if (isNaN(periodicDuration)) {
                        msg.reply(`Durée invalide. Veuillez saisir une durée valide (exemple : 2 ans) :`);
                    } else {
                        Steps[msg.from]["periodicDuration"] = periodicDuration;
                        msg.reply(`📋 *Veuillez saisir la fréquence de versement* :\n 1- Mensuelle\n 2- Trimestrielle\n 3- Semestrielle\n 4- Annuelle`);
                        Steps[msg.from]["currentMenu"] = "enterPeriodicFrequency";
                    }
                    break;

                case "enterPeriodicFrequency":
                    let frequency;
                    switch (msg.body) {
                        case "1":
                            frequency = 'mensuelle';
                            break;
                        case "2":
                            frequency = 'trimestrielle';
                            break;
                        case "3":
                            frequency = 'semestrielle';
                            break;
                        case "4":
                            frequency = 'annuelle';
                            break;
                        default:
                            msg.reply(`Fréquence invalide. Veuillez saisir :\n1. Mensuelle\n2. Trimestrielle\n3. Semestrielle\n4. Annuelle`);
                            return;
                    }
                    const periodicInvestment = calculatePeriodicInvestment(Steps[msg.from]["periodicAmount"], Steps[msg.from]["periodicDuration"], frequency);
                    const totalPeriods = periodicInvestment.totalPeriods;
                    const totalPeriodicInvestments = periodicInvestment.totalPeriodicInvestments.toLocaleString();
                    const capitalizedValue = periodicInvestment.capitalizedValue.toLocaleString();
                    msg.reply(`La valeur de votre placement à la fin de ${Steps[msg.from]["periodicDuration"]} ${Steps[msg.from]["periodicDuration"] > 1 ? 'années' : 'année'} est de ${capitalizedValue} FCFA.\n\n- Nombre de périodes de versement : ${totalPeriods}\n- Montant total des versements : ${totalPeriodicInvestments} FCFA\n- Total capitalisé : ${capitalizedValue} FCFA\n\nPour plus d’informations sur la valeur de votre placement, veuillez prendre attache avec l’un de nos conseillers en cliquant sur le lien : https://wa.me/qr/TO6XP47O5T2JC1\n\n_Tapez * 𝗉𝗈𝗎𝗋 une nouvelle simulation, # pour revenir au menu principal_`);
                    Steps[msg.from]["currentMenu"] = "mainMenu";
                    break;

                case "enterSingleAmount":
                    const singleAmount = cleanAmount(msg.body);
                    if (isNaN(singleAmount)) {
                        msg.reply(`Montant invalide. Veuillez saisir un montant valide (exemple : 10 000 000 FCFA) :`);
                    } else {
                        Steps[msg.from]["singleAmount"] = singleAmount;
                        msg.reply(`Veuillez saisir la durée de placement (exemple : 3 ans) :`);
                        Steps[msg.from]["currentMenu"] = "enterSingleDuration";
                    }
                    break;

                case "enterSingleDuration":
                    const singleDuration = cleanDuration(msg.body);
                    if (isNaN(singleDuration)) {
                        msg.reply(`Durée invalide. Veuillez saisir une durée valide (exemple : 3 ans) :`);
                    } else {
                        const singleInvestmentValue = calculateSingleInvestment(Steps[msg.from]["singleAmount"], singleDuration);
                        msg.reply(`La valeur de votre placement à la fin de ${singleDuration} ${singleDuration > 1 ? 'années' : 'année'} est de ${singleInvestmentValue.toLocaleString()} FCFA. Pour plus d’informations sur la valeur de votre placement, veuillez prendre attache avec l’un de nos conseillers en cliquant sur le lien : https://wa.me/qr/TO6XP47O5T2JC1\n\n_Tapez * 𝗉𝗈𝗎𝗋 une nouvelle simulation, # pour revenir au menu principal_`);
                        Steps[msg.from]["currentMenu"] = "mainMenu";
                    }
                    break;

                case "mainMenu":
                    msg.reply(`📋 *Veuillez saisir votre méthode de versement*.\n\n 1-Versement périodique, Tapez 1\n 2-Versement unique, Tapez 2\n\n_Tapez * 𝗉𝗈𝗎𝗋 une nouvelle simulation, # pour revenir au menu principal_`);
                    if (msg.body == "1" || msg.body == "2") {
                        Steps[msg.from]["currentMenu"] = "selectInvestmentMethod";
                    } else {
                        msg.reply("Commande saisie incorrecte. Veuillez saisir 1 ou 2\n\n_Tapez * 𝗉𝗈𝗎𝗋 une nouvelle simulation, # pour revenir au menu principal_");
                    }
                    break;

                default:
                    Steps[msg.from]["currentMenu"] = "mainMenu";
                    msg.reply("Commande saisie incorrecte\n\n_Tapez * 𝗉𝗈𝗎𝗋 une nouvelle simulation, # pour revenir au menu principal_");
            }
        }
    } catch (error) {
        logger(client).error('Erreur rencontrée Simulator', error);
        msg.reply(`An internal server error occurred due to an action by administrator : ${user.data.pseudo}. Our team is working on it. \n\n Please type # to return to the main menu.`);
    }
};

module.exports = {
    GainSimulationCommander,
};
