# Variables and arithmetic

In PHP every variable name starts with a dollar sign. There is no `let` or `const`: assigning a value creates the variable.

```php
<?php
$shop = "Brewline";
$cups = 2;
$cups = $cups + 1;   // 3
```

The arithmetic operators are the ones you know from JavaScript: `+`, `-`, `*`, `/` and `%` (remainder).

Double-quoted strings **interpolate**: a variable written inside them is replaced by its value.

```php
echo "We sold $cups cups";      // We sold 3 cups
echo 'We sold $cups cups';      // We sold $cups cups  (single quotes: no interpolation)
```

Only variables are replaced, not calculations. Do the maths first and store the result:

```php
$total = $cups * 120;
echo "Total: $total";
```

To join strings without interpolation, PHP uses a dot: `"Total: " . $total`.

## Task

The starter code stores an order in three variables.

1. Create `$total`, holding `$price` multiplied by `$qty`.
2. Print exactly:

```
3 x Latte = 360
```

Build the line from the variables. Don't type the numbers into the string.

## Hints

- `$total = $price * $qty;`
- Use double quotes so the variables are replaced: `echo "$qty x $drink = $total";`
- The `x` is plain text with a space on each side.

## Starter

```php
<?php
$drink = "Latte";
$price = 120;
$qty = 3;

// Calculate the total, then print the order line

```

## Solution

```php
<?php
$drink = "Latte";
$price = 120;
$qty = 3;

// Calculate the total, then print the order line
$total = $price * $qty;
echo "$qty x $drink = $total";
```
