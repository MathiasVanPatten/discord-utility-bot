// define the job to do at <number of> <minutes or hours>
const {
	getUserEpoch
} = require( './getEpoch.js' )


const {commandNotFound, hasPermission, sendMessage} = require( '../../helpers.js' )




const botMsgs = {

}


const scheduleBot = async (request) => {

	let userHasPermission = await hasPermission(request.msgObj, 'Coach')

	if ( !userHasPermission ){
		return 'user does not have persmission to use the bot'
	}
	else {
		commands = {
			'lobby': lobby
		}

		if (commandNotFound(request, commands)) {
			return `user entered an invalid command: ${request.message}`
		}

		let response = commands[request.command](request)
		
		return response
	}

}

//---------------------
//---------------------
// schedule bot methods
//---------------------
//---------------------

const lobby = async (request) => {

	// command: !schedule lobby <day> at <time>
	// example: !schedule lobby monday at 8:30pm

	// first check if the user has a redis key/value so we know their timezone

	// check the user who sent the command
	let coachName = await request.msgObj.author.username
	console.log( `coachName: ${coachName}` )

	// get the users timezone

	let coachTimeZone = await getAsync(coachName)

	console.log(`coachTimeZone: ${coachTimeZone}`)

	if( coachTimeZone == false || coachTimeZone == null) {
		// coach isn't in redis yet so prompt them to use the command to setup their time zone

		request.msgObj.reply( 'First time? Looks like you need to setup your timezone! \u200B\n\u200B\nUse the command "!setup timezone"\nYou will get a DM with instructions =)')

		return 'user needs to setup timezone'
	}



	// make sure day is either day of the week or today/tomorrow
	let dayTest = [
	'monday', 'tuesday', 'wednesday', 'thursday', 
	'friday', 'saturday', 'sunday', 'today'
	]

	let day = request.message[2]

	if (dayTest.includes(day.toLowerCase()) == false) {
		request.msgObj.reply("Please try again! <day> can be any day of the week. Use 'today' if you are scheduling a match today")
		return 'user did not enter a valid day'
	}




	// make sure user wrote didn't miss 'at' ( maybe this should be removed all together? )
	let at = request.message[3].toLowerCase()

	console.log( at )
	if (at != 'at') {
		request.msgObj.reply("Please try again!\n\nCorrect format:\n\n!schedule lobby <day> at <timeam/pm>\n\nExample:\n\n!schedule lobby today at 8:00pm\n\nYou can say today, tomorrow or any day of the week")
		return "user forgot to put 'at' in the request"
	}



	// time checks
	let time = request.message[4]


	// make sure time is a number between 0-13
	timeTest = /^[1-9]:[0-5][0-9][paPA][mM]|^[1][0-2]:[0-5][0-9][paPA][mM]/.test( time )
	
	if( timeTest == false ){
		request.msgObj.reply("Please try again! 12 hour 00:00 format only. Don't forget to put am or pm at the end of your time!\nExample: 8:00pm or 12:30pm")
		return 'user did not enter a valid time'
	}

	console.log( `time validated successfully` )
	console.log(`getting lobby date epoch...`)

	// get the user epoch 
	let epoch = getUserEpoch(request.msgObj.content, coachTimeZone)
	

	if( epoch == false ){
		request.msgObj.reply("whoops! Please use a valid timezone with !setup timezone")
		return 'user did not enter a valid timezone'
	}

	if ( epoch == 'timeMachine' ){
		request.msgObj.reply("🚀 ⏰ Are you trying to travel back in time? Please try again ⏰ 🚀")
		return 'user tried to go back in time'
	}

  if ( epoch == 'incorrect day' ){
    request.msgObj.reply("please use 'today' for today or the day of the week you want to schedule a match. You schedule up to one week in advance.")
		return 'user entered incorrect day name'
  }

	let timestamp = new Date(epoch)
	console.log(`timestamp: ${timestamp}`)


	// post a message promoting the event in the channel you want
	let lobby = await global.discordClient.channels
	let na_channel = ''

	for( let key of lobby.values() ){
		if( key.name === 'na-announcements' )
			na_channel = key
	}

	let dateOfLobby = request.message.slice(2, request.message.length).join(' ')

	let message = await na_channel.send( `We will be hosting a 5v5 lobby for beginners ${dateOfLobby}, ${coachTimeZone} time! \nSmash that  ✅  if you would like to participate. Also pick any positions you are comfortable playing using the reactions below. Thanks!` )
	await message.react('✅')
	await message.react( '1️⃣' )
	await message.react( '2️⃣' )
	await message.react( '3️⃣' )
	await message.react( '4️⃣' )
	await message.react( '5️⃣' )
	
	messageID = message.id
	channelID = message.channel.id
	coachID = request.msgObj.author.id




	// schedule the event in agenda mongo db passing ID data
	let lobbyScheduled = await global.agenda.schedule(timestamp, 'setup lobby', { messageID: messageID, channelID: channelID, coachID: coachID});

	if(lobbyScheduled.attrs.name !== 'setup lobby'){
		request.msgObj.reply('Sorry something went wrong. Event not scheduled!')
		console.log(lobbyScheduled)
		return 'event not scheduled something went wrong'
	}

	return `lobby scheduled ${dateOfLobby}`


	//notes:
	//use a custom emoji
	//const emoji = request.msgObj.guild.emojis.find(emoji => emoji.name === 'baby_yoda');
	// \u200B is the code for invisible space for line breaks
}



//---------------------
//---------------------
// schedule bot helpers
//---------------------
//---------------------

function seconds(s){ 
	return 1000 * s
}

function minutes(m){ 
	return 1000 * 60 * m
}

function hours(h){ 
	return 1000 * 60 * 60 * h
}

function hours(d){ 
	return 1000 * 60 * 60 * 24 * d
}

function minutesToMilliseconds(m){
	return 1000 * 60 * m
}

module.exports = {scheduleBot}
