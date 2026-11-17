# SQL reviewer

A database stores a site's lasting data in tables. SQL is the language for asking questions of that data and changing it.

## Reading data

- A **table** has named **columns**; each **row** is one record.
- Text values go in single quotes. Keywords are written in capitals by convention.
- The clauses always come in this order:

```sql
SELECT name, price        -- which columns (* means all)
FROM menu                 -- which table
WHERE category = 'coffee' AND price < 130    -- which rows
ORDER BY price DESC       -- sorted how
LIMIT 3;                  -- how many
```

| Piece | Meaning |
| --- | --- |
| `=` and `<>` | Equal and not equal (a single `=`) |
| `<` `>` `<=` `>=` | Comparisons |
| `AND` / `OR` | Both conditions / either condition |
| `ORDER BY x` | Ascending; add `DESC` for descending |
| `LIMIT n` | Only the first `n` rows |

Q: Without `ORDER BY`, in what order do rows come back?
A: No guaranteed order. If the order matters, always ask for it.

Q: How do you get the single cheapest item?
A: `ORDER BY price ASC LIMIT 1`.

Q: What is wrong with `WHERE category = coffee`?
A: The text value needs single quotes: `'coffee'`. Without them the database looks for a column called coffee.

## Changing data

```sql
INSERT INTO menu (name, category, price)
VALUES ('Matcha Latte', 'tea', 150);

UPDATE menu SET price = 95 WHERE name = 'Espresso';

DELETE FROM menu WHERE name = 'Day-old Muffin';
```

- The **primary key** (`id`) uniquely identifies a row. The database assigns it on insert.
- `UPDATE` and `DELETE` act on **every row that matches the `WHERE`**. With no `WHERE`, that is the whole table.
- Write the `WHERE` as a `SELECT` first and check which rows it returns.

Q: What does `DELETE FROM menu;` do?
A: It deletes every row in the table. There is no undo on a real database.

Q: Why isn't `id` listed in the `INSERT`?
A: It is the primary key, and the database fills in the next free number automatically.

## Answering questions

- **Aggregate functions** collapse many rows into one value: `COUNT(*)`, `SUM(x)`, `AVG(x)`, `MIN(x)`, `MAX(x)`.
- `GROUP BY` makes one result row per group. Every selected column must be in the `GROUP BY` or inside an aggregate.
- `AS` gives a result column a name (an **alias**).
- A **foreign key** is a column holding another table's `id`. `JOIN … ON` pairs the rows that belong together.

```sql
SELECT menu.name,
       SUM(orders.qty) AS cups,
       SUM(orders.qty * menu.price) AS revenue
FROM orders
JOIN menu ON menu.id = orders.item_id
GROUP BY menu.name
ORDER BY revenue DESC;
```

Q: Why does `orders` store `item_id` instead of the item's name and price?
A: So each fact lives in one place. If a price changes, only one row in `menu` needs updating.

Q: What does `GROUP BY category` change about `COUNT(*)`?
A: Instead of one count for the whole table, you get one count per category.

Q: When two joined tables both have an `id` column, how do you say which one you mean?
A: Prefix it with the table name: `menu.id` or `orders.id`.
