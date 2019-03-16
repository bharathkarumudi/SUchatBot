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
var util = require('util');

function lookup_session_suid(session) {
    // TODO replace hardcoded SUID with a lookup from Facebook or Slack identity

    return 2;
}


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

var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer);

// Function to execute the queries in Database

function queryDatabase(query, callback, errcallback=null) {
  connect(function(connection) {

    const request = new Request(query, function(err, rowCount) {
      if (err) {
        if(errcallback) { errcallback(err); }
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
        }
      });
    });
    connection.execSql(request);
  });
}

// Handling Greeting Intents

bot.dialog('GreetingDialog',
    (session) => {
        //session.send('You reached the Greeting intent. You said \'%s\'.', session.message.text);
        session.send('Hello, How can I help you?');
        queryDatabase(`SELECT Fact FROM table ORDER BY RAND() LIMIT 1`, function(value) {
          session.send("Do you know?\n: %s",value);
          session.endDialog();
        });
    }
    ).triggerAction({
    matches: 'Greeting'
});

// Handling the Help Intents
bot.dialog('HelpDialog',
    (session) => {
        //session.send('You reached the Help intent. You said \'%s\'.', session.message.text);
        session.send("You can ask me:\n1.What is my email? \n2.Show me my profile details? \n3. Enroll me in a class.")
        session.endDialog();
    }
    ).triggerAction({
    matches: 'Help'
});

// Handling the Cancel Intents
bot.dialog('CancelDialog',
    (session) => {
        //session.send('You reached the Cancel intent. You said \'%s\'.', session.message.text);
        session.send('Ok, canceling the request.');
        session.endDialog();
    }
    ).triggerAction({
    matches: 'Cancel'
});

// Handling Profile related Intents
bot.dialog('profileDialog', (session, args, next) => {
  var suid = lookup_session_suid(session);
  var intent = args.intent;
  var profile_field = builder.EntityRecognizer.findEntity(intent.entities, 'profile_field');
  profile_field = profile_field ? profile_field.entity : null;

  var userMessage = session.message.text;

  if (profile_field == 'email') {
    queryDatabase(`select Email from StudentProfile where SUID=${suid}`, function(value) {
      session.send("Your Email in records is: %s",value);
    });

	} else if (profile_field == 'first'){
    queryDatabase(`select FNAME from StudentProfile where SUID=${suid}`, function(value) {
      session.send("Your First name as in records is: %s", value);
    });

  	} else if (profile_field == 'last'){
    queryDatabase(`select LNAME from StudentProfile where SUID=${suid}`, function(value) {
      session.send("Your Last Name as in records is: %s", value);
    });
   	} else if (profile_field == 'address'){
    queryDatabase(`select ADDRESSLINE from StudentProfile where SUID=${suid}`, function(value) {
      session.send("Your address as in records is:\n %s", value);
  });
   } else if (profile_field == 'phone'){
    queryDatabase(`select PHONE from StudentProfile where SUID=${suid}`, function(value) {
      session.send("Your phone number as in records is: %s", value);
  });
   } else if (profile_field == 'complete profile' || profile_field == 'profile'){
    queryDatabase(`select FNAME,  LNAME, ProgramName, Email, AddressLine, ClassMode from StudentProfile where SUID=${suid}`, function(value) {
      session.send(value);
    });
  }
  else {
    session.send("Sorry! the requested feature is not available at this time. But we will take this feedback and include in future version.");
  }
}).triggerAction({
    matches: 'check_profile'
});


// Handling the Update profile intents
bot.dialog('updateProfile', [ function (session, args) {
    var suid = lookup_session_suid(session);
    //session.send('You reached the update_profile intent. You said \'%s\'.', session.message.text);
    var intent = args.intent;
    //  var update = builder.EntityRecognizer.findEntity(intent.entities, 'update');
    //   update = update ? update.entity : null;

    var profile_field = builder.EntityRecognizer.findEntity(intent.entities, 'profile_field');
    profile_field = profile_field ? profile_field.entity : null;
    session.dialogData.profile_field = profile_field;

    if (!profile_field) {
        session.send('Sorry, your request is not recognized.');
        session.endDialog();
    } else {
       builder.Prompts.text(session, `What is your new ${profile_field}?`);
    }
  },
  	function (session, results) {
    	var profile_field = session.dialogData.profile_field;
    	var suid = lookup_session_suid(session);
    	session.send(`Ok you want to change your ${profile_field} to ${results.response}`);
    	session.send(`Updating your ${profile_field}...`);

    	if (profile_field == 'email'){
    		queryDatabase(`UPDATE StudentProfile SET email = '${results.response}' WHERE suid=${suid}`, function(value){
    		});

    	} else if (profile_field == 'address'){
    		queryDatabase(`UPDATE StudentProfile SET addressLine = '${results.response}' WHERE suid=${suid}`, function(value) {
      		});

      	} else if (profile_field == 'phone'){
      		queryDatabase(`UPDATE StudentProfile SET phone = '${results.response}' WHERE suid =${suid}`, function(value) {
     		});

    	} else {
    		session.send("Sorry! the requested feature is not available at this time. But we will take this feedback and include in future version.");
    	}

    	session.send(`Your ${profile_field} has been updated to ${results.response}`);
    }]).triggerAction({
    matches: 'update_profile'
});


