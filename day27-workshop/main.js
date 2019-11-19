const fs = require('fs');
const uuid = require('uuid');
const aws = require('aws-sdk');
const mysql = require('mysql');
const morgan = require('morgan');
const cors = require('cors');
const multer = require('multer');
const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const hbs = require('express-handlebars');

const db = require('./dbutil');

const config = require('/opt/tmp/keys/config');

const { loadConfig, testConnections } = require('./initdb')

const PORT = parseInt(process.argv[2] || process.env.APP_PORT || process.env.PORT) || 3000;

const conns = loadConfig(config);

const upload = multer({ dest: __dirname + '/tmp' })

// SQL
const FIND_UPLOADER = 'select name as user_count from user where name = ?';
const findUser = db.mkQueryFromPool(db.mkQuery(FIND_UPLOADER), conns.mysql);

const app = express();

app.use(cors());
app.use(morgan('tiny'));

app.post('/post-news', upload.single('image'),

	(req, resp, next) => {
		resp.on('finish',
			(req, resp) => {
				fs.unlink(req.file.path, err => { });
			}
		)
		const uploader = req.body.uploader;
		if (!uploader)
			return resp.status(400).type('text/html')
				.send('<h2>Missing uploader</h2>');
		findUser([ uploader ])
			.then(result => {
				if (result.length)
					return next();
				resp.status(403).type('text/html')
					.send(`<h2><code>${uploader}</code> cannot post news articles</h2>`);
			})
			.catch(error => {
				resp.status(500).type('text/html')
					.send(`<h2>Error: ${error}</h2>`);
			});
	},

	(req, resp) => {
		console.info('body: ', req.body);
		console.info('file: ', req.file);
		// Check if the user exists. If the use does not exist, return 403
		resp.status(201).type('text/html').send(
			`<h1>Article by ${req.body.uploader} posted</h1>`
		)
	}
)

app.use(express.static(__dirname + '/public'));

testConnections(conns)
	.then(() => {
		app.listen(PORT,
			() => {
				console.info(`Application started on port ${PORT} at ${new Date()}`);
			}
		)
	})
	.catch(error => {
		console.error(error);
		process.exit(-1);
	})
