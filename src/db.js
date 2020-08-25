const { Client } = require('pg');
const dbclient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
dbclient.connect();

let frases = [];
dbclient.query(`SELECT * FROM frases`, (err, res) => {
    if (err) throw err;
    for (let row of res.rows) {
        frases.push(row.frase);
    }
});

function addPhrase(new_phrase) {
    dbclient.query(`INSERT INTO frases (frase) VALUES ('${new_phrase}')`, (err, res) => {
        if (err) throw err;
        frases.push(new_phrase)
        console.log(`${new_phrase} inserido no banco de frases`)
    });
}

module.exports = { frases, addPhrase }