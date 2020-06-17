/* 
 * What about serving up static content, kind of like apache? 
 * This time, you are required to present a user and password to the login route
 * before you can read any static content.
 */

var process = require('process');
// run ftd.js as 

// nodejs ftd.js PORT_NUMBER
var port = parseInt(process.argv[2]); 
var express = require('express');
var cookieParser = require('cookie-parser')

var app = express();

app.use(cookieParser()); // parse cookies before processing other middleware

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false })); // support encoded bodies

// ----------------------------------------------------------------------------------
// DATABASE CONNECTION
// ----------------------------------------------------------------------------------
const sqlite3 = require('sqlite3').verbose();
// http://www.sqlitetutorial.net/sqlite-nodejs/connect/
// will create the db if it does not exist
var db = new sqlite3.Database('db/database.db', (err) => {
	if (err) {
		console.error(err.message);
	}
	console.log('Connected to the database.');
});

// ----------------------------------------------------------------------------------
// BEGIN: To restrict access to / 
// ----------------------------------------------------------------------------------
var user="a2group97", password="qwer1234"; // REPLACE THESE TO KEEP OTHERS OUT OF YOUR APPLICATION


app.get('/login/:user/password/:password', function (req, res) {
	if(req.params.user==user && req.params.password==password){
		res.cookie("id",id);
  		res.send("Loggedin");
	} else {
  		res.send("Login failed");
 	}
});

// This is a checkpoint before allowing access to /zzs
app.use('/', function (req, res,next) {
	// if(req.cookies.id==id){
	if(1==1){
		next(); // continue processing routes
	} else {
        res.status(403).send('Not authorized');
	}
});
// ----------------------------------------------------------------------------------
// END: To restrict access to /
// ----------------------------------------------------------------------------------

var id = null;
var loginUsername=null;

app.use('/',express.static('static_files')); // this directory has files to be returned

app.listen(port, function () {
  console.log('Example app listening on port '+port);
});

//    read    GET - Safe, Idempotent, Cachable
//    update  PUT - Idempotent
//    delete  DELETE - Idempotent
//    create  POST

// retrieve logins
app.post('/ftd/api/login/', function (req, res) {
	// http://www.sqlitetutorial.net/sqlite-nodejs/query/
	var username = req.body.username;
	var password = req.body.password;
	// backend validation on empty username or empty password
	if (username == "") {
		result["error"] = "Username required";
		res.status(400).json(result);
		return;
	} 
	if (password == "") {
		result["error"] = "Password required";
		res.status(400).json(result);
		return;
	} 
	let sql = 'SELECT * FROM users WHERE username=? AND password=?;';
	db.all(sql, [username,password], (err, rows) => {
		var result = {};
		result["success"] = 0;
  		if (err) {
			result["error"] = err.message;
			res.status(400).json(result); // invalid
    		
  		} else {
			if (rows.length == 0) {
				result["error"] = "Invalid username or password";
				res.status(400).json(result);
			} else {
				
				rows.forEach((row) => {
					result["success"] = 1;
				});
				id = Math.random().toString(36).substring(2, 15) + 
				Math.random().toString(36).substring(2, 15);
				res.cookie("id",id); // setup cookies
				loginUsername = username; // store the username
				res.status(200).json(result); // ok
			}

		}
	});
});

// retrieve logins
app.post('/ftd/api/register/', function (req, res) {
	var result = {};
	result["success"] = 0;
	//backend validation: pattern checking
	var validation = validateForm(req.body.first, req.body.last, req.body.given, req.body.gender, req.body.dob,
		req.body.yearofstudy, req.body.username, req.body.password, req.body.cpassword, 0);

	if (validation != true) {
		result["error"] = validation;
		res.status(400).json(result);
		return;
	}
	
	let sql = 'INSERT INTO users (username,first,last,given,gender,dob,yearofstudy,password) VALUES(?,?,?,?,?,?,?,?);';
	db.all(sql, [req.body.username,req.body.first,req.body.last,
		req.body.given,req.body.gender,req.body.dob,
		req.body.yearofstudy,req.body.password], (err, rows) => {
			if (err) {
				result["error"] = err.message;
				res.status(400).json(result); // invalid
				
			} else {
				result["success"] = 1;
				res.status(201).json(result); // ok
		}
	});
});

// get user profile
app.get('/ftd/api/profile/', function (req, res) {
	//cookies authentication
	if(req.cookies.id==id && loginUsername !=null){
		let sql = 'SELECT * FROM users WHERE username=?;';
		db.all(sql, [loginUsername], (err, rows) => {
			var result = {};
			result["success"] = 0;
			if (err) {
				result["error"] = err.message;
				res.status(400).json(result);
			} else {
				result["success"] = 1;
				result["profile"] = rows[0];
				res.status(200);
			}
			res.json(result);
		});
	} else {
		result.status(403);
	}
});


// logout
app.delete('/ftd/api/logout/', function (req, res) {
	// clean id
	id = null;
	loginUsername = null;

});

