const { MessageEmbed } = require('discord.js');

function getSongEmbed(current_track) {
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

    return songEmbed;
}

function getTrackAddEmbed(track) {
    const songEmbed = new MessageEmbed()
        .setColor('#fff')
        .setTitle(track.title)
        .setURL(track.url)
        
        setAuthor("Added to queue")
        .setFooter('Roku', '');

    return songEmbed;
}

module.exports.getSongEmbed = getSongEmbed;
module.exports.getTrackAddEmbed = getTrackAddEmbed;