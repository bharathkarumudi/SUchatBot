var Tedious = require('tedious'); // Only require a library once per file
var Connection = Tedious.Connection;
var Request = Tedious.Request;


function connect(cb) { // cb is short for callback. It should be a function.

    var config = {
        userName: '',
        password: '',
        server: '.database.windows.net',
        options:
          {
              database: '',
              encrypt: true
          }
     };

    var connection = new Connection(config);
    connection.on('connect', function(err) { // Attempt to connect and execute queries if connection goes through
        if (err) {
            console.log(err);
            return; // Stop executing the function if it failed
        }

        console.log('CONNECTED TO DATABASE');
        cb(connection);
    });
 }  //End of function connect

module.exports = connect; // This exports a function that creates the connection
