const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const streamOptions = { seek: 0, volume: 1 };
require("dotenv").config();
const google = require('googleapis')

const client = new Discord.Client();

const prefix = process.env.PREFIX; // Prefixo da aplicação (Comando que será utilizado para rodar o bot)

const youtube = new google.youtube_v3.Youtube({
  version: 'v3',
  auth: process.env.GOOGLE_KEY
})

const servidores = {
  server: {
    connection: null,
    dispatcher: null,
    fila: [],
    musicaTocando: false
  },
};

client.on("ready", () => {
  console.log("pronto para ser usado");
});


client.on("message", async (msg) => {
  // Filtros

  // Se a mensagem não vier de um servidor, a mensagem é ignorada
  if (!msg.guild) {
    return;
  }

  // Se foi um bot que mandou a mensagem, a mensagem é ignorada
  if (msg.author.bot) {
    return;
  }

  // Comnandos
  if (msg.content.toLowerCase().startsWith(prefix + "play")) {
    // Se a pessoa que deu o camando estiver no canal de voz o bot entra, se não, ele pede carinhosamente para entrar
    if (msg.member.voice.channel) {

      let music = msg.content.slice(6);

      if(music.length === 0){
        msg.channel.send('Preciso de alguma música para tocar né!')
        return;
      }

      // Se a connecção do servidor for nula, ele vai estar fora no canal de voz e vai entrar
      // Se não, não acontece nada
      if(servidores.server.connection === null){
        try{
          servidores.server.connection = await msg.member.voice.channel.join(); // Entra no canal de voz
        }catch(err){
          console.log('Erro ao entrar no canal de voz');
          console.log(err);
        }
      }

      // Verifica se o link é válido
      if (ytdl.validateURL(music)) {
        servidores.server.fila.push(music)
        console.log('Adicionado ' + music);
        msg.channel.send('Musica: ' + music + ' adicionada')
      } else {
        youtube.search.list({
          q: music,
          part: 'snippet',
          fields: 'items(id(videoId)), snippet(title)',
          type: 'video'
        }, function(err, result){
            if(err){
              console.log(err);
            }
            if(result){
              const id = result.data.items[0].id.videoId
              music = 'https://www.youtube.com/watch?v=' + id
              servidores.server.fila.push(music)
              console.log('Adicionado ' + music);
              msg.channel.send('Musica: ' + music + ' adicionada')
            }     
        })
      }

      tocarMusica()

    } else {
      msg.reply("Entra no canal de voz corno safado!");
    }
  }

  if (msg.content.toLowerCase().startsWith(prefix + "leave")) {
    if (msg.member.voice.channel) {
      msg.member.voice.channel.leave();
      servidores.server.connection = null;
      servidores.server.dispatcher = null;
    } else {
      msg.reply("Entra no canal de voz corno safado!");
    }
  }

  //FIXME: pause funciona porém talvez a faixa esteja parando e saindo da fila
  if (msg.content.toLowerCase().startsWith(prefix + "pause")) {
    if (msg.member.voice.channel) {
      servidores.server.dispatcher.pause();
    } else {
      msg.reply("Entra no canal de voz corno safado!");
    }
  }

  //FIXME: resume não está funcionando
  if (msg.content.toLowerCase().startsWith(prefix + "resume")) {
    if (msg.member.voice.channel) {
      servidores.server.dispatcher.resume();
    } else {
      msg.reply("Entra no canal de voz corno safado!");
    }
  }
});

const tocarMusica = () => {

  if(servidores.server.musicaTocando === false){
    const tocando = servidores.server.fila[0]
    servidores.server.musicaTocando = true
    servidores.server.dispatcher = servidores.server.connection.play(ytdl(tocando,  { filter: "audioonly" }))
  
    servidores.server.dispatcher.on('finish', () => {
      servidores.server.fila.shift()
      servidores.server.musicaTocando = false
  
      if(servidores.server.fila.length > 0){
        tocarMusica()
      } else{
        servidores.server.dispatcher = null
      }
    })
  }
}

client.login(process.env.TOKEN); // Iniciando a aplicação
