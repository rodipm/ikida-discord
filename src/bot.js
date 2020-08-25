// require('dotenv').config();
const Discord = require('discord.js');
const fs = require('fs');

const client = new Discord.Client();

let raw_frases = fs.readFileSync('frases.json');
let frases = JSON.parse(raw_frases).frases;

const PREFIX = "!ikida";

function respondRandomPhrase(msg) {
    let frase = frases[Math.floor(Math.random() * frases.length)];
    msg.reply(`Frases Yuri: \n\n${frase}`);
}

function addPhrase(new_phrase) {
    frases.push(new_phrase);
    console.log(frases)
    let new_frases = { frases: frases }
    fs.writeFile("frases.json", JSON.stringify(new_frases), () => { });
}

client.on('message', msg => {
    if (msg.content.startsWith(PREFIX)) {
        const new_phrase = msg.content.substring(PREFIX.length).trim();
        console.log(new_phrase);
        if (new_phrase) {
            addPhrase(new_phrase);
            if (msg.member.roles.cache.find(r => r.name === "Gera")) {
                console.log("seiojaieojsoa")
            }
        }
        else
            respondRandomPhrase(msg);
    }
});

// client.login(process.env.BOT_TOKEN);