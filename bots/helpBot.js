const {commandNotFound, hasPermission, sendMessage} = require( '../helpers.js' )

const helpBot = async (request) => {

	let userHasPermission = await hasPermission(request.msgObj, 'Coach')



	if ( !userHasPermission ){
		return 'user does not have persmission to use the bot'
	}
	else {
		commands = {
			'help': me
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

const me = async (request) => {

	const helpMessage = {
		color: 0x0099ff,
		title: 'DFZ bot - A general purpose dev bot that makes Xalnara happy',
		description: "```\nAvailable Commands:\n\n!schedule lobby <day> at <timeam/pm>\n\n!setup timezone\n\n!dfz help```",
		thumbnail: {
			url: 'http://getdrawings.com/free-icon/robot-icon-png-57.png',
		},
		footer: {
			text: 'created by TheForce. Special Thanks to all the testers and devs <3'
		},
	};

	request.msgObj.reply({ embed: helpMessage });
	return 'help message sent'

}

module.exports = {helpBot}
