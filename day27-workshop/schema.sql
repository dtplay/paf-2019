drop database if exists myfb;

create database myfb;

use myfb;

create table user (
	email varchar(128) not null,
	name varchar(64) not null,
	primary key(email)
);

insert into user(email, name) values
	('fred@gmail.com', 'Fred'),
	('barney@gmail.com', 'Barney');
