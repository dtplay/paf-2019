-- Drop any existing database
select 'Dropping database' as '';
drop database if exists mydb;

-- Create database
select 'Creating mydb...' as '';
create database mydb;

-- Set mydb as the current database
use mydb;

-- Create table
select 'Creating table tv_shows' as '';
create table tv_shows (
    prog_id char(8) not null,
    title varchar(128) not null,
    genre enum('G', 'PG', 'NC16', 'M18', 'R21') default 'PG',
    release_date date not null, -- '01-12-2019',
    poster blob,
    primary key(prog_id)
);