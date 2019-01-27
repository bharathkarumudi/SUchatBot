/*-----------------------------------------------------------------------------
A simple Language Understanding (LUIS) bot for the Microsoft Bot Framework.
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
var azure = require('azure-storage');
var connect = require('./DatabaseManager');
var Tedious = require('tedious'); // Only require a library once per file
var Connection = Tedious.Connection;
var Request = Tedious.Request;


// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Listen for messages from users
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot.
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
// This default message handler is invoked if the user's utterance doesn't
// match any intents handled by other dialogs.
var bot = new builder.UniversalBot(connector, function (session, args) {
    session.send('You reached the default message handler. You said \'%s\'.', session.message.text);
});

bot.set('storage', tableStorage);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey;

// Create a recognizer that gets intents from LUIS, and add it to the bot
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer);

// Add a dialog for each intent that the LUIS app recognizes.
// See https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-recognize-intent-luis
bot.dialog('GreetingDialog',
    (session) => {
        session.send('You reached the Greeting intent. You said \'%s\'.', session.message.text);
        session.endDialog();
    }
    ).triggerAction({
    matches: 'Greeting'
})

bot.dialog('HelpDialog',
    (session) => {
        session.send('You reached the Help intent. You said \'%s\'.', session.message.text);
        session.endDialog();
    }
    ).triggerAction({
    matches: 'Help'
})

bot.dialog('CancelDialog',
    (session) => {
        session.send('You reached the Cancel intent. You said \'%s\'.', session.message.text);
        session.endDialog();
    }
    ).triggerAction({
    matches: 'Cancel'
})


/*
bot.dialog('profileDialog', (session) => {
        session.send('You reached the profile intent. You said \'%s\'.', session.message.text);

        console.log('Reading rows from the Table...');
        dbconnection("select FNAME from StudentProfile where SUID=1"),
        function (err, result, fields) {
            if (err) throw err;
            console.log(result);
        }


          session.endDialog();
    }
    ).triggerAction({
    matches: 'profile'
})*/


bot.dialog('profileDialog',(session) => { // Hey, this is a callback too!
    session.send('You reached the profile intent. You said \'%s\'.', session.message.text);

    console.log('Creating a connection');

    //connect((connection) => {
    // or with the traditional function notation
    connect(function (connection) {
        console.log('Reading rows from the Table...');

        // Execute your queries here using your connection

        request = new Request("select FNAME from StudentProfile where SUID=1", function (err, rowCount) { // Look another callback!
            if (err) {
                console.log('ERROR in QUERY');
            } else {
                console.log(rowCount + ' rows');
            }
            connection.close();
        });

        request.on('row', function (columns) {  // Iterate through the rows using a callback
            columns.forEach(function (column) {
                if (column.value === null) {
                    console.log('NULL');
                } else {
                    console.log("%s\t%s", column.metadata.colName, column.value);
                }
            });
        });
        connection.execSql(request);
    });


} //end of dialog

    ).triggerAction({
    matches: 'profile'
})
