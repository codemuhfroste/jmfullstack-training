PHP decides with `if`, `elseif` and `else`. The conditions are tried from top to bottom and the first true one wins:

```php
if ($temp < 15) {
    return "cold";
} elseif ($temp < 25) {
    return "mild";
} else {
    return "hot";
}
```

Combine conditions with `&&` (and) and `||` (or). Compare with `<`, `>`, `<=`, `>=`, `===` and `!==`.

Handle invalid input *first* and return early. The rest of the function can then assume the value is sensible.

PHP 8 also has `match`, a compact alternative when every branch returns a value:

```php
return match (true) {
    $temp < 15 => "cold",
    $temp < 25 => "mild",
    default    => "hot",
};
```
