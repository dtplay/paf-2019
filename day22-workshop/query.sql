create view orders_summary as
    select c.company, 
        count(o.id) total_orders, 
        sum(od.quantity * (od.unit_price - od.discount)) orders_sum,
        avg(od.quantity * (od.unit_price - od.discount)) orders_avg
    from customers c 
    join orders o
    on c.id = o.customer_id
    join order_details od 
    on o.id = od.order_id
    group by c.company;

select s.company, 
    count(s.order_id) as total_orders,
    sum(s.quantity * (s.unit_price - s.discount)),
    avg(s.quantity * (s.unit_price - s.discount))
    from (
        select c.company as company, 
            o.id as order_id, 
            od.quantity as quantity, 
            od.unit_price as unit_price, 
            od.discount as discount
            from customers c
            join orders o
            on c.id = o.customer_id
            join order_details od
            on o.id = od.order_id
    ) as s
    group by s.company;
