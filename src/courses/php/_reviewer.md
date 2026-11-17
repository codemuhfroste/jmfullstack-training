# PHP reviewer

PHP runs on the server, before the page reaches the browser. It is where a site checks input, applies its rules and talks to the database.

## Hello, server

- A PHP file starts with `<?php`. Every statement ends with a semicolon.
- `echo` outputs text. On a server, that output becomes the response.
- Variables start with `$`. Assigning a value creates the variable.
- Double quotes **interpolate** variables. Single quotes do not.
- Join strings with a dot: `"Total: " . $total`.

```php
<?php
$drink = "Latte";
$total = 120 * 3;
echo "3 x $drink = $total";
```

Q: What does `echo 'Total: $total';` print?
A: The literal text `Total: $total`. Single-quoted strings don't replace variables.

Q: What is the most common cause of a PHP parse error?
A: A missing semicolon at the end of the previous line.

## The basics

- Functions can declare the type of each parameter and of the return value.
- `if` / `elseif` / `else` tries conditions top to bottom; the first true one wins.
- Use `{$name}` inside a string when text follows the variable directly.
- `$list[] = $value;` appends to an array. `%` is the remainder operator.

```php
function gradeLetter(int $score): string
{
    if ($score < 0 || $score > 100) {
        return 'Invalid';
    }
    return match (true) {
        $score >= 90 => 'A',
        $score >= 80 => 'B',
        default      => 'F',
    };
}

for ($i = 1; $i <= 3; $i++) {
    $squares[] = $i * $i;      // [1, 4, 9]
}
```

Q: Why handle invalid input at the top of a function and return early?
A: The rest of the function can then assume the value is sensible, which keeps it simple.

Q: In FizzBuzz, why test for multiples of 15 before 3 and 5?
A: Conditions are tried in order. A multiple of 15 is also a multiple of 3, so the general case would catch it first.

## Strings

| Function | Result |
| --- | --- |
| `strlen($s)` | Number of characters |
| `strtolower($s)` / `strtoupper($s)` | Lower / upper case |
| `trim($s)` | Without spaces at both ends |
| `strrev($s)` | Reversed |
| `explode(" ", $s)` | String to array, split at the separator |
| `implode(" ", $a)` | Array to string, joined with the separator |
| `preg_replace($pattern, $new, $s)` | Replace everything matching a regular expression |

- **Normalise** text before comparing it: same case, unwanted characters removed.
- In a pattern, `[^a-z0-9]` means "anything that is not a lowercase letter or digit", and `+` means "one or more".

Q: How do you reverse each word in a sentence but keep the word order?
A: `explode` the sentence into words, reverse each with `strrev`, then `implode` them again.

Q: A function has the return type `bool`. How can it return a comparison?
A: Directly: `return $a === $b;`. A comparison already produces `true` or `false`.

## Arrays

- A **list** has numeric keys: `[90, 120]`. An **associative array** has named keys: `['name' => 'Latte']`.
- `foreach ($rows as $row)` visits every element. `foreach ($a as $key => $value)` gives both.
- `$groups[$key][] = $item;` creates the inner list if it doesn't exist yet.

```php
$evens   = array_filter($numbers, fn($n) => $n % 2 === 0);
$squares = array_map(fn($n) => $n * $n, $evens);
$list    = array_values($squares);     // renumber the keys from 0
```

| Function | Note |
| --- | --- |
| `array_filter($array, $fn)` | Array first. Keeps the original keys |
| `array_map($fn, $array)` | Function first |
| `array_values($array)` | Renumbers keys from 0 |
| `count($array)` | Number of elements |
| `in_array($value, $array)` | Whether the value is present |

Q: Why call `array_values` after `array_filter`?
A: `array_filter` keeps the original keys, leaving gaps such as 1, 3, 5. `array_values` makes it a clean list again.

Q: What is `fn($n) => $n * 2`?
A: An arrow function: a one-line function that returns the expression after `=>`.

## Functions in depth

- A parameter with a **default value** can be left out by the caller. Put those last.
- **Recursion** is a function calling itself. It needs a base case that stops, and a recursive case that works on a smaller piece.
- `...$array` (spread) unpacks one array into another. `is_array($v)` tests whether a value is an array.

```php
function makeSlug(string $title, string $separator = '-'): string
{
    $slug = strtolower($title);
    $slug = preg_replace('/[^a-z0-9]+/', $separator, $slug);
    return trim($slug, $separator);
}
```

Q: What happens to a recursive function without a base case?
A: It calls itself until PHP runs out of memory or hits the nesting limit, and stops with a fatal error.

Q: `makeSlug("Hello World")` is called with one argument. What is `$separator`?
A: The default, `'-'`.

## Objects

- A **class** bundles data (**properties**) with functions (**methods**). `new` creates an object from it.
- `__construct` runs when the object is created. `$this` is the current object.
- `private` members can only be used inside the class; `public` ones from anywhere.
- Refuse invalid requests by **throwing an exception**. Callers react with `try` / `catch`.

```php
class BankAccount
{
    private float $balance = 0.0;

    public function deposit(float $amount): void
    {
        if ($amount <= 0) {
            throw new InvalidArgumentException('Amount must be positive');
        }
        $this->balance += $amount;
    }
}
```

Q: Why make `$balance` private?
A: So it can only change through methods that check the rules. Nobody can set it to an invalid value from outside.

Q: What does `throw` do to the rest of the method?
A: It stops the method at once. Nothing after it runs.

## Real-world PHP

- Form fields arrive in `$_POST`, keyed by each input's `name`. **Never trust them.**
- **Sanitize** first (clean up), then **validate** (check the rules). Collect problems in an `$errors` array keyed by field.
- `json_decode($text, true)` turns JSON into arrays and returns `null` for invalid JSON. `json_encode` goes the other way.

| Tool | Use |
| --- | --- |
| `$input['x'] ?? ''` | Fallback when a key is missing |
| `trim($s)` | Remove surrounding spaces |
| `filter_var($s, FILTER_VALIDATE_EMAIL)` | `false` if not a valid email |
| `ctype_digit($s)` | True if the string is only digits |
| `(int) $s` | Convert to a whole number |
| `round($n, 2)` | Round to two decimals |
| `htmlspecialchars($s)` | Make text safe to output inside HTML |

Q: What is the difference between sanitizing and validating?
A: Sanitizing cleans a value up, for example trimming spaces. Validating decides whether the cleaned value is acceptable.

Q: Why validate on the server when the form already has `min="1"`?
A: Browser checks are a convenience. Anyone can send a request without your form, so the server must check everything itself.
