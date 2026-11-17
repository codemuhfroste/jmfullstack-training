# Changing and removing rows

`UPDATE` changes existing rows. `SET` says what to change, and `WHERE` says which rows:

```sql
UPDATE menu
SET price = 105
WHERE name = 'Chai';
```

`DELETE` removes rows:

```sql
DELETE FROM menu
WHERE name = 'Green Tea';
```

Both statements act on **every row that matches the `WHERE` clause**. Leave the `WHERE` out and they act on every row in the table: one forgotten line can reprice the whole menu, or empty it.

On a real database there is no undo. A good habit is to write the `WHERE` as a `SELECT` first, check that it returns exactly the rows you mean, and only then turn it into an `UPDATE` or `DELETE`.

## Task

Two changes to the menu:

1. The Espresso is going up. Set the `price` of `Espresso` to `95`.
2. The `Day-old Muffin` isn't selling. Delete it.

All other rows must stay exactly as they are.

## Hints

- You need two statements, each with its own `WHERE` and its own semicolon.
- `UPDATE menu SET price = 95 WHERE name = 'Espresso';`
- `DELETE FROM menu WHERE name = 'Day-old Muffin';`

## Starter

```sql
-- 1. Raise the price of the Espresso to 95


-- 2. Remove the Day-old Muffin


-- Check the result
SELECT * FROM menu;
```

## Solution

```sql
-- 1. Raise the price of the Espresso to 95
UPDATE menu
SET price = 95
WHERE name = 'Espresso';

-- 2. Remove the Day-old Muffin
DELETE FROM menu
WHERE name = 'Day-old Muffin';

-- Check the result
SELECT * FROM menu;
```