// update user profile
app.put('/ftd/api/update/', function (req, res) {
	var result = {};
	// backend validation: pattern checking
	var validation = validateForm(req.body.first, req.body.last, req.body.given, req.body.gender, req.body.dob,
		req.body.yearofstudy, req.body.username, req.body.password, req.body.cpassword, 1);

	if (validation != true) {
		result["error"] = validation;
		res.status(400).json(result);
		return;
	}
	
	result["success"] = 0;
	// cookies authentication
	if (req.cookies.id==id && loginUsername !=null){
		let sql = "UPDATE users SET first=?,last=?,given=?,gender=?,dob=?,yearofstudy=? WHERE username='"+loginUsername+"';";
		db.all(sql, [req.body.first,req.body.last,
			req.body.given,req.body.gender,req.body.dob,
			req.body.yearofstudy], (err) => {
				if (err) {
					 // invalid
					result["error"] = err.message;
					res.status(400).json(result);
				} else {
					result["success"] = 1;
					res.status(200).json(result);
				}
		});
	} else {
		res.status(403);
	}
});

// delete account
app.delete('/ftd/api/delete/', function (req, res) {
	var result = {};
	// cookie authentication
	if (req.cookies.id==id && loginUsername !=null) {
		var login = loginUsername;
		// delete record from users
		let sql = "DELETE FROM users WHERE username=?;";
		db.all(sql, [login], (err) => {
				if (err) {
					// res.status(404); // invalid
					result["error"] = err.message;
					res.status(400).json(result);
				} else {
					loginUsername=null;
					id=null;
					result["success"] = 1;
					res.status(200);
				}
		});
		// delete records from scores
		sql = "DELETE FROM scores WHERE username=?;";
		db.all(sql, [login], (err) => {
				if (err) {
					// res.status(404); // invalid
					result["error"] = err.message;
					res.status(400).json(result);
				} else {
					loginUsername=null;
					id=null;
					result["success"] = 1;
					res.status(200).json(result);
				}
			
		});
	} else {
		res.status(403);
	}

});

// get leaderboard
app.get('/ftd/api/leaderboard/', function (req, res) {
	// cookies authentication
	if(req.cookies.id==id && loginUsername !=null){
		let sql = 'SELECT username,kills FROM scores ORDER BY kills DESC LIMIT 5;';
		db.all(sql, [], (err, rows) => {
			var result = {};
			result["success"]=0;
			if (err) {
				result["error"] = err.message;
				res.status(400).json(result);
			} else {
				result["stat"] = [];
				rows.forEach((row) => {
					result["stat"].push(row);
				});
				result["success"]=1;
				res.status(200).json(result);
			}
		});
	} else {
		res.status(403);
	}
});

// get personal stat
app.get('/ftd/api/personal/', function (req, res) {
	// cookies authentication
	if(req.cookies.id==id && loginUsername !=null){
		let sql = 'SELECT username,kills FROM scores WHERE username=? ORDER BY kills DESC LIMIT 5;';
		db.all(sql, [loginUsername], (err, rows) => {
			var result = {};
			result["success"]=0;
			if (err) {
				result["error"] = err.message;
				res.status(400).json(result);
			} else {
				result["stat"] = [];
				rows.forEach((row) => {
					result["stat"].push(row);
				});
				result["success"]=1;
				res.status(200).json(result);
			}
		});
	} else {
		res.status(403);
	}
});


app.post('/ftd/api/poststat/', function (req, res) {
	var result = {};
	result["success"] = 0;
	if (Number.isInteger(req.body.kills)) {
		result["error"] = "Invalid kills: not integer";
		res.status(400).json(result);
		return;
	}
	// cookies authentication
	if (req.cookies.id==id && loginUsername !=null) {
		let sql = 'INSERT INTO scores (username,kills) VALUES(?,?);';
		db.all(sql, [loginUsername,req.body.kills], (err, rows) => {
				if (err) {
					result["error"] = err.message;
					res.status(400).json(result);
				} else {
					result["success"] = 1;
					res.status(200).json(result); // ok
				
			}
		});
	} else {
		res.status(403);
	}
});

// 404 route for any unknowns
// keep at the bottom
app.get('*', function(req, res){
	res.status(404).send('404 Not Found');
  });

function validateForm(first, last, given, gender, dob, yearofstudy, username, password, cpassword, type) {
	let pwRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/; // contain at least one lower, at least one upper, a number, length 8 to 20
	let userRegex = /^[A-Za-z0-9]{8,20}$/; // word chars, length 8 to 20
	let strRegex = /^[A-Za-z0-9]{1,20}$/; // word chars, length 1 to 20
	let blankRegex = /^\s*$/; // empty
	let dobRegex = /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/; // YYYY-MM-DD format

	var result = null;
	
	if (!(first.match(strRegex))) {
		result = "First name must be 1-20 characters";
	}
	if (!(last.match(strRegex))) {
		result = "Last name must be 1-20 characters";
	}
	if (!(given.match(strRegex) || given.match(blankRegex))) {
		result = "Given name must be 1-20 characters";
	}
	if (!(gender == 1 || gender == 2)) {
		result = "Please select a gender";

	}
	if (!(dob.match(dobRegex))) {
		result = "Please enter a valid birthdate";

	}
	if (!(yearofstudy >0 || yearofstudy <= 5)) {
		result = "Please enter a valid year of study";

	}
	// type 0 for register form, type 1 for update form
	if (type == 0) {
		if (!(username.match(userRegex))) {
			result = "Username must be 8-20 characters";
		}
		if (!(password.match(pwRegex))) {
			result = "Password must contain at least one lowercase letter, one uppercase letter, a number, and be 8 to 20 characters";
		}
		if (password != cpassword) {
			result = "Passwords must match";
		}
	}
	if (result != null) {
		return result;
	}
	return true;
}