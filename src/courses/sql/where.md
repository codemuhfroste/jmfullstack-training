# Filtering rows

You rarely want a whole table. `WHERE` keeps only the rows that match a condition:

```sql
SELECT name, price
FROM menu
WHERE price > 100;
```

- Compare with `=`, `<>` (not equal), `<`, `>`, `<=` and `>=`. Note the single `=` for "equal".
- Text values go in **single quotes**: `WHERE category = 'tea'`.
- Combine conditions with `AND` (both must be true) and `OR` (either one).

```sql
SELECT name
FROM menu
WHERE category = 'tea' OR category = 'pastry';
```

A query can be spread over several lines. The database only cares about the semicolon at the end.

## Task

A customer wants a coffee but has less than 130 to spend.

Return the `name` and `price` of every item whose `category` is `'coffee'` **and** whose `price` is below `130`.

## Hints

- Start from the previous query and add a `WHERE` clause after `FROM menu`.
- Two conditions joined by `AND`: one on `category`, one on `price`.
- `WHERE category = 'coffee' AND price < 130`

## Starter

```sql
-- Coffees that cost less than 130
SELECT name, price
FROM menu
;
```

## Solution

```sql
-- Coffees that cost less than 130
SELECT name, price
FROM menu
WHERE category = 'coffee' AND price < 130;
```
