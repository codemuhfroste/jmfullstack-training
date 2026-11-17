**JSON** is the format the front end and the back end use to exchange data. It looks like JavaScript objects and arrays, written as text.

```php
$data = json_decode('{"name": "Latte", "price": 120}', true);
echo $data['name'];                     // Latte

echo json_encode(['ok' => true]);       // {"ok":true}
```

- `json_decode($text, true)` turns JSON text into PHP arrays. The `true` asks for associative arrays instead of objects.
- If the text is not valid JSON, it returns `null`. Always check before using the result.
- `json_encode` goes the other way.

Summarising a list means walking through it once while keeping running totals:

```php
$counts = [];
foreach ($orders as $order) {
    $status = $order['status'];
    $counts[$status] = ($counts[$status] ?? 0) + 1;
}
```

`continue` skips to the next item of a loop, and `round($value, 2)` rounds to two decimals.
