
// load libraries
const fs = require('fs');
const mysql = require('mysql');
const express = require('express');
const morgan = require('morgan');
const db = require('./dbutil');

let config;

if (fs.existsSync(__dirname + '/config.js')) {
	config = require(__dirname + '/config');
	config.ssl = {
		 ca: fs.readFileSync(config.cacert)
	};
} else
	config = {};


// configurations
const pool = mysql.createPool(config);
const PORT = parseInt(process.argv[2] || process.env.APP_PORT || process.env.PORT) || 3000;
//
// SQL statements
const CREATE_ORDER = 'insert into orders(order_date, email) values (?, ?)';
const GET_NEW_ORDER_ID = 'select last_insert_id() as ord_id from orders';
const CREATE_ORDER_DETAILS = 'insert into order_details(description, quantity, ord_id) values ?';

const GET_ALL_ORDERS = 'select * from orders';

const createOrder = db.mkQuery(CREATE_ORDER);
const getNewOrderId = db.mkQuery(GET_NEW_ORDER_ID)
const createOrderDetails = db.mkQuery(CREATE_ORDER_DETAILS);

const getAllOrders = db.mkQueryFromPool(db.mkQuery(GET_ALL_ORDERS), pool);

// start the application
const app = express();


app.use(morgan('tiny'));

app.get('/api/orders',
	(req, resp) => {
		getAllOrders()
			.then(result => {
				resp.status(200).type('application/json').json(result)
			})
			.catch(error => {
				resp.status(400).type('application/json').json({ error })
			})
	}
)

// POST /api/order, application/json
// req.body => 201
/*
 * { 
 * 	email: 'fred@gmail.com', 
 * 	orderDetails: [
 * 		{ description: 'apple', quantity: 10 },
 * 		{ description: 'orange', quantity: 10 },
 * 	]
* 	}
 */
app.post('/api/order', express.json(),
	(req, resp) => {
		console.info('body: ', req.body);

		const newOrder = [ new Date(), req.body.email ];
		const newOrderSample = req.body.orderDetails.map(v => [ v.description, v.quantity ])

		console.info('order = ', newOrder);
		console.info('order details = ', newOrderSample);

		pool.getConnection(
			(err, conn) => {
				if (err)
					throw err;
				// Start transaction
				// { connection, result, params, error }
				db.startTransaction(conn)
					.then(status => {
						//status.connection
						return (
							createOrder({ 
								connection: status.connection, 
								params: newOrder
							})
						)
					})
					// .then(getNewOrderId) // (status) => { }
					.then(status => {
						// const newOrderId = status.result[0].ord_id;
						const newOrderId = status.result.insertId;
						const newOrderDetails = newOrderSample.map(
							v => {
								v.push(newOrderId);
								return (v);
							}
						);
						return (
							createOrderDetails({
								connection: status.connection,
								params: [ newOrderDetails ]
							})
						)
					})
					.then(db.commit, db.rollback)
					.then(
						(status) => { resp.status(201).json({}); },
						(status) => { resp.status(400).json({ error: status.error }); }
					)
					.finally(() => { conn.release() })
			} // getConnection
		)
	}
)

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
