const morgan = require('morgan');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const request = require('request-promise');

const config = require('/opt/tmp/keys/config');

const m = require('./mongoutil');

const PORT = parseInt(process.argv[2] || process.env.APP_PORT || process.env.PORT) || 3000;

//const client = new MongoClient(config.atlas.url, { useUnifiedTopology: true })
const client = new MongoClient(config.mongodb.url, { useUnifiedTopology: true })

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
				console.error(error);
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
				console.error(error);
				resp.status(500).json({ error });
			});
	}
)

app.get('/api/map/:id',
	(req, resp) => {
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
				if (!result)
					return resp.status(404).json({ error });
				console.info(typeof result);
				resp.status(200).type('image/png').send(result);
			})
			.catch(error => {
				console.error(error);
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
