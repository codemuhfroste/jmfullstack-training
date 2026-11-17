# CSS reviewer

CSS controls how HTML looks. A stylesheet is a list of rules; each rule picks elements with a selector and changes them with declarations.

## Rules and selectors

```css
selector {
  property: value;
}
```

- Link a stylesheet in the `<head>`: `<link rel="stylesheet" href="style.css">`.
- Many text properties are **inherited**: set `font-family` on `body` and everything inside uses it.
- When rules disagree, the more specific selector wins: id beats class, class beats element. Between equals, the later rule wins.

| Selector | Matches |
| --- | --- |
| `p` | Every `<p>` element |
| `.price` | Every element with `class="price"` |
| `#special` | The one element with `id="special"` |
| `nav a` | Every `<a>` inside a `<nav>` |
| `.btn:hover` | A `.btn` while the pointer is over it |

| Property | Controls |
| --- | --- |
| `color` | Text colour |
| `background-color` | Colour behind the content |
| `font-family` | Typeface; end the list with `serif` or `sans-serif` |
| `font-size` | Text size, for example `16px` |
| `font-weight` | `normal` or `bold` |
| `line-height` | Space between lines; `1.6` means 1.6 times the font size |
| `text-align` | `left`, `center` or `right` |

Q: When do you use a class, and when an id?
A: A class for anything that can appear more than once. An id only for something that exists exactly once on the page.

Q: Why does `font-family` end with a generic name?
A: If the visitor doesn't have the fonts you listed, the browser falls back to its default of that kind instead of something unrelated.

Q: Two rules set a different colour on the same paragraph: `p` and `.note`. Which wins?
A: `.note`, because a class selector is more specific than an element selector.

## Boxes and layout

Every element is a box with four layers, from the inside out: **content**, **padding**, **border**, **margin**.

```css
.card {
  padding: 16px;                 /* inside the border, shows the background */
  border: 2px solid #6f4e37;     /* width, style, colour */
  border-radius: 12px;           /* rounded corners */
  margin-bottom: 16px;           /* outside the border, always transparent */
}
```

- One value applies to all four sides. Two values mean top/bottom, then left/right.
- **Flexbox** lays out the children of a container in a row. The properties go on the parent.

```css
.menu {
  display: flex;
  gap: 16px;
  justify-content: center;
}
```

| Flex property | Effect |
| --- | --- |
| `display: flex` | Turns the element into a flex container |
| `gap` | Space between the items |
| `justify-content` | Position along the row: `flex-start`, `center`, `flex-end`, `space-between` |
| `align-items` | Position across the row: `stretch`, `center`, `flex-start` |
| `flex: 1` (on an item) | Lets the item grow to share the free space |

- A **pseudo-class** such as `:hover` or `:focus` styles a state. Add `transition` to the normal rule to animate the change.

Q: What is the difference between padding and margin?
A: Padding is space inside the border and shows the element's background. Margin is space outside the border, between this box and its neighbours.

Q: You added `gap: 16px` to `.menu` but nothing changed. What is missing?
A: `display: flex` (or `grid`). `gap` only works on a flex or grid container.

Q: Where does `transition` go: in `.btn` or in `.btn:hover`?
A: In `.btn`, so the animation runs both when the pointer enters and when it leaves.

## Every screen size

- **Grid** arranges items in rows and columns. `1fr` is one share of the free space.
- A **media query** applies rules only when a condition is true. Put it after the normal rules so it overrides them.

```css
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

| Layout | Use it for |
| --- | --- |
| Flexbox | One direction: a row of buttons, a navigation bar |
| Grid | Two directions: a gallery, a whole-page layout |

Q: What does `repeat(3, 1fr)` produce?
A: Three columns of equal width that share the available space.

Q: When do the rules inside `@media (max-width: 600px)` apply?
A: Only when the window is 600 pixels wide or narrower.

Q: What is responsive design?
A: Building a page so its layout adapts to the screen it is shown on, instead of making separate pages for phones and laptops.
