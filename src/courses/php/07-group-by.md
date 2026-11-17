PHP arrays can use names instead of numbers as keys. These **associative arrays** are how PHP represents a record, such as a row from a database:

```php
$drink = ['name' => 'Latte', 'price' => 120];

echo $drink['name'];       // Latte
$drink['hot'] = true;      // add a key
```

`foreach` walks through a list of such rows:

```php
foreach ($drinks as $drink) {
    echo $drink['name'];
}
```

Arrays can hold arrays. Appending with `[]` to a key that doesn't exist yet creates the inner list automatically:

```php
$byCategory = [];
$byCategory['coffee'][] = 'Latte';
$byCategory['coffee'][] = 'Mocha';
// ['coffee' => ['Latte', 'Mocha']]
```

A key can come from a variable too: `$row[$key]` reads whichever column `$key` names.
