const request = require("request");
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
const truncate_sql = "TRUNCATE TABLE " + TABLE + ";";

//modify the prototype of Date().
Date.prototype.yyyymmdd = function() {
	var mm = this.getMonth() + 1;	//	getMonth() is zero-based
	var dd = this.getDate();

	return [this.getFullYear(),
		(mm > 9 ? "" : "0") + mm,
		(dd > 9 ? "" : "0") + dd
		].join("");
};

//start();
connect_mysql().then((connection)=>{
	truncate_mysql(connection);
})

function start(){
	/*for(var i = 20171201; i < 20171202; i++){
		await getScoreboard(i).then(function(value){
			console.log(value);
		})
	}*/

	var start_date = new Date(2017, 12 - 1, 31);	//	month 0~11, date 1~31.
	var end_date = new Date(2018, 1 - 1, 2);
	var during_day = (end_date - start_date) / 1000 / 60 / 60 / 24;

	Promise.all([
		connect_mysql(),
		makeInfo(start_date)
		]).then(async function(results){
			var connection = results[0];
			var info = results[1];

			connection.query(insert_sql, [info], function(err, result){	//	insert
				if(err)
					throw err;
				console.log(result);
				console.log("\n");
			});
			
			for(let i = 0; i < during_day; i++){
				await start_date.setDate(start_date.getDate() + 1);

				await makeInfo(start_date).then(function(result){
					connection.query(insert_sql, [result], function(err, result){	//	insert
						if(err)
							throw err;
						console.log(result);
						console.log("\n");
					});
				})
			}

			/*connection.query(select_sql, function(err, result, fields){		//	select
				if(err)
					throw err;
				console.log(result);
			});*/

			/*connection.query(truncate_sql, function(err, result){		//	truncate
				if(err)
					throw err;
				console.log(result);
			});*/

			connection.end(function(err){	//	connection ended
				if(err)
					throw err;
				console.log("connection ended");
			});
		})
}

function getScoreboard(parameter){
	return new Promise(function(resolve, reject){
		request("https://data.nba.net/prod/v2/" + parameter + "/scoreboard.json", (err, res, body)=>{
			var scoreboard = JSON.parse(body);
			console.log("get score success!");
			resolve(scoreboard.games);
		})
	})
}

function getTeamMappingObj(year){
	return new Promise(function(resolve, reject){
		request("https://data.nba.net/prod/v2/" + year + "/teams.json", (err, res, body)=>{
			var teams = JSON.parse(body);
			var mapping = {};
			teams.league.standard.forEach((obj)=>{
				mapping[obj.tricode] = obj;
			})
			console.log("get team data success");
			resolve(mapping);
		})
	})
}

function makeInfo(date){
	var date_string = date.yyyymmdd();
	return new Promise(function(resolve, reject){
		Promise.all([
		getTeamMappingObj(date.getFullYear()),
		getScoreboard(date_string)
		]).then((results)=>{
			var teams = results[0];
			var games = results[1];
			var info = games.map(function(game){
				return [
				date_string, 
				teams[game.hTeam.triCode].nickname, 
				teams[game.vTeam.triCode].nickname,
				game.hTeam.score,
				game.vTeam.score
				]
			});
			console.log(date_string + " make info success!");
			resolve(info);
		});
	})
}

function connect_mysql(){
	return new Promise(function(resolve, reject){
		var connect_info_obj = {};

		connect_info_obj.host = HOST;
		connect_info_obj.user = USER;
		connect_info_obj.password = PASSWORD;
		connect_info_obj.database = DATABASE;

		var connection = mysql.createConnection(connect_info_obj);

		connection.connect(function(err){
			if(err)
				throw err;
			console.log("connect to mysql success!");
			resolve(connection);
		})
	})
}

function truncate_mysql(connection){
	return new Promise(function(resolve, reject){
		connection.query(truncate_sql, function(err, result){		//	truncate
				if(err)
					throw err;
				console.log(result);
			});
	})
}