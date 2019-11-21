const morgan = require('morgan');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const request = require('request-promise');

const config = require('/opt/tmp/keys/config');

const m = require('./mongoutil');

const s = require('./s3util');

const PORT = parseInt(process.argv[2] || process.env.APP_PORT || process.env.PORT) || 3000;

//const client = new MongoClient(config.atlas.url, { useUnifiedTopology: true })
const client = new MongoClient(config.mongodb.url, { useUnifiedTopology: true })
const s3conn = s.makeS3('sgp1.digitaloceanspaces.com', config);

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));

app.use(express.static(__dirname + '/public'));

app.get('/api/countries', 
	(req, resp) => {
		m.getCountries(client)
			.then(result => {
				result.sort();
				resp.status(200).json({ countries: result });
			})
			.catch(error => {
				console.error('Error: %s: ', req.originalUrl, error);
				resp.status(500).json({ error });
			});
	}
)

app.get('/api/country/:country',
	(req, resp) => {
		const limit = parseInt(req.query.limit) || 40;
		const offset = parseInt(req.query.offset) || 0;
		const country = req.params.country

		m.getPropertiesByCountry({ country, limit, offset }, client)
			.then(result => {
				result.sort();
				resp.status(200).json({ properties: result });
			})
			.catch(error => {
				console.error('Error: %s: ', req.originalUrl, error);
				resp.status(500).json({ error });
			});
	}
);

app.get('/api/property/:id',
	(req, resp) => {
		m.getPropertyById(req.params.id, client)
			.then(result => {
				if (!result)
					return resp.status(404).json({ error: 'not found' });
				resp.status(200).json(result);
			})
			.catch(error => {
				console.error('Error: %s: ', req.originalUrl, error);
				resp.status(500).json({ error });
			});
	}
)

app.get('/api/map/:id',
	(req, resp, next) => {
		const cachedMap = `map/${req.params.id}`;
		const params = {
			Bucket: 'abc123',
			Key: cachedMap
		}
		s.checkExists(params, s3conn)
			.then(result => {
				if (!result.exists)
					return next();
				console.info('performing redirect for %s', cachedMap);
				resp.redirect(301, `https://abc123.sgp1.digitaloceanspaces.com/${cachedMap}`)
			})
			.catch(error => {
				console.error('Error: %s: ', req.originalUrl, error);
				resp.status(500).json({ error });
			})
	},
	(req, resp) => {
		const mapName = `map/${req.params.id}`;
		m.getPropertyById(req.params.id, client)
			.then(result => {
				if (!result)
					return resp.status(404).json({ error: 'not found' });
				const qs = {
					center: `${result.location.coordinates[1]},${result.location.coordinates[0]}`,
					zoom: 15,
					size: '300x300',
					format: 'png',
					key: config.gmap.key,
					markers: `size:mid|color:red|label:A|${result.location.coordinates[1]},${result.location.coordinates[0]}`
				}
				return (
					request.get('https://maps.googleapis.com/maps/api/staticmap', { qs, encoding: null })
				)
			})
			.then(result => {
				const params = {
					Bucket: 'abc123',
					Key: mapName,
					Body: result,
					ACL: 'public-read',
					ContentType: 'image/png'
				}
				return s.saveMap(params, s3conn)
			})
			.then(result => {
				if (!result)
					return resp.status(404).json({ error });
				resp.redirect(301, `https://abc123.sgp1.digitaloceanspaces.com/${mapName}`)
				//resp.status(200).type('image/png').send(result);
			})
			.catch(error => {
				console.error('Error: %s: ', req.originalUrl, error);
				resp.status(500).json({ error });
			});
	}
)

m.connect(client)
	.then(() => {
		app.listen(PORT,
			() => {
				console.info(`Application started on port ${PORT} at ${new Date()}`);
			}
		)
	})
	.catch(err => {
		console.error('error: ', err);
		process.exit(-1);
	})
