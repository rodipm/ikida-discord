require('dotenv').config();

const Discord = require('discord.js');
const db = require('./db');
const tts = require('./tts');

const client = new Discord.Client();

const PREFIX = "!ikida";
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

client.on('message', msg => {
    if (msg.content.startsWith(PREFIX)) {
        const new_phrase = msg.content.substring(PREFIX.length).trim();
        console.log(new_phrase);
        if (new_phrase) {
            if (msg.member.roles.cache.find(r => r.name === ROLE_NAME)) {
                db.addPhrase(new_phrase);
            }
        }
        else
            respondRandomPhrase(msg);
    }
});

client.login(process.env.BOT_TOKEN).catch(console.error);
