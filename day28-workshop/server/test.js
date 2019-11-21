const config = require('/opt/tmp/keys/config');

const s3 = require('./s3util.js');

console.info(config.s3);

const s3conn = s3.makeS3('sgp1.digitaloceanspaces.com', config);

const params = {
	Bucket: 'abc123',
	Key: 'dice.png'
}

s3.checkExists(
	{ 
		Bucket: 'abc123',
		Key: 'dice.png'
	}, 
	s3conn
)
.then(result => {
	console.info('exists: ', result);
})
.catch(error => {
	console.error('error: ', error);
})

