# Page regions

Most pages have the same big regions: a top area, the main content, and a bottom area. HTML has an element for each, named after what it *is*:

```html
<header>
  <h1>Site name</h1>
  <nav>
    <a href="index.html">Home</a>
    <a href="menu.html">Menu</a>
  </nav>
</header>

<main>
  <h2>A section</h2>
  <p>The content this page exists for.</p>
</main>

<footer>
  <p>Open every day</p>
</footer>
```

- `<header>` holds the introduction: usually the name and navigation.
- `<nav>` holds the main links for getting around the site.
- `<main>` holds the content that is unique to this page. Use it once.
- `<footer>` holds closing information such as opening hours or contact details.

These are called **semantic** elements. They look like nothing special on screen, but search engines and screen readers use them to understand the page, and they give CSS something to hook onto later.

## Task

Organise Brewline's front page into regions:

1. A `<header>` that contains the `<h1>` and a `<nav>` with at least **two** links.
2. A `<main>` that contains at least one `<h2>` section.
3. A `<footer>` with a short line of text.

## Hints

- The `<nav>` goes inside the `<header>`, after the `<h1>`.
- The existing `<h2>` and paragraph move inside `<main>`.
- The footer can be as simple as `<footer><p>Open 7am to 3pm</p></footer>`.

## Starter

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Brewline</title>
  </head>
  <body>
    <h1>Brewline</h1>

    <h2>Today's special</h2>
    <p>The caramel latte is half price until noon.</p>

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
    <header>
      <h1>Brewline</h1>
      <nav>
        <a href="index.html">Home</a>
        <a href="menu.html">Menu</a>
      </nav>
    </header>

    <main>
      <h2>Today's special</h2>
      <p>The caramel latte is half price until noon.</p>
    </main>

    <footer>
      <p>Open every day, 7am to 3pm</p>
    </footer>
  </body>
</html>
```
