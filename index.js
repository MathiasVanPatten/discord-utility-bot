require('dotenv').config()
let { scheduleBot } = require( './bots/scheduleBot/scheduleBot.js' )
let { setupBot } = require( './bots/setupBot.js' )
let { helpBot } = require( './bots/helpBot.js' )
let { startAgendaJobs } = require( './bots/scheduleBot/startAgendaJobs.js' )

// spin up agenda to check for queued up scheduled jobs
startAgendaJobs()





// create google api creds file
const fs = require('fs');

if (!fs.existsSync('./gCreds.json')) {
    
	// json data
	var jsonData = process.env.gJSON
	 
	// parse json
	var jsonObj = JSON.parse(jsonData);
	console.log('gcreds obj successfully created');
	 
	// stringify JSON Object
	var jsonContent = JSON.stringify(jsonObj);
	console.log('gcreds content successfully created');
	 
	fs.writeFile("./gCreds.json", jsonContent, 'utf8', function (err) {
	    if (err) {
	        console.log("An error occured while writing JSON Object to File.");
	        return console.log(err);
	    }
	 
	    console.log("JSON file has been saved.");
	});

}

// connect to redis
const { promisify } = require("util")
redis = require( 'redis' )
redisClient = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true})

getAsync = promisify(redisClient.get).bind(redisClient)


// connect to discord
global.Discord = require('discord.js')
global.discordClient = new Discord.Client()


const DISCORD_TOKEN = process.env.DISCORD_TOKEN
discordClient.login(DISCORD_TOKEN)


discordClient.on( 'ready', msg => {
	console.log( 'bot connected' )
})



// run main() when new messages detected on the server
discordClient.on( 'message', msg => {



	if(msg.author.bot) return;
	// check if we're being summoned and return the correct bot
	// split up message into an array
	const message =  msg.content.split( " " )

	// ignore messages that do not start with !
	if (message[0][0] !== '!')
		return

	if(message[1] === undefined){
		msg.reply("sorry that is an invalid !command")
		console.log(`user entered an invalid command: ${message[1]}`)
		return
	}

	// resolve with an object - bot's name, bot's command and original message as an array
	let request = { 
		'name': message[0].slice(1,message[0].length), 
		'command': message[1],
		'message': message,
		'msgObj': msg
	}



	const controller = new Map( [
		['schedule', scheduleBot],
		['setup', setupBot],
		['dfz', helpBot]
	] )

	if (controller.has( request.name ) != true) {
		request.msgObj.reply("sorry that is an invalid !command")
		return `user entered an invalid command: ${request.name}`
	}
		let bot = controller.get(request.name)

	
	bot(request)
	.then( (response) => { 
		console.log(response)
	} )
	.catch( ( error ) => { 
		console.log( 'whoops: ' + error )
	} )
	.finally( ( data ) => { 
		console.log( 'bot finally out!')
	} )
})
