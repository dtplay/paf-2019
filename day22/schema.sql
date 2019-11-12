drop database if exists acme;

create database acme;

use acme;

create table customer (
    cust_id char(8) not null,
    given_name varchar(64) not null,
    email varchar(128) not null,

    primary key(cust_id)
);

create table products (
    prod_id char(8) not null,
    description varchar(128) not null,
    unit_price decimal(8, 2) not null,

    primary key(prod_id)
);

create table warehouse (
    w_id int not null,
    address varchar(128) not null,

    primary key(w_id)
);

create table orders (
    ord_id int auto_increment,
    cust_id char(8) not null,

    primary key(ord_id),
    constraint fk_cust_id
        foreign key(cust_id) references customer(cust_id)
); 

create table order_item (
    item_id int auto_increment,
    quantity int default 1,
    prod_id char(8) not null,
    ord_id int,

    primary key(item_id),
    constraint fk_prod_id
        foreign key(prod_id) references products(prod_id),

    constraint fk_ord_id
        foreign key(ord_id) references orders(ord_id)
);

create table products_warehouse (
    prod_id char(8) not null,
    w_id int not null,
    primary key(prod_id, w_id),

    constraint fk_prod_id_2
        foreign key(prod_id) references products(prod_id),
    constraint fk_w_id
        foreign key(w_id) references warehouse(w_id)
);
