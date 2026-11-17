# Challenge: place an order

Time to put the whole stack together. This is what happens on the server when a customer presses **Place order** on the form you built in the HTML course:

1. **Validate** the input. Never trust it.
2. **Look up** what the request refers to. Does the item exist? What does it cost?
3. **Write** the new record.
4. **Respond** with a result the front end can show, usually as JSON.

A back end should not crash on bad input, and it should not answer with a bare `true` or `false` either. A good pattern is to always return the same shape, with a flag that says whether it worked:

```php
return ['ok' => false, 'error' => 'Something specific went wrong'];
return ['ok' => true, 'orderId' => 7];
```

The front end checks `ok`, then either shows the error text or carries on. Note that the price is read from the database on the server. A price sent by the browser could have been changed by the visitor.

## Task

Complete `placeOrder(string $customer, string $itemName, int $qty)`:

1. If `$qty` is less than 1, return `['ok' => false, 'error' => 'Quantity must be at least 1']`.
2. Look up the menu item by name. If it doesn't exist, return `['ok' => false, 'error' => 'Unknown item']`.
3. Otherwise insert a row into `orders` (`customer`, `item_id`, `qty`).
4. Return `['ok' => true, 'orderId' => <the new id as an int>, 'total' => <price times quantity>]`.

Use prepared statements for both queries. The `orders` table starts empty, so the first order gets id `1`.

## Hints

- Validate the quantity before touching the database.
- Find the item with `SELECT id, price FROM menu WHERE name = :name` and `fetch(PDO::FETCH_ASSOC)`. Remember it returns `false` when nothing matches.
- Insert with `INSERT INTO orders (customer, item_id, qty) VALUES (:customer, :item, :qty)`, then build the result from `(int) $pdo->lastInsertId()` and `$item['price'] * $qty`.

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
function placeOrder(string $customer, string $itemName, int $qty): array
{
    $pdo = db();

    // 1. Validate the quantity

    // 2. Look up the item

    // 3. Insert the order

    // 4. Return the result
    return ['ok' => false, 'error' => 'Not implemented'];
}
```

## Solution: main.php

```php
<?php
function placeOrder(string $customer, string $itemName, int $qty): array
{
    $pdo = db();

    // 1. Validate the quantity
    if ($qty < 1) {
        return ['ok' => false, 'error' => 'Quantity must be at least 1'];
    }

    // 2. Look up the item
    $find = $pdo->prepare('SELECT id, price FROM menu WHERE name = :name');
    $find->execute(['name' => $itemName]);
    $item = $find->fetch(PDO::FETCH_ASSOC);

    if ($item === false) {
        return ['ok' => false, 'error' => 'Unknown item'];
    }

    // 3. Insert the order
    $insert = $pdo->prepare('INSERT INTO orders (customer, item_id, qty) VALUES (:customer, :item, :qty)');
    $insert->execute(['customer' => $customer, 'item' => $item['id'], 'qty' => $qty]);

    // 4. Return the result
    return [
        'ok'      => true,
        'orderId' => (int) $pdo->lastInsertId(),
        'total'   => $item['price'] * $qty,
    ];
}
```
