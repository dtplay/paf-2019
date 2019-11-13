
// load libraries
const fs = require('fs');
const mysql = require('mysql');
const express = require('express');
const morgan = require('morgan');

let config;

if (fs.existsSync(__dirname + '/config.js')) {
	config = require(__dirname + '/config');
	config.ssl = {
		 ca: fs.readFileSync(config.cacert)
	};
} else
	config = {};


// configurations
const pool = mysql.createPool(config);
const PORT = parseInt(process.argv[2] || process.env.APP_PORT || process.env.PORT) || 3000;

// start the application
const app = express();


app.use(morgan('tiny'));

// POST /api/order, application/json
// req.body => 201
app.post('/api/order', express.json(),
	(req, resp) => {
		console.info('body: ', req.body);

		resp.status(201).json({});
	}
)

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
