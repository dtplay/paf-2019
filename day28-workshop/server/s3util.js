const aws = require('aws-sdk');

const config = require('/opt/tmp/keys/config');

const makeS3 = (ep, config) => 
	new aws.S3({
		endpoint: new aws.Endpoint(ep),
		accessKeyId: config.s3.accessKey,
		secretAccessKey: config.s3.secret
	})

const checkExists = (params, conn) =>
	new Promise((resolve, reject) => {
		conn.headObject(params, (error, result) => {
			if (error) {
				if (error.statusCode == 404)
					return resolve({ exists: false });
				return reject(error);
			}
			resolve({ exists: true, data: result });
		})
	})

const saveMap = (params, conn) => 
	new Promise((resolve, reject) => {
		conn.putObject(params, (error, result) => {
			if (error)
				return reject(error);
			resolve(result);
		})
	});

module.exports = { makeS3, checkExists, saveMap }
