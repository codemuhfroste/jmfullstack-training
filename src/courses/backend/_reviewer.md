# PHP + SQL reviewer

The point where the layers meet: PHP receives a request, queries the database through PDO, and answers.

## Connecting

- **PDO** is PHP's database interface. A PDO object is an open connection.
- The same code works for SQLite, MySQL and PostgreSQL; only the connection string differs.
- `query()` runs SQL that contains no outside values and returns a **statement**.

```php
$pdo = new PDO('sqlite:brewline.db');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$names = $pdo->query('SELECT name FROM menu ORDER BY id')->fetchAll(PDO::FETCH_COLUMN);
```

| Fetch call | Gives you |
| --- | --- |
| `fetchAll(PDO::FETCH_ASSOC)` | Every row, each an associative array |
| `fetchAll(PDO::FETCH_COLUMN)` | The first column of every row, as a flat list |
| `fetch(PDO::FETCH_ASSOC)` | One row, or `false` if there is none |

Q: What does `PDO::ERRMODE_EXCEPTION` change?
A: Database errors throw exceptions instead of failing silently, so mistakes show up immediately.

Q: Which fetch call gives a simple list of names?
A: `fetchAll(PDO::FETCH_COLUMN)`.

## Safe queries

- Never put outside values into an SQL string. That allows **SQL injection**: a visitor's input being run as SQL.
- A **prepared statement** sends the SQL with placeholders, and the values separately. Values can then never become SQL.
- `fetch()` returns `false` when nothing matches. Check for it.
- A return type of `?array` means "an array or `null`".

```php
$statement = $pdo->prepare('SELECT * FROM menu WHERE name = :name');
$statement->execute(['name' => $name]);
$row = $statement->fetch(PDO::FETCH_ASSOC);

return $row === false ? null : $row;
```

Q: Why is `"... WHERE name = '$name'"` dangerous?
A: Whatever is in `$name` becomes part of the SQL. A visitor can type SQL of their own and the database will run it.

Q: How does a prepared statement prevent that?
A: The query's structure is fixed before the values arrive, so the values are always treated as data.

Q: When must you use a prepared statement?
A: Every time a query contains a value that comes from outside your code: forms, URLs, cookies, uploaded files.

## Writing data

- `INSERT`, `UPDATE` and `DELETE` are prepared and executed the same way; there is nothing to fetch.
- `(int) $pdo->lastInsertId()` is the id of the row just inserted.
- `$statement->rowCount()` is how many rows a write changed.

Handling a request, in order:

1. **Validate** the input.
2. **Look up** what it refers to. Read prices and permissions from the database, never from the request.
3. **Write** the record.
4. **Respond** in a consistent shape.

```php
return ['ok' => false, 'error' => 'Unknown item'];
return ['ok' => true, 'orderId' => 7, 'total' => 240];
```

Q: Why read the price from the database when the form could send it?
A: Anything sent by the browser can be altered by the visitor. The server's own data is the only price to trust.

Q: Why return `['ok' => false, 'error' => '…']` instead of just `false`?
A: The front end gets a predictable shape and a message it can show to the user.
