# Asking for data

A site's lasting data, such as its menu, its customers and its orders, lives in a **database**. A database is a set of **tables**. Each table has named **columns**, and every **row** is one record.

Brewline's database has a `menu` table. Open the **Tables** tab under the editor to see what is in it.

**SQL** is the language for talking to a database. To read data you write a `SELECT` query: say which columns you want, and which table they come from.

```sql
SELECT name, category FROM menu;
```

- List the columns after `SELECT`, separated by commas, in the order you want them.
- `SELECT *` means "every column".
- SQL keywords are usually written in capitals. That's a convention to make queries readable, not a requirement.
- A query ends with a semicolon.

Press **Run** to see what your query returns. The **Expected** tab shows the result you're aiming for.

## Task

Write a query that returns the `name` and `price` of every item on the menu, in that order.

## Hints

- The pattern is `SELECT column, column FROM table;`
- `SELECT name, price FROM menu;`

## Starter

```sql
-- Show the name and price of every menu item

```

## Solution

```sql
-- Show the name and price of every menu item
SELECT name, price FROM menu;
```
