
// load libraries
const fs = require('fs');
const mysql = require('mysql');
const express = require('express');
const hbs = require('express-handlebars');

const config = require('./config');
config.ssl = {
    ca: fs.readFileSync(config.cacert)
};


// configurations
const pool = mysql.createPool(config);
const PORT = parseInt(process.argv[2] || process.env.APP_PORT || process.env.PORT) || 3000;

// start the application
const app = express();

app.engine('hbs', hbs({defaultLayout: 'main.hbs'}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

const SELECT_ORDERS_SUMMARY = 'select * from orders_summary';

app.get('/api/orders/summary',
	(req, resp) => {
		pool.getConnection(
			(err, conn) => {
				if (err)
					return resp.status(500).type('text/html').end(err);
				conn.query(SELECT_ORDERS_SUMMARY, 
					(err, result) => {
						conn.release();
						resp.status(200).type('text/html')
							.render('orders_summary', { line: result });
					}
				)
			}
		)
	}
)


app.use(express.static(__dirname + '/public'));

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
