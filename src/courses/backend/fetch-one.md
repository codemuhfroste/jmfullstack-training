# One row, or none

Often you want a single record: the product with this id, the user with this email. `fetch()` reads **one** row from a statement:

```php
$statement = $pdo->prepare('SELECT * FROM menu WHERE id = :id');
$statement->execute(['id' => $id]);
$row = $statement->fetch(PDO::FETCH_ASSOC);
```

If a row matched, `$row` is an associative array. If nothing matched, `fetch()` returns `false`, not an empty array and not `null`. Code that forgets this breaks the first time someone asks for something that doesn't exist.

Check for it and turn it into something clearer for your callers:

```php
if ($row === false) {
    return null;
}
return $row;
```

A return type written with a question mark, such as `?array`, means "an array or `null`". It tells everyone who uses the function that "not found" is a possibility they must handle.

## Task

Complete `findItem(string $name)`. It returns the full row of the menu item with that name (keys `id`, `name`, `category`, `price`), or `null` if there is no such item.

```php
findItem('Latte')   // ['id' => 2, 'name' => 'Latte', 'category' => 'coffee', 'price' => 120]
findItem('Tea')     // null
```

## Hints

- Prepare `SELECT id, name, category, price FROM menu WHERE name = :name` and execute it with the name.
- Read one row with `$statement->fetch(PDO::FETCH_ASSOC)`.
- `return $row === false ? null : $row;`

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
function findItem(string $name): ?array
{
    $pdo = db();

    // Return the matching row, or null
    return [];
}
```

## Solution: main.php

```php
<?php
function findItem(string $name): ?array
{
    $pdo = db();

    $statement = $pdo->prepare('SELECT id, name, category, price FROM menu WHERE name = :name');
    $statement->execute(['name' => $name]);
    $row = $statement->fetch(PDO::FETCH_ASSOC);

    return $row === false ? null : $row;
}
```
