# Counting and grouping

Sometimes you don't want the rows themselves, but a fact *about* them. **Aggregate functions** collapse many rows into one value:

```sql
SELECT COUNT(*), MAX(price)
FROM menu;
```

- `COUNT(*)` counts rows.
- `SUM(column)`, `AVG(column)`, `MIN(column)` and `MAX(column)` work on a column's values.

`GROUP BY` splits the rows into groups first, then calculates the aggregates once per group:

```sql
SELECT category, MAX(price) AS top_price
FROM menu
GROUP BY category;
```

That returns one row per category. `AS` gives a result column a readable name, called an **alias**.

A rule to remember: every column in the `SELECT` list must either appear in the `GROUP BY` or sit inside an aggregate function.

## Task

Brewline wants an overview of its menu. Return one row per `category` with three columns:

1. `category`
2. the number of items, named `items`
3. the average price, named `avg_price`

## Hints

- Group by `category`, and select `category` plus two aggregates.
- The count is `COUNT(*) AS items`. The average is `AVG(price) AS avg_price`.
- The column names are checked, so both aliases are needed.

## Starter

```sql
-- Items and average price per category

```

## Solution

```sql
-- Items and average price per category
SELECT category, COUNT(*) AS items, AVG(price) AS avg_price
FROM menu
GROUP BY category;
```
