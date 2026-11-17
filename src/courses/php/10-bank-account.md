A **class** bundles data together with the functions that work on it. From a class you create **objects** with `new`:

```php
class Counter
{
    private int $count = 0;

    public function __construct(int $start = 0)
    {
        $this->count = $start;
    }

    public function increment(): void
    {
        $this->count++;
    }

    public function getCount(): int
    {
        return $this->count;
    }
}

$counter = new Counter(5);
$counter->increment();
echo $counter->getCount();   // 6
```

- Data lives in **properties**. `private` means only code inside the class can touch them.
- Functions in a class are **methods**. Inside one, `$this` is the current object.
- `__construct` runs automatically when the object is created.

When a method is asked to do something invalid, it should refuse loudly by **throwing an exception**:

```php
throw new InvalidArgumentException('Start must not be negative');
```

That stops the method at once. The caller can catch the exception and react to it.
