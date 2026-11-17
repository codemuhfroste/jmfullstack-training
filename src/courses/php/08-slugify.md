A parameter can have a **default value**. Callers may then leave it out:

```php
function greet(string $name, string $greeting = "Hello"): string
{
    return "$greeting, $name!";
}

greet("Ana");            // Hello, Ana!
greet("Ana", "Welcome"); // Welcome, Ana!
```

Parameters with defaults go last.

Longer transformations read best as a series of small steps, each one reassigning the same variable:

```php
$text = strtolower($text);
$text = preg_replace('/\s+/', ' ', $text);   // + means "one or more in a row"
$text = trim($text);
```

Useful tools here: `trim($text, $chars)` removes the given characters from both ends (`rtrim` from the right only), and `substr($text, 0, $n)` keeps the first `$n` characters.
