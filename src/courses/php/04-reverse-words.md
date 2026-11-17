PHP has a large toolbox of built-in string functions. Three of them cover a surprising amount of work:

```php
$words = explode(" ", "one two three");   // ["one", "two", "three"]
$text  = implode("-", $words);            // "one-two-three"
$back  = strrev("abc");                   // "cba"
```

- `explode` splits a string into an array at every separator.
- `implode` does the reverse: it joins an array into one string.
- `strrev` reverses the characters of a string.

To do the same thing to every element of an array, loop over it with `foreach`:

```php
foreach ($words as $word) {
    echo strtoupper($word);
}
```

A common pattern for text is: split it apart, change the pieces, join them again.
