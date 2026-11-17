A `for` loop repeats code a set number of times. It has three parts: where to start, when to keep going, and what to change after each pass.

```php
for ($i = 1; $i <= 3; $i++) {
    echo $i;      // 1, then 2, then 3
}
```

An **array** is a list of values. `[]` is an empty one, and `$list[] = …` appends to the end:

```php
$squares = [];
$squares[] = 1;
$squares[] = 4;    // [1, 4]
```

The `%` operator gives the remainder of a division, which is how you test whether one number divides another: `$n % 3 === 0` is true when `$n` is a multiple of 3.

Order matters when conditions overlap. Check the most specific case first.
