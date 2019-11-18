const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const morgan = require('morgan');
const express = require('express');

const url = 'mongodb://localhost:27017'

const client = new MongoClient(url, { useUnifiedTopology: true });

const PORT = parseInt(process.argv[2] || process.env.APP_PORT || process.env.PORT) || 3000;

const app = express();

app.use(morgan('tiny'));
app.use(cors());

app.get('/receipes',
    (req, resp) => {
        const limit = parseInt(req.query.limit) || 25;
        const offset = parseInt(req.query.offset) || 0;

        const p1 = client.db('food').collection('recipes')
                        .find({})
                        .limit(limit).skip(offset)
                        .toArray();
        const p2 = client.db('food').collection('recipes')
                        .find({})
                        .count()
                        .toArray();

        Promise.all([ p1, p2 ])
            .then(result => {

            })
    }
)

client.connect((error, _) => {
    if (error) {
        console.error('Cannot connect to MongoDB: ', error)
        return process.exit(-1);
    }

    app.listen(PORT, () => {
        console.info(`Application started at ${PORT} on ${new Date()}`)
    })
});
