# Adding rows

`SELECT` only reads. To add a record, use `INSERT`:

```sql
INSERT INTO menu (name, category, price)
VALUES ('Flat White', 'coffee', 125);
```

- After the table name, list the columns you're filling in.
- `VALUES` supplies one value per column, in the same order.
- Text goes in single quotes, numbers don't.

Notice that `id` isn't listed. It is the table's **primary key**: a number that uniquely identifies each row. The database assigns the next free one automatically.

An `INSERT` returns no rows. To see what it did, follow it with a `SELECT`. You can run several statements at once, each ending with a semicolon.

> Every run starts again from the original database, so you can experiment freely. Nothing you do here is permanent.

## Task

Brewline is adding a new drink. Insert a row into `menu` with:

- name: `Matcha Latte`
- category: `tea`
- price: `150`

## Hints

- Spell the name exactly, capital letters included: `'Matcha Latte'`.
- `INSERT INTO menu (name, category, price) VALUES ('Matcha Latte', 'tea', 150);`
- Add `SELECT * FROM menu;` on the next line to see the new row when you press Run.

## Starter

```sql
-- Add the Matcha Latte to the menu


-- Check the result
SELECT * FROM menu;
```

## Solution

```sql
-- Add the Matcha Latte to the menu
INSERT INTO menu (name, category, price)
VALUES ('Matcha Latte', 'tea', 150);

-- Check the result
SELECT * FROM menu;
```
