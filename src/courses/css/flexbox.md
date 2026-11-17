# Side by side with flexbox

By default, boxes such as `<div>` stack on top of each other. **Flexbox** lays them out in a row instead. You switch it on for the *parent*, and its children line up:

```css
.toolbar {
  display: flex;
  gap: 8px;
  justify-content: center;
}
```

- `display: flex` turns the element into a flex container. Its direct children become flex items in a row.
- `gap` is the space between the items.
- `justify-content` positions the items along the row: `flex-start`, `center`, `flex-end`, `space-between`.

Items are only as wide as their content. To make them share the space equally, give each *item* `flex: 1`.

## Task

The three cards now sit inside `<div class="menu">`. Put them in a row:

1. Make `.menu` a flex container.
2. Put a `16px` gap between the cards.
3. Centre the cards with `justify-content`.

When it works, the cards appear next to each other in the preview.

## Hints

- The flex properties go on the **parent**, `.menu`, not on `.card`.
- Start with `display: flex;`. Nothing else has an effect until that is there.
- The row is centred with `justify-content: center;`

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
      <div class="card">
        <h2>Espresso</h2>
        <p>Short and strong.</p>
      </div>
      <div class="card">
        <h2>Latte</h2>
        <p>Lots of milk.</p>
      </div>
      <div class="card">
        <h2>Cold brew</h2>
        <p>Very smooth.</p>
      </div>
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

.menu {

}

.card {
  background-color: white;
  padding: 16px;
  border: 2px solid #6f4e37;
  border-radius: 12px;
}
```

## Solution: style.css

```css
body {
  background-color: #fff8f0;
  font-family: Verdana, sans-serif;
}

.menu {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.card {
  background-color: white;
  padding: 16px;
  border: 2px solid #6f4e37;
  border-radius: 12px;
}
```
