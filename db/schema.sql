--- load with 
--- sqlite3 database.db < schema.sql

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS scores;

CREATE TABLE users (
	username varchar(20) NOT NULL PRIMARY KEY,
	first varchar(20) NOT NULL,
	last varchar(20) NOT NULL,
	given varchar(20),
	gender integer NOT NULL,
	dob varchar(20) NOT NULL,
	yearofstudy integer NOT NULL,
	password varchar(255) NOT NULL
);

CREATE TABLE scores (
	username varchar(20) NOT NULL,
	kills int NOT NULL,
	timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (username, timestamp),

	FOREIGN KEY (username)
	REFERENCES users(username)
);
