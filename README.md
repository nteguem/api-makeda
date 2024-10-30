# Makeka API Bot

Makeka API Bot is a Node.js application that uses Express for building a RESTful API. This project includes features such as authentication, database handling, file uploads, scheduling tasks, and API integration.

## Prerequisites

Before starting, make sure you have the following installed on your machine:
- **Node.js** (v16 or higher is recommended)
- **npm** (Node Package Manager) or **Yarn**
- **MongoDB** (for the database connection)

## Installation Guide

Follow these steps to set up and run the application on your local machine:

### 1. Clone the Repository

Clone the project to your local machine using the following command:

git clone https://github.com/EjaraApp/makeda-saba
cd makeda-saba

### 2. Install Dependencies

 After cloning the repository, you need to install the required dependencies. You can do this using npm or Yarn:

 Using npm:
npm install

# Or using Yarn:
yarn install

### 3. Configure Environment Variables
 Create a `.env` file in the root of the project directory and add the following environment variables to configure your application:

### 4. Running the Application
 You can start the application in one of the following ways:

# Using Node.js:
node app.js

# Using Nodemon:
yarn start
# This will execute the `start` script defined in your `package.json`, which runs `nodemon app.js`.

### 5. Scanning the WhatsApp QR Code
#To establish a connection with WhatsApp, the application generates a unique string that can be converted into a QR code. When the application is launched, it will send this string to a specified port, which can be accessed through a socket connection.

# Overview of the Process:

- **Start the Server**: Run the application using `node app.js` or `yarn start`. The server will listen for incoming connections.

- **Receive the Connection String**: Upon running the server, a unique connection string is generated. This string will be sent to the front-end application (back office) via a socket.

- **Generate the QR Code**: The front-end application will utilize this connection string to create a QR code that can be scanned by the WhatsApp mobile application.

- **Scan the QR Code**: Users can open the WhatsApp application and  to scan the generated QR code in the application front.

- **Establish Connection**: After scanning, the WhatsApp client connects to the application. The connection allows for ongoing communication, with the backend continuously receiving the client's phone number.

#Make sure the front-end application is configured to connect to the server's port to ensure smooth communication.


### 6. Testing the Server
 Once the server is running, you can access the API locally at: http://localhost:4500
 (assuming your app is set to use port 4500).

## Features

- **Authentication**: Secure user authentication using JWT.
- **Database**: MongoDB as the database, managed using Mongoose.
- **File Uploads**: File handling and uploads using Multer.
- **Scheduling**: Task scheduling with node-cron.
- **WhatsApp Integration**: Communication capabilities through `whatsapp-web.js`.

## Available Scripts

Here are the scripts defined in the project that you can use:

- `start`: Starts the server with Nodemon (`nodemon app.js`), which automatically restarts the server on file changes.
- `test`: Placeholder for running tests. Currently, no tests are specified.

## Dependencies

Some of the key dependencies used in this project include:

- **express**: A minimal and flexible Node.js web application framework.
- **mongoose**: A MongoDB object data modeling (ODM) library.
- **jsonwebtoken**: For authentication using JWT.
- **dotenv**: To manage environment variables.
- **nodemon**: A utility that monitors for file changes and automatically restarts the server during development.
- **whatsapp-web.js**: For interacting with the WhatsApp Web API.

Refer to the `package.json` file for the complete list of dependencies.


