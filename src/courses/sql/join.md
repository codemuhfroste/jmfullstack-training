# Challenge: joining tables

Brewline's database has a second table, `orders`. Look at it in the **Tables** tab: each order stores an `item_id`, not the item's name or price.

That is deliberate. The name and price live in one place only, the `menu` table, and orders *point* to it. A column that holds another table's `id` is called a **foreign key**. If the price of a latte changes, it changes in exactly one row.

To bring the two tables back together, `JOIN` them and say which columns match:

```sql
SELECT orders.customer, menu.name
FROM orders
JOIN menu ON menu.id = orders.item_id;
```

Each order row is paired with the menu row whose `id` equals its `item_id`. When two tables are involved, write `table.column` to be clear about which column you mean.

A joined result behaves like any other table, so you can group and sort it:

```sql
SELECT menu.category, SUM(orders.qty) AS cups
FROM orders
JOIN menu ON menu.id = orders.item_id
GROUP BY menu.category;
```

## Task

Produce Brewline's sales report: one row per menu item that has been ordered, with three columns:

1. the item's `name`
2. the total quantity ordered, named `cups`
3. the money it brought in (quantity times price, summed), named `revenue`

Sort the report by `revenue`, highest first. The order of the rows is checked.

## Hints

- Join `orders` to `menu` on `menu.id = orders.item_id`, then `GROUP BY menu.name`.
- Cups is `SUM(orders.qty) AS cups`. Revenue is `SUM(orders.qty * menu.price) AS revenue`.
- You can sort by an alias: `ORDER BY revenue DESC`.

## Starter

```sql
-- Sales report: name, cups, revenue (best seller first)
SELECT menu.name
FROM orders
JOIN menu ON menu.id = orders.item_id
;
```

## Solution

```sql
-- Sales report: name, cups, revenue (best seller first)
SELECT menu.name, SUM(orders.qty) AS cups, SUM(orders.qty * menu.price) AS revenue
FROM orders
JOIN menu ON menu.id = orders.item_id
GROUP BY menu.name
ORDER BY revenue DESC;
```
