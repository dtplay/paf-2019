const fs = require('fs');
const uuid = require('uuid');
const aws = require('aws-sdk');
const mysql = require('mysql');
const morgan = require('morgan');
const multer = require('multer');
const express = require('express');
const hbs = require('express-handlebars');

const db = require('./dbutil');

const DB_CONFIG = '/opt/tmp/keys/config.js';
const S3_CONFIG = '/opt/tmp/keys/abc123_keys.js';

let dbConfig;
let s3Config;

// Load MYSQL configuration
if (fs.existsSync(DB_CONFIG)) {
	dbConfig = require(DB_CONFIG);
	dbConfig.ssl = {
		ca: fs.readFileSync(dbConfig.cacert)
	}
} else {
	dbConfig = {
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: 'mynews',
		connectionLimit: 4,
		ssl: {
			ca: process.env.DB_CA
		}
	};
}

// Load S3 configuration
if (fs.existsSync(S3_CONFIG)) {
    s3Config = require(S3_CONFIG);
} else
	s3Config = {
		accessKey: process.env.S3_ACCESS_KEY,
		secretKey: process.env.S3_SECRET_KEY
    }
    
const PORT = parseInt(process.argv[2] || process.env.APP_PORT || process.env.PORT) || 3000;

// Create resources
const SPACE_URL = 'sgp1.digitaloceanspaces.com';

const pool = mysql.createPool(dbConfig);
const s3 = new aws.S3({
	endpoint: new aws.Endpoint(SPACE_URL),
	accessKeyId: s3Config.accessKey,
	secretAccessKey: s3Config.secret
});
const upload = multer({ dest: __dirname + '/tmp' });

// SQL Statement
const INSERT_NEW_ARTICLE = 'insert into articles(art_id, title, email, article, posted, image_url) values (?, ?, ?, ?, ?, ?)';
const insertNewArticle = db.mkQuery(INSERT_NEW_ARTICLE);

const GET_ALL_ARTICLES = 'select * from articles';
const getAllArticles = db.mkQueryFromPool(db.mkQuery(GET_ALL_ARTICLES), pool);

// Create Express application
const app = express();

app.engine('hbs', hbs({ defaultLayout: 'main.hbs' }));
app.set('view engine', 'hbs');

app.use(morgan('tiny'));

app.get('/articles',
    (req, resp) => {
        getAllArticles()
            .then(result => {
                resp.status(200).type('text/html')
                    .render('articles', { articles: result });
            })
            .catch(error => {
                    return resp.status(400).type('text/plain')
                        .send(`Error ${error}`);
            })
    }
)

app.post('/article', upload.single('image'),
	(req, resp) => {
		console.info('body: ', req.body); console.info('file: ', req.file);
        pool.getConnection(
            (err, conn) => {
                if (err)
                    return resp.status(500).type('text/plain')
                        .send(`Error ${err}`);
                db.startTransaction(conn)
                    .then(status => {
                        // Insert into MySQL DB
                        const art_id = uuid().substring(0, 8);
                        const postDate = new Date();
                        // insert into articles(art_id, title, email, article, posted, image_url) values (?, ?, ?, ?, ?, ?)
                        const params = [
                            art_id, req.body.title, req.body.email, req.body.article, postDate, req.file.filename
                        ];
                        return (insertNewArticle({ connection: status.connection, params: params }))
                    })
                    .then(status => 
                        // Upload to S3
                        new Promise(
                            (resolve, reject) => {
                                fs.readFile(req.file.path, (err, imgFile) => {
                                    if (err)
                                        return reject({ connection: status.connection, error: err })
                                    const params = {
                                        Bucket: 'abc123', Key: `articles/${req.file.filename}`,
                                        Body: imgFile, ContentType: req.file.mimetype,
                                        ContentLength: req.file.size, ACL: 'public-read'
                                    }
                                    s3.putObject(params, 
                                        (error, result) => {
                                            if (error)
                                                return reject({ connection: status.connection, error })
                                            resolve({ connection: status.connection, result })
                                        }
                                    )
                                })
                            }
                        )
                    )
                    .then(db.passthru, db.logError('before commit'))
                    .then(db.commit, db.rollback)
                    .then(
                        (status) => 
                            new Promise(
                                (resolve, reject) => {
                                    fs.unlink(req.file.path, () => {
                                        resp.status(201).type('text/plain')
                                            .send(`Posted article ${req.body.title}`);
                                        resolve()
                                    })
                                }
                            ),
                        (status) => {
                            resp.status(400).type('text/plain')
                                .send(`Error article ${status.error}`);
                        }
                    )
                    .finally(() => conn.release() )
            }
        )
	}
)

app.use(express.static(__dirname + '/public'));

app.listen(PORT, () => {
	console.info(`Application started on port ${PORT} at ${new Date()}`);
});
