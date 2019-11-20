
const connect = (client) => {
	return new Promise(
		(resolve, reject) => {
			client.connect(
				(err) => {
					if (err)
						return reject(err);
					resolve();
				}
			)
		}
	);
}

const getCountries = (client) => 
		client.db('airbnb').collection('listingsAndReviews')
			.distinct('address.country')

const getPropertiesByCountry = (params, client) => 
		client.db('airbnb').collection('listingsAndReviews')
			.aggregate([
				{
					$match: { 'address.country': params.country }
				},
				{
					$project: {
						_id: 1,
						name: 1,
						summary: 1,
						image: '$images.picture_url',
						country: '$address.country',
						city: '$address.market',
						host: '$host.host_picture_url',
						host_name: '$host.host_name'
					}
				},
				{ $limit: params.limit },
				{ $skip: params.offset },
			])
			.toArray()

const getPropertyById = (id, client) =>
		client.db('airbnb').collection('listingsAndReviews')
			.findOne({ _id: id}, {
				projection: {
					description: 1,
					'address.location': 1,
				}
			})
			.then(result => {
				if (!result)
					return null;
				return {
					_id: result._id,
					description: result.description,
					location: result.address.location
				}
			})
			//.toArray()
//
const getCount = (client) => 
		client.db('airbnb').collection('listingsAndReviews')
			.find({ city: city })
			.count()

module.exports = { connect, getCountries, getPropertiesByCountry, getPropertyById };
