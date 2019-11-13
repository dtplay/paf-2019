drop database if exists mybank;

create database mybank;

use mybank;

create table accounts (
	acct_id int not null,
	given_name varchar(128) not null,
	balance decimal(8, 2) not null,
	update_time timestamp default current_timestamp
		on update current_timestamp,

	primary key(acct_id),
);

insert into accounts(acct_id, given_name, balance) values
	(1, 'fred', 1000),
	(2, 'barney', 1000),
	(3, 'wilma', 1000),
	(4, 'betty', 1000);

create index idx_given_name on accounts;
