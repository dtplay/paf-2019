-- drop database if exists
drop database if exists bdayparty;

-- create the database
create database bdayparty;

-- make bdayparty as the default
use bdayparty;

-- create rsvp table
create table rsvp (
    email varchar(256) not null,
    give_name varchar(256) not null,
    comment text,
    attendance bit(1) default 1,
    gender enum('m', 'f', 'male', 'female'),
    responded datetime default current_timestamp
);