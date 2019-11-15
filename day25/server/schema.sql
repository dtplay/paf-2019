drop database if exists photos;

create database photos;

use photos;

create table animals (
	id int auto_increment,
	comments text,
	mimetype varchar(64),
	image mediumblob,

	primary key(id)
);
