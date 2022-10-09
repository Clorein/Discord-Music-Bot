const Discord = require('discord.js');
const ytdl = require('ytdl-core')
const streamOptions = {seek: 0, volume: 1}

const client = new Discord.Client();

const token =
  'seu frango';
client.login(token);

client.on('ready', () => {
  console.log('pronto para ser usado');
});

client.on('message', (msg) => {
  if (msg.author.bot) {
    return;
  }

  if (msg.content.toLowerCase().startsWith("*play")) {
    let VoiceChannel = msg.guild.channels.cache.find(
      (channel) => channel.id === 'seu frango'
    )

    if (VoiceChannel === null) {
      console.log('Canal não encontrado');
    }

    if (VoiceChannel !== null){
        console.log('Canal encontrado');

        VoiceChannel.join()
        .then(connection => {
            const stream = ytdl('https://www.youtube.com/watch?v=_z_nbrcx7LQ', {filter:'audioonly'})
            const DJ = connection.play(stream, streamOptions)
            DJ.on('end', end => {
                VoiceChannel.leave()
            })
        })
        .catch(console.error)
    }
  }
});
