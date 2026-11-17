From here on you write **functions**, and each one is graded by calling it with several inputs.

A PHP function names its parameters, and can state the **type** of each one and of the value it returns:

```php
function double(int $n): int
{
    return $n * 2;
}
```

`int $n` means the function expects a whole number. `: int` after the parentheses means it gives one back. Other common types are `string`, `float`, `bool` and `array`.

When text follows a variable directly inside a double-quoted string, wrap the variable in braces so PHP knows where its name ends:

```php
$fruit = "apple";
echo "I ate two {$fruit}s";   // I ate two apples
```
