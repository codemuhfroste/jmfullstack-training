# Buttons that react

A good button looks clickable and responds when you point at it. CSS handles that with a **pseudo-class**: a keyword added to a selector with a colon, describing a *state*.

```css
.link {
  color: navy;
  transition: color 0.2s;
}

.link:hover {
  color: crimson;
}
```

- `.link:hover` applies only while the mouse pointer is over the element.
- Other useful states are `:focus` (selected with the keyboard) and `:active` (being pressed).
- `transition` on the normal rule makes the change glide instead of snapping. It names the property to animate and how long it takes.

## Task

Style the **Order now** link, which has `class="btn"`, as a button:

1. In `.btn`, set `background-color: #6f4e37`, `color: white`, `padding: 10px 18px` and `border-radius: 8px`.
2. Add a `.btn:hover` rule that changes the `background-color` to `#8b6b4f`.
3. Add a `transition` to `.btn` so the colour change takes `0.2s`.

Hover over the button in the preview to try it.

## Hints

- `padding: 10px 18px` has two values: top/bottom first, then left/right.
- The hover rule is a separate block: `.btn:hover { background-color: #8b6b4f; }`
- The transition goes in the normal `.btn` rule: `transition: background-color 0.2s;`

## Given: index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Brewline</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>Brewline</h1>
    <p>Skip the queue and have your cup waiting.</p>
    <a class="btn" href="order.html">Order now</a>
  </body>
</html>
```

## Starter: style.css

```css
body {
  background-color: #fff8f0;
  font-family: Verdana, sans-serif;
}

.btn {
  display: inline-block;
  text-decoration: none;
}
```

## Solution: style.css

```css
body {
  background-color: #fff8f0;
  font-family: Verdana, sans-serif;
}

.btn {
  display: inline-block;
  text-decoration: none;
  background-color: #6f4e37;
  color: white;
  padding: 10px 18px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.btn:hover {
  background-color: #8b6b4f;
}
```
