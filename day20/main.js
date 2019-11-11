// load libraries
const fs = require('fs');
const mysql = require('mysql');
const express = require('express');

const config = require('./config');
config.ssl = {
    ca: fs.readFileSync(config.cacert)
};

// configurations
const pool = mysql.createPool(config);
const PORT = parseInt(process.argv[2] || process.env.APP_PORT || process.env.PORT) || 3000;

// start the application
const app = express();

const INSERT = 'insert into tv_shows (tvid, name, lang, official_site, rating, image, summary) values (?,?,?,?,?,?,?)'

// Content-Type: application/x-www-form-urlencoded
app.post('/api/tv_show',
    express.json(),
    express.urlencoded({ extended: true }),
    (req, resp) => {
        const body = req.body;
        const params = [
            parseInt(body.tvid),
            body.name,
            body.lang,
            body.official_site,
            parseFloat(body.rating),
            body.image,
            body.summary
        ]
        pool.getConnection(
            (err, conn) => {
                console.info('err: ', err);
                conn.query(INSERT, params,
                    (err, result) => {
                        conn.release();
                        console.info('insert err: ', err);
                        if (err)
                            return resp.status(400).type('text/plain').send(err);
                        resp.status(201).type('text/plain').send('Created');
                    }
                )
            }
        )

    }
)

app.use(express.static(__dirname + '/public'));

pool.getConnection(
    (err, conn) => {
        if (err) {
            console.error('Cannot get database: ', err);
            return process.exit(0);
        }
        conn.ping((err) => {
            conn.release();
            if (err) {
                console.error('Cannot ping database: ', err);
                return process.exit(0);
            }
            app.listen(PORT,
                () => {
                    console.info(`Application stared on ${PORT} at ${new Date().toString()}`);
                }
            )
        })
    }

)