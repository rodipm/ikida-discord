const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1.js');
const { IamAuthenticator } = require('ibm-watson/auth');

const tts_client = new TextToSpeechV1({
    authenticator: new IamAuthenticator({
        apikey: process.env.WATSON_TTS_APIKEY,
    }),
    url: "https://stream.watsonplatform.net/text-to-speech/api",
});

function synthesize(text) {
    let params = {
        text: text,
        voice: 'pt-BR_IsabelaV3Voice',
        accept: 'audio/mp3'
    }
    return tts_client.synthesize(params)
}

module.exports = { synthesize };