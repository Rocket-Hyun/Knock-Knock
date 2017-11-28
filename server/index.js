var express = require('express');
var mysql = require('mysql');

var app = express();

// secure.txt 참조
var connection = mysql.createConnection({
  host     : '',
  user     : '',
  password : '',
  port     : '',
  database : ''
});

connection.connect();
connection.query('SELECT * from Persons', function(err, rows, fields) {
  if (!err)
    console.log('The solution is: ', rows);
  else
    console.log('Error while performing Query.', err);
});
connection.end();


app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
