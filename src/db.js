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

function deletePhrase(delete_phrase) {
    return new Promise((resolve, reject) => {
        dbclient.query(`DELETE FROM frases WHERE frase = '${delete_phrase}'`, (err, res) => {
            if (err) reject(err);

            console.log(res);

            frases = frases.filter(frase => frase !== delete_phrase)
            resolve("Frase removida do banco de dados")
        });
    })
}

module.exports = { frases, addPhrase, deletePhrase }