//Handling the accounts intents
bot.dialog('accountsDialog', (session, args, next) => {
  var suid = lookup_session_suid(session);
  session.send('You reached the accounts intent. You said \'%s\'.', session.message.text);
  var intent = args.intent;
  var accounts = builder.EntityRecognizer.findEntity(intent.entities, 'accounts');
  accounts = accounts ? accounts.entity : null;
  //Debug message
  session.send(`accounts: ${accounts}`);

  if (accounts == 'owe' || accounts == 'due') {
    queryDatabase(`select TermFee-PaidAmount from Accounts WHERE suid=${suid}`, function(value) {
      if (value > 0) {
      session.send("You owe: $%s",value);}
      else {session.send("You have no balance due.");}
  });
  session.endDialog();
  }
}).triggerAction({
  matches: 'accounts'
});


//Handling the class enrollment intents
bot.dialog('enrollDialog', (session, args, next) => {
  var suid = lookup_session_suid(session);
  //session.send('You reached the %s intent. You said \'%s\'.', args.intent.intent, session.message.text);
  var course = builder.EntityRecognizer.findEntity(args.intent.entities, 'course');
  course = course ? course.entity : null;

  if (!course) {
    session.send("Sorry, I don't know which course you want to enroll in.");
  }
  else {
    var errfunc = function(err) {
      session.send(`sql error: ${err}`);
    }
    course = course.toUpperCase();
    queryDatabase(`SELECT COUNT(*) FROM Courses WHERE courseid='${course}'`, function(value) {
      session.send(`courses found with this course id = ${value}`);
      if(value == 0) {
        session.send(`No course found named "${course}"`);
      }
      else {
        session.send(`Enrolling you in "${course}"...`);
        queryDatabase(`SELECT Capacity-EnrollCount FROM Courses WHERE courseid='${course}'`, function(value) {
          session.send(`capacity - enrollment = ${value}`);
          if (value == 0) {
            session.send("Sorry this class is full");
          }
          else {
            queryDatabase(`UPDATE Courses SET EnrollCount = EnrollCount + 1 WHERE courseid='${course}'`, function(value) {}, errfunc);
            queryDatabase(`INSERT INTO StudentEnrolledCourses (CourseID) VALUES ('${course}')`, function(value) {}, errfunc);
            session.send(`You are now enrolled in ${course}`);
          }
        }, errfunc);
      }
    });
  }
}).triggerAction({
  matches: 'enroll'
});

/*
bot.dialog('scheduleDialog', (session, args) => {
 // var userMessage = session.message.text;
  var suid = lookup_session_suid(session);
  session.send('You reached the check the schedule intent');
  var intent = args.intent;
  var schedule = builder.EntityRecognizer.findEntity(intent.entities, 'schedule');
  //if (userMessage.toLowerCase().indexOf('class') >=0 ) {
  if (schedule == 'class'){
    session.send("Your class schedule:");
    queryDatabase("select CourseTitle, ScheduleDay from Courses where CourseID in (select CourseID from StudentEnrolledCourses where SUid = 1)", function(value) {
      session.send(value);
  });
  else if (schedule == 'exam'){
    session.send("Your exam schedule:");
    queryDatabase("select CourseTitle, ScheduleDay from Courses where CourseID in (select CourseID from StudentEnrolledCourses where SUid = 1)", function(value) {
      session.send(value);
  //session.endDialog();
  }
}).triggerAction({
  matches: 'check_schedule'
});
*/

bot.dialog('debugDialog', (session) => {
  // This intent for debugging only. TODO: hide from users.
  var suid = lookup_session_suid(session);
  session.send(`suid = ${suid}`);
  var session_info = util.inspect(session);
  session.send(`session = ${session_info}`);
  session.endDialog();
}).triggerAction({
  matches: 'Debug'
});
