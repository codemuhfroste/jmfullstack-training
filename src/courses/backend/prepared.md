# Prepared statements

Most queries depend on input: a search word, a price limit, an id from the URL. The obvious approach is to glue the value into the SQL string. **Never do that.**

```php
// DANGEROUS
$pdo->query("SELECT * FROM menu WHERE name = '$name'");
```

If `$name` comes from a visitor, they can type SQL instead of a name and the database will run it. This is **SQL injection**, one of the most common ways sites get broken into.

The fix is a **prepared statement**. You send the SQL with placeholders first, and the values separately:

```php
$statement = $pdo->prepare('SELECT * FROM menu WHERE category = :category');
$statement->execute(['category' => $category]);
$rows = $statement->fetchAll(PDO::FETCH_ASSOC);
```

- `:category` is a **named placeholder**. It marks where a value will go.
- `execute()` supplies the values as an array keyed by placeholder name.
- The database treats those values strictly as data. Whatever the visitor typed, it can never become part of the SQL.

Use a prepared statement every time a query contains a value from outside.

## Task

Complete `itemsUnder(int $max)`. It returns every menu item whose `price` is **less than** `$max`, cheapest first. Each row has the keys `name` and `price`.

```php
itemsUnder(100)
// [['name' => 'Croissant', 'price' => 75], ['name' => 'Espresso', 'price' => 90]]
```

Use `prepare()` with a placeholder for the limit.

## Hints

- The SQL is `SELECT name, price FROM menu WHERE price < :max ORDER BY price`.
- Prepare it, then `$statement->execute(['max' => $max]);`
- Return `$statement->fetchAll(PDO::FETCH_ASSOC);`

## Given: helpers.php

```php
<?php
function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO('sqlite::memory:');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->exec("CREATE TABLE menu (id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, price INTEGER NOT NULL)");
        $pdo->exec("INSERT INTO menu (name, category, price) VALUES ('Espresso', 'coffee', 90), ('Latte', 'coffee', 120), ('Mocha', 'coffee', 135), ('Chai', 'tea', 100), ('Croissant', 'pastry', 75)");
        $pdo->exec("CREATE TABLE orders (id INTEGER PRIMARY KEY, customer TEXT NOT NULL, item_id INTEGER NOT NULL, qty INTEGER NOT NULL)");
    }
    return $pdo;
}
```

## Starter: main.php

```php
<?php
function itemsUnder(int $max): array
{
    $pdo = db();

    // Prepare, execute with the limit, and return the rows
    return [];
}
```

## Solution: main.php

```php
<?php
function itemsUnder(int $max): array
{
    $pdo = db();

    $statement = $pdo->prepare('SELECT name, price FROM menu WHERE price < :max ORDER BY price');
    $statement->execute(['max' => $max]);
    return $statement->fetchAll(PDO::FETCH_ASSOC);
}
```
