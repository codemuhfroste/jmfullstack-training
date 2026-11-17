# Saving data

Reading is half the job. When a visitor submits a form, PHP has to store what they sent. Prepared statements work for `INSERT`, `UPDATE` and `DELETE` exactly as they do for `SELECT`, and they matter even more here, because this data comes straight from the outside.

```php
$statement = $pdo->prepare('INSERT INTO orders (customer, item_id, qty) VALUES (:customer, :item, :qty)');
$statement->execute([
    'customer' => $customer,
    'item'     => $itemId,
    'qty'      => $qty,
]);
```

A write returns no rows, so there is nothing to fetch. Two things are useful afterwards:

- `$pdo->lastInsertId()` gives the `id` the database assigned to the new row. It comes back as a string, so convert it with `(int)`.
- `$statement->rowCount()` tells you how many rows an `UPDATE` or `DELETE` changed.

Returning the new id is a common pattern: the caller can use it to link straight to the thing that was just created.

## Task

Complete `addItem(string $name, string $category, int $price)`. It inserts a new row into `menu` and returns the new row's `id` as an `int`.

The menu already has 5 items, so the first item you add gets id `6`.

## Hints

- Prepare `INSERT INTO menu (name, category, price) VALUES (:name, :category, :price)`.
- Execute it with an array containing all three values.
- `return (int) $pdo->lastInsertId();`

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
function addItem(string $name, string $category, int $price): int
{
    $pdo = db();

    // Insert the item and return its new id
    return 0;
}
```

## Solution: main.php

```php
<?php
function addItem(string $name, string $category, int $price): int
{
    $pdo = db();

    $statement = $pdo->prepare('INSERT INTO menu (name, category, price) VALUES (:name, :category, :price)');
    $statement->execute(['name' => $name, 'category' => $category, 'price' => $price]);

    return (int) $pdo->lastInsertId();
}
```
