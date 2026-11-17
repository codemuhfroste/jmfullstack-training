# Links and images

Links are what make the web a web. A link is an `<a>` (anchor) element, and its `href` attribute says where it goes:

```html
<a href="about.html">About us</a>
<a href="https://example.com" target="_blank">A site somewhere else</a>
```

- A file name such as `about.html` points to another page of *your* site.
- A full address starting with `https://` points to another site. Adding `target="_blank"` opens it in a new tab.

Images use `<img>`. It has no closing tag, because there is no content to wrap:

```html
<img src="img/logo.png" alt="The Brewline logo">
```

- `src` is the path to the image file.
- `alt` describes the image in words. Screen readers read it aloud, and it appears if the image can't load. Always write one.

## Task

Brewline has a logo at `img/cup.svg` and a second page, `menu.html`.

1. Add an `<img>` that shows `img/cup.svg`, with an `alt` text that describes it.
2. Add a link with the text **See the menu** that goes to `menu.html`.
3. Add a link to any `https://` address that opens in a new tab.

## Hints

- `<img src="img/cup.svg" alt="A steaming coffee cup">`. There is no `</img>`.
- The page link: `<a href="menu.html">See the menu</a>`.
- For the outside link, the `href` starts with `https://` and the tag also needs `target="_blank"`.

## Starter

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Brewline</title>
  </head>
  <body>
    <h1>Brewline</h1>

    <!-- The logo goes here -->

    <p>Fresh coffee from a tiny cart on wheels.</p>

    <!-- The two links go here -->

  </body>
</html>
```

## Solution

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Brewline</title>
  </head>
  <body>
    <h1>Brewline</h1>

    <img src="img/cup.svg" alt="A steaming coffee cup">

    <p>Fresh coffee from a tiny cart on wheels.</p>

    <p><a href="menu.html">See the menu</a></p>
    <p><a href="https://example.com" target="_blank">Find us on the map</a></p>
  </body>
</html>
```
