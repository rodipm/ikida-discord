require('dotenv').config();
const fs = require('fs');
const express = require('express');
const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1.js');
const { IamAuthenticator } = require('ibm-watson/auth');
const Discord = require('discord.js');
const { Client } = require('pg');

const client = new Discord.Client();

const dbclient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
dbclient.connect();

const PREFIX = "!ikida";

let frases = [];
dbclient.query(`SELECT * FROM frases`, (err, res) => {
    if (err) throw err;
    for (let row of res.rows) {
        frases.push(row.frase);
    }
});

const tts_client = new TextToSpeechV1({
    authenticator: new IamAuthenticator({
        apikey: process.env.WATSON_TTS_APIKEY,
    }),
    url: "https://stream.watsonplatform.net/text-to-speech/api",
});

function respondRandomPhrase(msg) {
    let frase = frases[Math.floor(Math.random() * frases.length)];
    msg.reply(`Frases Yuri DEV: \n\n${frase}`);
    msg.react('514865275473100800');
    playTranscription(msg, frase)
}

function playTranscription(msg, frase) {
    var voiceChannel = msg.member.voice.channel;
    if (voiceChannel) {
        let params = {
            text: frase,
            voice: 'pt-BR_IsabelaV3Voice',
            accept: 'audio/mp3'
        }

        let data = [];
        tts_client.synthesize(params)
            .then(response => {
                let audio = response.result;

                var write_stream = fs.createWriteStream("output.mp3");
                audio.pipe(write_stream);

                audio.on('end', () => {
                    console.log("data")
                    voiceChannel.join().then(connection => {
                        const dispatcher = connection.play('output.mp3');
                        dispatcher.on("finish", end => {
                            voiceChannel.leave();
                        });
                    }).catch(err => console.log(err));
                })
            })
            .catch(console.error);
    }
}

function addPhrase(new_phrase) {
    dbclient.query(`INSERT INTO frases (frase) VALUES ('${new_phrase}')`, (err, res) => {
        if (err) throw err;
        console.log(`${new_phrase} inserido no banco de frases`)
    });
}

client.on('message', msg => {
    if (msg.content.startsWith(PREFIX)) {
        const new_phrase = msg.content.substring(PREFIX.length).trim();
        console.log(new_phrase);
        if (new_phrase) {
            if (msg.member.roles.cache.find(r => r.name === "Editor Chefe")) {
                addPhrase(new_phrase);
            }
        }
        else
            respondRandomPhrase(msg);
    }
});

client.login(process.env.BOT_TOKEN).catch(console.error);

const app = express();
app.listen(process.env.PORT || 5000);