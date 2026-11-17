# Classes and ids

A selector like `p` styles *every* paragraph. To style only some elements, give them a name in the HTML and select that name in the CSS.

```html
<p class="note">Cash only today.</p>
<p id="closing">We close at 3pm.</p>
```

```css
.note {
  color: gray;
}

#closing {
  font-weight: bold;
}
```

- A **class** can be used on as many elements as you like. Select it with a dot: `.note`.
- An **id** names one unique element on the page. Select it with a hash: `#closing`.

Classes are the everyday tool. Reach for an id only when something really exists once.

Open the `index.html` tab: every price is wrapped in `<span class="price">`, and one paragraph has `id="special"`.

## Task

1. Make every `.price` the colour `#b3541e` and **bold** (`font-weight: bold`).
2. Highlight the `#special` paragraph with `background-color: #ffe8b0` and `padding: 8px`.

## Hints

- A class selector starts with a dot, an id selector with a hash: `.price { … }` and `#special { … }`.
- You don't need to edit the HTML. The class and id are already there.
- `padding` adds space between the text and the edge of its coloured box.

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
    <p id="special">Today only: every latte comes with a free cookie.</p>
    <ul>
      <li>Espresso <span class="price">90</span></li>
      <li>Latte <span class="price">120</span></li>
      <li>Cold brew <span class="price">110</span></li>
    </ul>
  </body>
</html>
```

## Starter: style.css

```css
body {
  background-color: #fff8f0;
  font-family: Verdana, sans-serif;
}

h1 {
  color: #6f4e37;
}
```

## Solution: style.css

```css
body {
  background-color: #fff8f0;
  font-family: Verdana, sans-serif;
}

h1 {
  color: #6f4e37;
}

.price {
  color: #b3541e;
  font-weight: bold;
}

#special {
  background-color: #ffe8b0;
  padding: 8px;
}
```
