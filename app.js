/*-----------------------------------------------------------------------------
A simple Language Understanding (LUIS) bot for the Microsoft Bot Framework.
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
var azure = require('azure-storage');
var connect = require('./DatabaseManager');
var Tedious = require('tedious');
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
//var recognizer = new builder.LuisRecognizer({'en': LuisModelUrl});
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer);

// Add a dialog for each intent that the LUIS app recognizes.
// See https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-recognize-intent-luis

/*
var intents = new builder.IntentDialog({ recognizers: [recognizer] })

  .matches('profile', [(session, args) => {
  console.log(args.score);
  console.log('##### Test Message......!');

  if (args.score > 0.8) {
    session.beginDialog('profile');
  }
  else {
    session.send('We are working on this');

  }
}])
*/

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

function queryDatabase(query, callback) {
//                            ^^^^^^^^
  connect(function(connection) {

    const request = new Request(query, function(err, rowCount) {
//  ^^^^^ use local variable
      if (err) {
        console.log('ERROR in QUERY');
      } else {
        console.log(rowCount + ' rows');
      }
      connection.close();
    });

    request.on('row', function(columns) {
      columns.forEach(function(column) {
        if (column.value === null) {
          console.log('NULL');
        } else {
          callback(column.value);
//        ^^^^^^^^
        }
      });
    });
    connection.execSql(request);
  });
}


bot.dialog('profileDialog', (session) => {

  session.send('You reached the profile intent. You said \'%s\'.', session.message.text);
  console.log('Creating a connection');

  var userMessage = session.message.text;
  if (userMessage.toLowerCase().indexOf('email') >= 0) {
    session.send('Your are looking for your email');
    queryDatabase("select Email from StudentProfile where SUID=1", function(value) {
//                                                               ^^^^^^^^^^^^^^^^^
      session.send(value);
    });
    session.endDialog();
  } else if (userMessage.toLowerCase().indexOf('first name') >=0 ){
    queryDatabase("select FNAME from StudentProfile where SUID=1", function(value) {
      session.send(value);
    });
  } else if (userMessage.toLowerCase().indexOf('last name') >=0 ){
    queryDatabase("select LNAME from StudentProfile where SUID=1", function(value) {
      session.send(value);
    });
  }  else if (userMessage.toLowerCase().indexOf('complete profile') >=0 ){
    console.log("Executing complete profile");
    queryDatabase("select FNAME,  LNAME, ProgramName, Email, AddressLine, City, StateCode, Zip, ClassMode from StudentProfile where SUID=1", function(value) {
      session.send(value);
    });
  }

  else {
    session.send("We are still working on this functionality");
  }
}).triggerAction({
    matches: 'profile'
})


bot.dialog('accountsDialog', (session) => {
  session.send('You reached the accounts intent. You said \'%s\'.', session.message.text);
  var userMessage = session.message.text;

  if (userMessage.toLowerCase().indexOf('owe') >=0 ) {
    queryDatabase("select TermFee-PaidAmount from Accounts where SUID=1", function(value) {
      session.send("You owe: $%s",value);
  });
  session.endDialog();
  }

}).triggerAction({
  matches: 'accounts'
})



bot.dialog('courseDialog', (session) => {
  session.send('You reached the Course intent. You said \'%s\'.', session.message.text);
  var userMessage = session.message.text;

  if (userMessage.toLowerCase().indexOf('course list') >=0 ) {
    queryDatabase("select coursetitle from Courses", function(value) {
      session.send("You owe: $%s",value);
  });
  session.endDialog();
  }

}).triggerAction({
  matches: 'accounts'
})
