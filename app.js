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


// Function to execute the queries in Database with multiple columns in return.
function queryMulColumns(query, callback, errcallback=null) {
  connect(function(connection) {

    const requestmulCol = new Request(query, function(err, rowCount) {
      if (err) {
        if(errcallback) { errcallback(err); }
        console.log('ERROR in QUERY');
      } else {
        console.log(rowCount + ' rows');
      }
      connection.close();
    });

    requestmulCol.on('row', function(columns) {
      callback(columns);
    });
    connection.execSql(requestmulCol);
  });
}
/* global suid */
var suid = 0;

/*
function lookup_session_suid(sessionID) {
   var slackId = sessionID;
   queryDatabase(`select suid from studentprofile where SlackUserID = '${slackId}'`, function(studentID) {
    suid=studentID;
    console.log("suid in func ------>", suid);
  });
}*/

/*
bot.use({
 botbuilder: async function (session, next) {
           console.log("session user name------",session.message.address.user.name);
           console.log("session user id ------",session.message.address.user.id);
           console.log("su id before ---------",suid);
           lookup_session_suid(session.message.address.user.id);
           var slackId=session.message.address.user.id;
           await queryDatabase(`select suid from studentprofile where SlackUserID = '${slackId}'`, function(studentID) {
              suid=studentID;
              console.log("su id after query exec ----------", suid);
            });

           console.log("su id after ----------", suid);
 }
}); */

//var suid = lookup_session_suid(session);
//suid = 2;
console.log("suid is ------>", suid);

