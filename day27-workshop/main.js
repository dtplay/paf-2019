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

app.engine('hbs', hbs({ defaultLayout: 'main.hbs' }));
app.set('view engine', 'hbs')

app.use(cors());
app.use(morgan('tiny'));

app.get('/posts/:poster', (req, resp) => {
	// Use hbs
	const poster = req.params.poster;

	conns.mongodb.db('myfb').collection('posts')
		.find({ poster })
		.map(v => {
			return ({
				comments: v.comments,
				image: v.image,
				posted: (new Date(v.posted)).toString()
			})
		})
		.toArray()
		.then(result => {
			resp.status(200).type('text/html').render('posts', { posts: result });
		})
		.catch(error => {
			resp.status(500).type('text/html')
				.send(`<h2>Error: ${error}</h2>`);
		})
});

app.post('/post-news', upload.single('image'),

	(req, resp, next) => {
		resp.on('finish',
			() => {
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

		new Promise((resolve, reject) => {
			fs.readFile(req.file.path,
				(err, buff) => {
					console.error('error: ', err);
					const params = {
						Bucket: 'abc123',
						Key: `myfbpost/${req.file.filename}`, ACL: 'public-read',
						ContentType: req.file.mimetype, Body: buff
					}
					conns.s3.putObject(params,
						(err, result) => {
							if (err)
								return reject(err);
							resolve();
						}
					)
				}
			)
		})
		.then(() => 
			conns.mongodb.db('myfb').collection('posts')
				.insert({
					poster: req.body.uploader,
					comments: req.body.comments,
					image: req.file.filename,
					posted: (new Date()).getTime()
				})
		)
		.then(() => {
			resp.status(201).type('text/html').send(
				`<h2>Article by ${req.body.uploader} posted</h2>`)
		})
		.catch((error) => {
			resp.status(500).type('text/html').send(
				`<h2>Error ${error} </h2>`)
		})

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
