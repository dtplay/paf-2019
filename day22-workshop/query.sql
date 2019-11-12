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
    group by c.company