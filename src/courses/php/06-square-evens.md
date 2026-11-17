Just like JavaScript's `filter` and `map`, PHP has functions that process a whole array at once. Each takes a small function and calls it for every element.

```php
$numbers = [1, 2, 3, 4];

$big     = array_filter($numbers, fn($n) => $n > 2);   // [2 => 3, 3 => 4]
$doubled = array_map(fn($n) => $n * 2, $numbers);      // [2, 4, 6, 8]
```

`fn($n) => $n > 2` is an **arrow function**: a one-line function whose result is the expression after `=>`.

Two things catch everyone out:

- The argument order differs. `array_filter` takes the array first, `array_map` takes the function first.
- `array_filter` keeps the original **keys**, so the result above has keys `2` and `3`, with gaps. `array_values()` renumbers an array from 0.
