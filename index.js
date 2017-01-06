'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const dotenv = require('dotenv').config()

const app = express()

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN

app.set('port', (process.env.PUERTO || 3000))

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

app.get('/', function (req, res) {

    res.json({ message: 'Hola', status: 200 })

})

app.get('/webhook/', function (req, res) {

    if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {

        res.send(req.query['hub.challenge'])
    }

    res.json({ message: 'Error en el Token', status: 200 })
})


app.post('/webhook', function (req, res) {

    let data = req.body

    if (data.object == 'page') {

        data.entry.forEach(function (pageEntry) {

            pageEntry.messaging.forEach(function (mensajes) {

                if (mensajes.message) {

                    procesarMensajes(mensajes)
                }

            })
        })

        res.sendStatus(200)
    }

})

function procesarMensajes(mensajes) {

    let senderID = mensajes.sender.id
    let messageText = mensajes.message.text

    evaluarMensajes(senderID, messageText)
}

function evaluarMensajes(recipientId, message) {

    let respuesta = ''

    if (contiene(message, 'ayuda')) {

        respuesta = 'Por el momento no te puedo ayudar';

    } else {

        respuesta = 'Acabas de decir : ' + message;
    }

    let respuestaMensaje = {
        recipient: {
            id: recipientId
        },
        message: {
            text: respuesta
        }
    }

    enviaFacebook(respuestaMensaje);
}


function enviaFacebook(respuestaMensaje) {

    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: respuestaMensaje
    }, function (error, response, data) {

        if (error) {
            console.log('No es posible enviar el mensaje')
        } else {
            console.log("El mensaje fue enviado")
        }

    })
}

function contiene(sentence, word) {

    return sentence.indexOf(word) > -1
}

/*
* Run b... RUN!!
*/

app.listen(app.get('port'), function () {
    console.log('running on port', app.get('port'))
})