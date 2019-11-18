// ELT - Extract, Load, Transform
// Loading mongo driver
const MongoClient = require('mongodb').MongoClient;

// Connection string
const URL = 'mongodb://localhost:27017'

// Create a new instance of the client
const client = new MongoClient(URL, { useUnifiedTopology: true });

const fields = [ 'tags', 'nutrition', 'steps', 'ingredients' ]

// Open a pool connect to the database
client.connect(
    (err) => {
        if (err)
            throw err;
        client.db('food').collection('recipes')
            .find({})
            //.limit(10)
            .forEach(r => {
                for (let t of fields) {
                    const str = r[t].replace(/'/g, '"').trim()
                    //console.info('\t ', str)
                    try {
                        r[t] = JSON.parse(str);
                    } catch { r[t] = []; }

                }
                console.info(JSON.stringify(r))
            })
    }
)