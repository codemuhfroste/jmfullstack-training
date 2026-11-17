# Challenge: a responsive grid

Flexbox arranges items in one direction. **CSS Grid** arranges them in rows *and* columns:

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
```

- `display: grid` turns the element into a grid container.
- `grid-template-columns` defines the columns. `1fr` is one share of the free space, so `repeat(2, 1fr)` means two equal columns.

A layout that suits a laptop is usually too cramped for a phone. A **media query** applies rules only when a condition is true:

```css
@media (max-width: 500px) {
  .gallery {
    grid-template-columns: 1fr;
  }
}
```

The rules inside apply only when the window is `500px` wide or narrower. Write media queries *after* the normal rules, so they win.

## Task

Lay out the six menu cards on a grid that adapts to the screen:

1. Make `.menu` a grid with **three** equal columns and a `16px` gap.
2. Add a media query for screens up to `600px` wide that switches `.menu` to a **single** column.

## Hints

- Three equal columns: `grid-template-columns: repeat(3, 1fr);`
- The media query starts with `@media (max-width: 600px) {` and contains its own `.menu { … }` rule.
- Inside the media query you only repeat what changes: `grid-template-columns: 1fr;`

## Given: index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Menu | Brewline</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>Menu</h1>
    <div class="menu">
      <div class="card">Espresso</div>
      <div class="card">Latte</div>
      <div class="card">Mocha</div>
      <div class="card">Cold brew</div>
      <div class="card">Chai</div>
      <div class="card">Croissant</div>
    </div>
  </body>
</html>
```

## Starter: style.css

```css
body {
  background-color: #fff8f0;
  font-family: Verdana, sans-serif;
}

.card {
  background-color: white;
  padding: 16px;
  border: 2px solid #6f4e37;
  border-radius: 12px;
}

/* Your grid goes here */

```

## Solution: style.css

```css
body {
  background-color: #fff8f0;
  font-family: Verdana, sans-serif;
}

.card {
  background-color: white;
  padding: 16px;
  border: 2px solid #6f4e37;
  border-radius: 12px;
}

.menu {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 600px) {
  .menu {
    grid-template-columns: 1fr;
  }
}
```
