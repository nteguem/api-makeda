const csvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require("fs");

async function generateAndDownloadCSV(data,nameFile) {
    try {
      const csvHeader = Object.keys(data[0]).map(key => ({ id: key, title: key }));
      // Create CSV writer
      const csvWriterInstance = csvWriter({
        path: `${nameFile}_list.csv`,
        header: csvHeader
      });
  
      // Write users to CSV
      await csvWriterInstance.writeRecords(data);
  
      return `${nameFile}_list.csv`; // Return the path of the created CSV file
    } catch (error) {
      throw new Error('Error generating CSV file', error);
    }
  }
  
async function deleteCSVFile(filePath) {
    try {
        fs.unlinkSync(filePath);
    } catch (error) {
        console.error('Error deleting CSV file:', error);
    }
}

module.exports = {
    generateAndDownloadCSV,
    deleteCSVFile
};
