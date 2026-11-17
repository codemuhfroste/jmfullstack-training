This is PHP's everyday job. When the HTML form you built is submitted, PHP receives its fields in an array called `$_POST`, keyed by each input's `name`.

The rule of the back end is: **never trust what the browser sends**. Anyone can submit anything. So every value is first **sanitized** (cleaned up) and then **validated** (checked against the rules).

```php
$email = strtolower(trim($input['email'] ?? ''));

if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    $errors['email'] = 'Invalid email address';
}
```

- `??` is the null-coalescing operator: use the left side if it exists, otherwise the right. It protects against missing fields.
- `trim` removes spaces from both ends.
- `filter_var` checks a value against a built-in rule and returns `false` if it fails.
- `ctype_digit($text)` is true when a string contains only digits, and `(int) $text` converts it to a number.

Collect the problems in an `$errors` array, keyed by field name. If it is still empty at the end, the input is valid.
