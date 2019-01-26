var Connection = require('tedious').Connection;
var Request = require('tedious').Request;


var sqlConnection = function sqlConnection() {
// Create connection to database
var config =
  {
    userName: '',
    password: '',
    server: '',
    options:
      {
        database: '', 
        encrypt: true
      }
  }

var connection = new Connection(config);
// Attempt to connect and execute queries if connection goes through

connection.on('connect', function(err) {
  if (err) {
            console.log(err)
   }

   else {
     console.log('CONNECTED TO DATABASE');
   }

 }
 );
}
module.exports = sqlConnection;
