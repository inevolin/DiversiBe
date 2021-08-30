const https = require('http');
const fs = require("fs");//?
const WebSocketServer = require('ws').Server;
// Create the encoder.
// Specify 24kHz sampling rate and 1 channel size.
const { OpusEncoder } = require('@discordjs/opus');
const encoder = new OpusEncoder(24000, 1);
const textEncoding = require('text-encoding');
const TextDecoder = textEncoding.TextDecoder;

const wsPort = 8080;

const httpsServer = https.createServer({
    key: fs.readFileSync('key.pem', 'utf8'),
    cert: fs.readFileSync('cert.pem', 'utf8')
}).listen(wsPort);

const wss = new WebSocketServer({ server: httpsServer });

const vosk = require('vosk');
vosk.setLogLevel(-1);//?
// MODELS: https://alphacephei.com/vosk/models
const recs = {
    en : new vosk.Recognizer({model: new vosk.Model('samples/vosk-model-en'), sampleRate: 24000}),
    fr : new vosk.Recognizer({model: new vosk.Model('samples/vosk-model-fr'), sampleRate: 24000}),
}

wss.on('connection', function(ws, req) {
    ws.active_rec = recs.fr;//depending on your active language
    ws.on('message', function(message) {
        try {
            processMessage(ws, message)
        } catch(ex) {
            console.error(ex);
        }
       
    });
    console.log('Speaker connected');
});

function str2ab(str) {
  return Uint8Array.from([...str].map(ch => ch.charCodeAt()));
}


function processMessage(ws, message) {

    // * JSON string to object
    message = JSON.parse(message.toString('utf8'));

    //5 : message == opus encoded data
    if ('audio' in message) {
        //6 : decode data --> raw audio data
        let raw_data = encoder.decode(str2ab(message.audio));

        //7 : send raw audio data to VOSK API
        if (ws.active_rec.acceptWaveform(raw_data)) {
            const txt = ws.active_rec.result().text;
            console.log(txt)
            ws.send(txt);//8: output

            // change & test:
            // todo : if changed by voice then update UI box
            if (txt == "change English") {
                ws.active_rec = recs.en;
            }
            else if (txt == "change French") {
                ws.active_rec = recs.fr;
            }
        }
    } else {
        console.log(message.text)
        if (message.text.includes('changeLang')) {
            let idx = message.text.split(':')[1]
            ws.active_rec = recs[idx]
            console.log('new active rec: ', idx)
        }
    }
}

wss.on('close', function() {
    console.log('Speaker disconnected');
});

console.log('Listening on port:', wsPort);
