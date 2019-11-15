
// load libraries
const { join } = require('path');
const fs = require('fs');
const mysql = require('mysql');
const multer = require('multer');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const imageType = require('image-type');
const aws = require('aws-sdk');

// load multer
const multer = require('multer');
const db = require('./dbutil');

const config = require(__dirname + '/config');

const spaces = require('/opt/tmp/abc123_keys');

const s3 = new aws.S3({
	endpoint: new aws.Endpoint('sgp1.digitaloceanspaces.com'),
	accessKeyId: spaces.accessKey,
	secretAccessKey: spaces.secret
})

// configurations
const pool = mysql.createPool(config);
const PORT = parseInt(process.argv[2] || process.env.APP_PORT || process.env.PORT) || 3000;

const fileUpload = multer({ dest: __dirname + '/tmp' });

// SQL statements
const INSERT_IMAGE = 'insert into animals(comments, image) values (?, ?)'
const FIND_IMAGE = 'select * from animals where comments like ?';
const FIND_IMAGE_BY_ID = 'select * from animals where id = ?';

const insertImage = db.mkQueryFromPool(db.mkQuery(INSERT_IMAGE), pool);
const findImage = db.mkQueryFromPool(db.mkQuery(FIND_IMAGE), pool);
const findImageById = db.mkQueryFromPool(db.mkQuery(FIND_IMAGE_BY_ID), pool);

// start the application
const app = express();

app.use(cors());

app.use(morgan('tiny'));

app.get('/image/:imageId',
	(req, resp) => {
	}
)

app.get('/search',
	(req, resp) => {
		const q = req.query.q || 'dog';
		findImage([ `%${q}%` ])
			.then(result => {
				if (!result.length)
					return resp.status(200).type('text/plain')
						.send(`No images for ${q}`);
					resp.status(200)
						.type(imageType(result[0].image).mime)
						.send(result[0].image);
			})
			.catch(error => {

				resp.status(400).type('text/plain')
					.send(`error ${error}`);
			})
	}
)

app.post('/upload/s3', fileUpload.single('myImage'),
	(req, resp) => {
		fs.readFile(req.file.path,
			(err, imgFile) => {
				const params = {
					Bucket: 'abc123',
					Key: `images/${req.file.filename}`,
					Body: imgFile,
					ACL: 'public-read',
					ContentType: req.file.mimetype
				}
				s3.putObject(params,
					(err, result) => {
						fs.unlink(req.file.path, () => {
							if (err)
								return resp.status(500).type('text/plain').send(err);
							resp.status(200).type('text/plain').send('uploaded');
						})
					}
				)
			}
		)
	}
)

app.post('/upload', fileUpload.single('myImage'),
	(req, resp) => {
		// input type=<not file>
		console.info('req.body: ', req.body);
		// req.file - is the uploaded
		// input type="file"
		console.info('req.file: ', req.file);

		// Read the cached file from tmp directory
		fs.readFile(req.file.path,
			(err, imgFile) => {
				//imgFile are the bytes
				console.info('error: ', err);
				insertImage([ req.body.comments, imgFile ])
					.then(result => {
						fs.unlink(req.file.path, () => {
							resp.format({
								'application/json': () => {
									resp.status(200).type('application/json')
										.json({ status: `uploaded ${req.file.originalname}` });
								},
								default: () => {
									resp.status(200).type('text/plain')
										.send(`uploaded ${req.file.originalname}`);
								}
							})
						})
					})
					.catch(error => {
						resp.status(400).type('text/plain')
							.send(`error ${error}`);
					})
			}
		)
	}
)


app.use(express.static(join(__dirname, '/public')));

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
