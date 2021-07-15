const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'nowplaying',
    aliases: ['np'],
	description: 'Displays the current track that is playing',
    usage: "[]",
	execute(msg, client) {
        if (!msg.member.voice.channel)
            return msg.channel.send('You\'re not in a voice channel, sorry');
        if (!client.player.isPlaying(msg)) 
            return msg.channel.send(`There is nothing playing currently so I can't stop`);

        const current_track = client.player.nowPlaying(msg);
        const songEmbed = new MessageEmbed()
            .setColor('#fff')
            .setTitle(current_track.title)
            .setURL(current_track.url)
            .setAuthor("Now playing")
            .addFields(
                { name: 'Views: ', value: current_track.views, inline: true},
                { name: "Duration: ", value: `${current_track.duration}`, inline: true},
            )
            .setImage(current_track.thumbnail)
            .setFooter('Roku', '');

        msg.channel.send(songEmbed);
	},
}