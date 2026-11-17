# The box model

To a browser, every element is a rectangular box made of four layers. From the inside out:

1. **Content**: the text or image itself.
2. **Padding**: space between the content and the border.
3. **Border**: a line around the padding.
4. **Margin**: space outside the border, pushing other boxes away.

```css
.note {
  padding: 12px;
  border: 1px solid gray;
  margin-bottom: 20px;
  border-radius: 6px;
}
```

- `border` takes three values at once: width, style (`solid`, `dashed`, `dotted`) and colour.
- `padding` and `margin` with one value apply to all four sides. Add `-top`, `-right`, `-bottom` or `-left` to set a single side.
- `border-radius` rounds the corners.

Padding is *inside* the box, so it shows the element's background. Margin is *outside*, so it is always transparent.

## Task

Each drink on the menu is a `<div class="card">`. Turn them into proper cards. In the `.card` rule:

1. Add `16px` of padding.
2. Add a border that is `2px` wide, `solid`, and `#6f4e37`.
3. Round the corners with a `12px` radius.
4. Separate the cards with a `16px` bottom margin.

## Hints

- All four declarations go inside the existing `.card { … }` rule.
- The border is one line: `border: 2px solid #6f4e37;`
- Space *between* cards is margin, not padding: `margin-bottom: 16px;`

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
    <div class="card">
      <h2>Espresso</h2>
      <p>Short, strong and to the point.</p>
    </div>
    <div class="card">
      <h2>Latte</h2>
      <p>Espresso with plenty of steamed milk.</p>
    </div>
    <div class="card">
      <h2>Cold brew</h2>
      <p>Steeped for 18 hours. Very smooth.</p>
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
}
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
  margin-bottom: 16px;
}
```
