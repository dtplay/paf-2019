const MongoClient = require('mongodb').MongoClient;
const express = require('express');

const URL = 'mongodb://localhost:27017';
const PORT = parseInt(process.argv[2] || process.env.APP_PORT || process.env.PORT) || 3000;

const client = new MongoClient(URL, { useUnifiedTopology: true })

const app = express();

app.use(
    (req, resp, next) => {
        const start = (new Date()).getTime();
        resp.on('finish', () => {
            const end = (new Date()).getTime();
            client.db('stats').collection(`day27`)
                .insert({
                    method: req.method,
                    url: req.originalUrl,
                    ip: req.ip,
                    'user-agent': req.get('User-Agent'),
                    'process-time': end - start,
                    status: resp.statusCode
                })
                .then((result) => { 
                    console.info(result);
                })
        })
        next();
    }
)

app.get('/secret',
    (req, resp, next) => {
        const start = (new Date()).getTime();
        resp.on('finish', () => {
            const end = (new Date()).getTime();
            client.db('stats').collection('secret')
                .insert({
                    method: req.method,
                    url: req.originalUrl,
                    ip: req.ip,
                    'user-agent': req.get('User-Agent'),
                    'process-time': end - start,
                    status: resp.statusCode
                })
                .then((result) => { 
                    console.info(result);
                })
        })
        next();
    },
    (req, resp) => {
        resp.status(200).type('text/html').send(`Top secret: ${new Date()}`);
    }
)

app.use(express.static(__dirname + '/public'));

client.connect(
    (err) => {
        if (err) {
            console.error('Cannot connect to mongo: ', err);
            process.exit(-1);
        }
        app.listen(PORT, () => {
            console.info(`Application started at ${PORT} on ${new Date()}`)
        })
    }
)
