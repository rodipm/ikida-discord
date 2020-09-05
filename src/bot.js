require('dotenv').config();

const Discord = require('discord.js');
const db = require('./db');
const tts = require('./tts');
const ytSearch = require('youtube-search');
const ytdl = require('ytdl-core');

const client = new Discord.Client();

const IKIDA = "!ikida";
const IKIDA_DELETE = "!ikida_delete";
const PLEY = "-pley";
const STOPE = "-stope";
const ROLE_NAME = "Editor Chefe";

function respondRandomPhrase(msg) {
    let frase = db.frases[Math.floor(Math.random() * db.frases.length)];
    msg.reply(`Frases Yuri: \n\n${frase}`);
    msg.react('514865275473100800');
    playTranscription(msg, frase);
}

function playTranscription(msg, frase) {
    var voiceChannel = msg.member.voice.channel;
    if (voiceChannel) {
        tts.synthesize(frase)
            .then(response => {
                let audio = response.result;
                voiceChannel.join().then(connection => {
                    const dispatcher = connection.play(audio);
                    dispatcher.on("finish", end => {
                        voiceChannel.leave();
                    });
                });
            })
            .catch(console.error);
    }
}

let voiceChannel = undefined;

function sendYoutubeVideo(msg, song_name) {
    var opts = {
        maxResults: 10,
        key: process.env.YOUTUBE_API_KEY,
    };

    ytSearch(song_name, opts, function (err, results) {
        if (err) return console.log(err);
        if (!results.length) return;
        let video_url = results[Math.floor(Math.random() * results.length)].link;

        voiceChannel = msg.member.voice.channel;
        if (voiceChannel) {
            voiceChannel.join().then(connection => {
                const stream = ytdl(video_url, { filter: 'audioonly' });
                const dispatcher = connection.play(stream);
                dispatcher.on("finish", end => {
                    voiceChannel.leave();
                });
            });
        }

    });
}

function disconnectBotFromVoiceChannel() {
    if (voiceChannel)
        voiceChannel.leave();
    voiceChannel = undefined;
}

client.on('message', msg => {
    if (msg.content.startsWith(IKIDA)) {
        console.log("ikida")
        const new_phrase = msg.content.substring(IKIDA.length).trim();
        if (new_phrase) {
            if (msg.member.roles.cache.find(r => r.name === ROLE_NAME)) {
                db.addPhrase(new_phrase);
                msg.reply(`Frase adicionada: ${new_phrase}`)
                playTranscription(msg, new_phrase);
            }
        }
        else
            respondRandomPhrase(msg);
    }
    else if (msg.content.startsWith(IKIDA_DELETE)) {
        const delete_phrase = msg.content.substring(IKIDA_DELETE.length).trim();
        if (delete_phrase) {
            if (msg.member.roles.cache.find(r => r.name === ROLE_NAME)) {
                db.deletePhrase(delete_phrase)
                    .then(res => msg.reply(res))
                    .catch(er => {
                        console.error(er)
                        msg.reply("Erro ao tentar remover a frase do banco")
                    })
            }
        }
        else
            msg.reply("Adicione a frase a ser deletada logo a seguir do comando !ikida_delete")
    }
    else if (msg.content.startsWith(PLEY)) {
        let song_name = msg.content.substring(IKIDA.length).trim();

        song_name += "shred";
        sendYoutubeVideo(msg, song_name);
    }
    else if (msg.content.startsWith(STOPE)) {
        disconnectBotFromVoiceChannel();
    }
});

client.login(process.env.BOT_TOKEN).catch(console.error);
