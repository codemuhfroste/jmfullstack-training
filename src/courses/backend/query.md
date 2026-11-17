# PHP meets the database

So far PHP and SQL have lived in separate courses. On a real site they work together all day: PHP receives a request, asks the database a question in SQL, and turns the answer into a page or into JSON.

PHP talks to databases through **PDO** (PHP Data Objects). A PDO object is an open connection:

```php
$pdo = new PDO('sqlite:brewline.db');

$statement = $pdo->query('SELECT name, price FROM menu');
$rows = $statement->fetchAll(PDO::FETCH_ASSOC);
// [['name' => 'Espresso', 'price' => 90], ...]
```

- `query()` runs SQL and returns a **statement**: a handle on the result.
- `fetchAll()` reads every row into a PHP array. The argument chooses the shape:
  - `PDO::FETCH_ASSOC` gives each row as an associative array keyed by column name.
  - `PDO::FETCH_COLUMN` gives just the first column, as a flat list.

The same code works with MySQL or PostgreSQL. Only the connection string on the first line changes.

In this course the connection is made for you. Open the `helpers.php` tab: the function `db()` returns a PDO connection to Brewline's database, with the `menu` and `orders` tables you know from the SQL course.

## Task

Complete `menuNames()`. It returns the names of all menu items as a flat list, ordered by `id`.

```php
menuNames()   // ['Espresso', 'Latte', 'Mocha', 'Chai', 'Croissant']
```

## Hints

- Get the connection with `$pdo = db();`
- The query is `SELECT name FROM menu ORDER BY id`.
- A flat list of one column is `fetchAll(PDO::FETCH_COLUMN)`.

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
function menuNames(): array
{
    $pdo = db();

    // Query the names and return them as a flat list
    return [];
}
```

## Solution: main.php

```php
<?php
function menuNames(): array
{
    $pdo = db();

    $statement = $pdo->query('SELECT name FROM menu ORDER BY id');
    return $statement->fetchAll(PDO::FETCH_COLUMN);
}
```
