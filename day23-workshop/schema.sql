drop database if exists myshop;

create database myshop;

use myshop;

create table user (
	email varchar(64),
	name varchar(128),

	primary key(email),
	key(name)
);

create table orders (
	ord_id int auto_increment,
	order_date date,
	email varchar(64),
	last_update timestamp default current_timestamp
		on update current_timestamp,

	primary key(ord_id),

	constraint fk_email 
		foreign key(email)
		references user(email)
);

create table order_details (
	ord_details_id int auto_increment,
	description varchar(256) not null,
	quantity int default 1,
	ord_id int not null,

	primary key(ord_details_id),

	constraint fk_ord_id
		foreign key(ord_id)
		references orders(ord_id)
);

insert into user(email, name) values
	('fred@gmail.com', 'fred'),
	('barney@gmail.com', 'barney'),
	('wilma@gmail.com', 'wilma'),
	('betty@gmail.com', 'betty');