// Handling Greeting Intents
bot.dialog('GreetingDialog',
    (session) => {
      var slackId=session.message.address.user.id;
      queryDatabase(`select suid from studentprofile where SlackUserID = '${slackId}'`, function(studentID) {
        suid=studentID;
       });

       queryDatabase(`select TOP 1 Fact from SUFunFacts order by newid()`, function(value) {
        session.send("Hello, Welcome to Syracuse University! I am a bot and here to help you!\n\nDid you know?\n %s \n\n", value);
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
        session.send("You can ask me a question something like:\n1. Show me my profile details. \n2. How much I am due \n3. Enroll me in a class.");
        session.send("So, how can I help you?");
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
bot.dialog('profileDialog', (session, args) => {
  //console.log("Debug: the su id in profile:" , suid);
  var intent = args.intent;
  var profile_field = builder.EntityRecognizer.findEntity(intent.entities, 'profile_field');
  profile_field = profile_field ? profile_field.entity : null;

  if (profile_field == 'email') {
    queryDatabase(`select Email from StudentProfile where SUID=${suid}`, function(value) {
        session.send("Your Email in records is: %s",value);
    });
    }

    else if (profile_field == 'first'){
    queryDatabase(`select FirstName from StudentProfile where SUID=${suid}`, function(value) {
        session.send("Your First name as in records is: %s", value);
    });
    }

    else if (profile_field == 'last'){
    queryDatabase(`select LastName from StudentProfile where SUID=${suid}`, function(value) {
        session.send("Your Last Name as in records is: %s", value);
    });
    }

    else if (profile_field == 'address'){
    queryDatabase(`select ADDRESSLINE from StudentProfile where SUID=${suid}`, function(value) {
      session.send("Your address as in records is:\n %s", value);
    });
    }

    else if (profile_field == 'phone'){
    queryDatabase(`select PHONE from StudentProfile where SUID=${suid}`, function(value) {
      session.send("Your phone number as in records is: %s", value);
    });
    }

    else if (profile_field == 'complete profile' || profile_field == 'profile'){
    queryMulColumns(`select FirstName,  LastName, ProgramName, Email, AddressLine, phone, ClassMode from StudentProfile where SUID=${suid}`, function(student) {

     var firstName, lastName, pgmName, email, address, classMode, phone;
     student.forEach(function(column) {
        if (column.metadata.colName == 'FirstName')
            firstName = column.value;
            else if (column.metadata.colName == 'LastName')
            lastName = column.value;
            else if (column.metadata.colName == 'ProgramName')
            pgmName = column.value;
            else if (column.metadata.colName == 'Email')
            email = column.value;
            else if(column.metadata.colName == 'AddressLine')
            address = column.value;
            else if (column.metadata.colName == 'phone')
            phone = column.value;
            else if(column.metadata.colName == 'ClassMode')
            classMode = column.value;
      });

     session.send("Your profile in University records is as below:\n\nName: %s\nEnrolled in: %s with %s mode.\nYou are reachable at: %s and %s.\nLocated at: %s ", firstName+" "+lastName, pgmName,classMode, email, phone, address);
     });

    }

    else {
    session.send("Sorry! the requested feature is not available at this time. But we will include in future version.");
  }
}).triggerAction({
    matches: 'check_profile'
});


// Handling the Update profile intents
bot.dialog('updateProfile', [ function (session, args) {
  var intent = args.intent;
  var profile_field = builder.EntityRecognizer.findEntity(intent.entities, 'profile_field');
  profile_field = profile_field ? profile_field.entity : null;
  session.dialogData.profile_field = profile_field;

  if (!profile_field) {
    session.send('Sorry, your request is not recognized.');
    session.endDialog();
  }
  else {
    builder.Prompts.text(session, `What is your new ${profile_field}?`);
  }
 },
    function (session, results) {
        var profile_field = session.dialogData.profile_field;
        session.send(`Ok you want to change your ${profile_field} to ${results.response}`);
        session.send(`Updating your ${profile_field}...`);

        if (profile_field == 'email'){
            queryDatabase(`UPDATE StudentProfile SET email = '${results.response}' WHERE suid=${suid}`, function(value){
            });
          }

          else if (profile_field == 'address'){
            queryDatabase(`UPDATE StudentProfile SET addressLine = '${results.response}' WHERE suid=${suid}`, function(value) {
            });
          }

          else if (profile_field == 'phone'){
            queryDatabase(`UPDATE StudentProfile SET phone = '${results.response}' WHERE suid=${suid}`, function(value) {
            });
          }

          else {
            session.send("Sorry! you are not authorized to change it.");

          }

        session.send(`Your ${profile_field} has been updated to ${results.response}`);
    }]).triggerAction({
    matches: 'update_profile'
});


//Handling the accounts intents
bot.dialog('accountsDialog', (session, args) => {
  var intent = args.intent;
  var accounts = builder.EntityRecognizer.findEntity(intent.entities, 'accounts');
  accounts = accounts ? accounts.entity : null;

  if(accounts == 'owe' || accounts == 'due') {
    queryDatabase(`select distinct(termfee) - sum(Paidamount)  from AccountsInformation where SUID=${suid} and DATEPART(quarter, paiddate) = DATEPART(quarter, GETDATE()) and DATEPART(year, paiddate) = YEAR(GETDATE()) group by termfee`, function(value) {
      if (value > 0) {
      session.send("You owe a total of: $%s to the University for this term.",value);}
      else
        session.send("You have no balance due for this term.");
    });
    session.endDialog();
  }

  else
    session.send("Sorry, I didn't understand. Can you please try again?");
}).triggerAction({
  matches: 'accounts'
});


//Handling the class enrollment intents
bot.dialog('enrollDialog', (session, args) => {
  var intent = args.intent;
  var course = builder.EntityRecognizer.findEntity(args.intent.entities, 'course');
  course = course ? course.entity : null;

  if (course == 'available' || course == 'available courses' || course == 'offerings') {         //displays available courses
    session.send("Below are the list of available courses for the upcoming term:\n");
    queryDatabase(`select concat(courseid, ' - ',coursetitle, ' on ',ClassScheduleDay, ' at ', ClassSchedule) as AvailableCourse from AvailableCourses where DATEPART(quarter, term) = DATEPART(quarter, GETDATE()) +1 `, function(value) {
      session.send(value);
      session.endDialog();
    });
  }

  else if(!course) {
    session.send("Sorry, I didn't understand. Please provide correct information.");
  }

  else if(course == 'courses' || course == 'registrations') {                                   //List student registrations

    queryDatabase(`select count(*) as count from StudentEnrolledCourses A, AvailableCourses B where A.courseid = B.courseid and A.SUID=${suid} and A.status='E'`, function(regCount) {
      console.log(regCount);
      if(regCount > 0) {
        session.send("Below are the registered courses:\n");
        queryDatabase(`select concat(A.CourseID,' - ', B.coursetitle) as registered from StudentEnrolledCourses A, AvailableCourses B where A.courseid = B.courseid and A.SUID=${suid} and A.status='E'`, function(registered, rowcount) {
        session.send(registered);
        });
      }

      else if(regCount == 0) {
        session.send("You have no registrations!");
      }

    });
  }

  else {                                                                                      //New Enrollment process
    course = course.toUpperCase();
    queryDatabase(`SELECT COUNT(*) FROM AvailableCourses WHERE courseid='${course}'`, function(value) {

      if(value == 0) {
        session.send(`No course found named with the ID "${course}"`);
      }

      else if(value == 1) {
        session.send("Checking for the seat availability.....");
        queryDatabase(`SELECT Capacity-EnrolledCount FROM AvailableCourses WHERE courseid='${course}' and DATEPART(quarter, term) = DATEPART(quarter, GETDATE()) +1`, function(availableSeats) {
          if (availableSeats == 0) {
            session.send("Sorry this class is full for the term.");
          }
          else {                // Check if this student has already enrolled in this course

            queryDatabase(`SELECT count(*) FROM studentEnrolledCourses WHERE courseid='${course}' AND SUID=${suid}`, function(courseEnrolledCount) {
                if(courseEnrolledCount > 0) {
                  session.send("You have already enrolled in this course.");
                }

                else {          // Class enrollment
                    session.send("%s seat(s) are available at this time.", availableSeats);
                    queryDatabase(`UPDATE AvailableCourses SET EnrolledCount = EnrolledCount + 1 WHERE courseid='${course}'`, function(value) {});
                    queryDatabase(`INSERT INTO StudentEnrolledCourses (SUID, CourseID, status, EnrolledFor) VALUES (${suid},'${course}','E',DATEPART(quarter, GETDATE()) +1 )`, function(value) {});
                    session.send(`Congratulations! You are now enrolled in ${course}.`);
                }
            });                // end of the queryDatebase which checks if enrolled already
          }
        });                   //end of  inner queryDatabase
      }
    });                      //end of outer queryDatabase
  }                         // end of else
}).triggerAction({
  matches: 'enroll'
});


bot.dialog('scheduleDialog', (session, args) => {

  var schedule_field = builder.EntityRecognizer.findEntity(args.intent.entities, 'schedule_field');
  schedule_field = schedule_field ? schedule_field.entity : null;

  if (schedule_field == 'class'){
    session.send("Your class schedule:");
    queryDatabase(`select concat(coursetitle, ' on ',ClassScheduleDay, ' at ', ClassSchedule) as classSchedule from AvailableCourses where CourseID in (select CourseID from StudentEnrolledCourses where suid=${suid})`, function(classSchedule) {
      session.send(classSchedule);
    });
  }

  else if (schedule_field == 'exam'){
    session.send("Your exam schedule:");
    queryDatabase(`select concat( CourseTitle, ' on ', convert(varchar(255), examSchedule, 121) ) from AvailableCourses where CourseID in (select CourseID from StudentEnrolledCourses where suid=${suid})`, function(value) {
      session.send(value);
    });
  }

}).triggerAction({
  matches: 'check_schedule'
});
