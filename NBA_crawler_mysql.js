const creeper = require("nbacrawler");
const mysql = require("mysql");

//	Here to modify the sql infomation.
const HOST = "localhost";	
const USER = "ken";
const PASSWORD = "ab0809";
const DATABASE = "NBA";
const TABLE = "Games";

//Here to modify the sql sentence.
const insert_sql = "INSERT INTO " + TABLE + " (Date, Home_Team, Guest_Team, Home_Score, Guest_Score) VALUES ?";
const select_sql = "SELECT * FROM " + TABLE + ";";	//	The date that program shows will minus one, but the data in database is correct date.

start();

function start(){
	var start_date = new Date(2017, 1 - 1, 1);	//	month 0~11, date 1~31.
	var end_date = new Date(2017, 2 - 1, 1);
	var during_day = (end_date - start_date) / 1000 / 60 / 60 / 24;

	Promise.all([
		connect_mysql(HOST, USER, PASSWORD, DATABASE),
		creeper.makeInfo(start_date)
		]).then(async function(results){
			var connection = results[0];
			var info = results[1];

			/*connection.query(insert_sql, [info], function(err, result){	//	insert
				if(err)
					throw err;
				console.log(result);
				console.log("\n");
			});
			
			for(let i = 0; i < during_day; i++){
				await start_date.setDate(start_date.getDate() + 1);

				await creeper.makeInfo(start_date).then(function(result){
					connection.query(insert_sql, [result], function(err, result){	//	insert
						if(err)
							throw err;
						console.log(result);
						console.log("\n");
					});
				})
			}*/

			/*connection.query(select_sql, function(err, result, fields){		//	select
				if(err)
					throw err;
				console.log(result);
			});*/

			truncate_mysql(connection, TABLE);

			connection.end(function(err){	//	connection ended
				if(err)
					throw err;
				console.log("connection ended");
			});
		})
}

function connect_mysql(host, user, password, database){
	return new Promise(function(resolve, reject){
		var connect_info_obj = {};

		connect_info_obj.host = host;
		connect_info_obj.user = user;
		connect_info_obj.password = password;
		connect_info_obj.database = database;

		var connection = mysql.createConnection(connect_info_obj);

		connection.connect(function(err){
			if(err){
				throw err;
				reject(err);
			}
			console.log("connect to mysql success!");
			resolve(connection);
		})
	})
}

function truncate_mysql(connection, table){
	var truncate_sql = "TRUNCATE TABLE " + table + ";";
	return new Promise(function(resolve, reject){
		connection.query(truncate_sql, function(err, result){
				if(err)
					throw err;
				console.log(result);
			});
	})
}