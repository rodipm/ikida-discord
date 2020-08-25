require('dotenv').config();
const fs = require('fs');

const Discord = require('discord.js');
const client = new Discord.Client();

const { Client } = require('pg');
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
        console.log(row.frase);
        frases.push(row.frase);
    }
});

function respondRandomPhrase(msg) {
    let frase = frases[Math.floor(Math.random() * frases.length)];
    msg.reply(`Frases Yuri: \n\n${frase}`);
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