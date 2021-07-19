module.exports = {
    name: 'play',
    aliases: ['p'],
	description: 'Plays a track',
    usage: "[URL/Name]",
	execute(msg, client, args) {
        if (!msg.member.voice.channel)
            return msg.channel.send('You\'re not in a voice channel, sorry');

        if (args == "" || args == undefined) {
            return msg.channel.send('Please provide a track URL or name');
        }
        
        client.player.play(msg, args.join(" "), true);
        msg.react('⏯️');
	},
}

