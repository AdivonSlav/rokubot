const { add } = require('cheerio/lib/api/traversing');
const { MessageEmbed } = require('discord.js');
const { LOGO } = require("../config.js");

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
        .setFooter('Roku | https://github.com/AdivonSlav/rokubot', `${LOGO}`);

    return songEmbed;
}

function getTrackAddEmbed(track) {
    const songEmbed = new MessageEmbed()
        .setColor('#fff')
        .setTitle(track.title)
        .setURL(track.url)
        .setAuthor("Added to queue")
        .setFooter('Roku | https://github.com/AdivonSlav/rokubot', `${LOGO}`);

    return songEmbed;
}

function getNewsEmbed(news) {
    // 03.07.2021 10:25
    try {
        var day = news.date.substr(0,2);
        var month = news.date.substr(3,2);
        var year = news.date.substr(6,4);
        var hour = news.date.substr(11, 2);
        var minute = news.date.substr(14, 2);
    } catch (error) {
        console.log(chalk.red("(SCRAPER): " + error));
    }
        
    const dFormat = `${day}.${month}.${year} ${hour}:${minute}`;

    const newsEmbed = new Discord.MessageEmbed()
        .setTitle(news.title)
        .setColor('#fff')
        .setURL(`https://www.fit.ba/student/${news.url}`)
        .setAuthor(news.author)
        .setDescription(news.description)
        .setFooter(`Roku | ${dFormat} | https://github.com/AdivonSlav/rokubot`, `${LOGO}`);

    return newsEmbed;
}

function getQueueEmbed(queue) {
    var playlist = ``;

    for (var i = 0; i < queue.tracks.length; i++) {
        playlist += `\n${i + 1}. **${queue.tracks[i].title}**`;
    }

    const queueEmbed = new MessageEmbed()
        .setTitle("Queue")
        .setColor('#fff')
        .addField(`Now playing: `, `${queue.playing.title}`)
        .addField(`Looped: `, queue.loopMode?`Yes`:`No`)
        .addField(`Queue: `, playlist)
        .setFooter('Roku | https://github.com/AdivonSlav/rokubot', `${LOGO}`);

    return queueEmbed;
}

function getVolumeEmbed(volume) {
    const volumeEmbed = new MessageEmbed()
        .setTitle(`Volume: ${volume}%`)
        .setColor('#fff')
        .setFooter('Roku | https://github.com/AdivonSlav/rokubot', `${LOGO}`);
    return volumeEmbed;
}

module.exports.getSongEmbed = getSongEmbed;
module.exports.getTrackAddEmbed = getTrackAddEmbed;
module.exports.getNewsEmbed = getNewsEmbed;
module.exports.getQueueEmbed = getQueueEmbed;
module.exports.getVolumeEmbed = getVolumeEmbed;