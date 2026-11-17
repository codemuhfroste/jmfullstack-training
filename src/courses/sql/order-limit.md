# Sorting and limiting

A table has no guaranteed order. If the order of the rows matters, ask for it with `ORDER BY`:

```sql
SELECT name, price
FROM menu
ORDER BY price;
```

- The default direction is ascending: smallest first, A before Z. Write `ASC` to be explicit.
- Add `DESC` for descending order: largest first.

`LIMIT` cuts the result off after a number of rows. Together, the two answer "top N" questions:

```sql
SELECT name, price
FROM menu
ORDER BY price ASC
LIMIT 1;          -- the cheapest item
```

The clauses always appear in this order: `SELECT`, `FROM`, `WHERE`, `ORDER BY`, `LIMIT`.

## Task

Brewline wants to feature its premium items. Return the `name` and `price` of the **three most expensive** items, most expensive first.

In this lesson the order of the rows is checked.

## Hints

- Most expensive first means sorting by `price` in descending order.
- `ORDER BY price DESC` goes after `FROM menu`, and `LIMIT 3` goes last.

## Starter

```sql
-- The three most expensive items, priciest first

```

## Solution

```sql
-- The three most expensive items, priciest first
SELECT name, price
FROM menu
ORDER BY price DESC
LIMIT 3;
```
