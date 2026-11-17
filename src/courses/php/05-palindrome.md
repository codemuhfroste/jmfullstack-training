Text from real users is messy: mixed capitals, spaces, punctuation. Before comparing it, **normalise** it into a clean, predictable form.

```php
$lower = strtolower("HeLLo");                       // "hello"
$clean = preg_replace('/[^a-z0-9]/', '', "a-b c!"); // "abc"
```

- `strtolower` converts every letter to lower case.
- `preg_replace` replaces everything that matches a **regular expression**. The pattern `[^a-z0-9]` means "any character that is *not* a lowercase letter or a digit". Adding the `i` flag after the closing slash (`/…/i`) makes it ignore case.

A function with the return type `bool` gives back `true` or `false`. A comparison already *is* a boolean, so you can return it directly:

```php
return $a === $b;
```
