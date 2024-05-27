const { MessageMedia } = require('whatsapp-web.js');
const logger = require("../logger")

// Fonction pour envoyer un message à un numéro spécifique
const sendMessageToNumber = async (client, phoneNumber, message) => {
    try {
      await client.sendMessage(`${phoneNumber}@c.us`, message);
    } catch (error) {
      logger(client).error('Error sending message:', error);
    }
  };
  
  // Fonction pour envoyer un média (PDF, image, etc.) à un numéro spécifique
  const sendMediaToNumber = async (client, phoneNumber, mediaType, mediaBase64, filename) => {
    try {
      const media = new MessageMedia(mediaType, mediaBase64, filename);
      await client.sendMessage(`${phoneNumber}@c.us`, media);
    } catch (error) {
      logger(client).error('Error sending media:', error);
    }
  };
  
  
  module.exports = {
    sendMessageToNumber,
    sendMediaToNumber
  };