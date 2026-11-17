A function can call *itself*. That is **recursion**, and it suits data that contains smaller copies of itself: folders inside folders, comments with replies, arrays inside arrays.

Every recursive function needs two parts:

- a **base case** that can be answered directly, and
- a **recursive case** that breaks the problem down and calls the function again on the smaller piece.

```php
function countDown(int $n): array
{
    if ($n === 0) {
        return [];                              // base case
    }
    return [$n, ...countDown($n - 1)];          // recursive case
}

countDown(3);   // [3, 2, 1]
```

The `...` (spread) operator unpacks one array into another. `is_array($value)` tells you whether a value is an array, which here is the question that separates the two cases.
