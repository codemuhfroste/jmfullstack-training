# Challenge: the order form

Forms are how a page collects input. Everything a visitor fills in lives inside a `<form>`:

```html
<form>
  <label for="email">Email</label>
  <input type="text" id="email" name="email">

  <label for="size">Size</label>
  <select id="size" name="size">
    <option>Small</option>
    <option>Large</option>
  </select>

  <button type="submit">Send</button>
</form>
```

- `<input>` is a field. Its `type` decides what it accepts: `text`, `number`, `email`, `checkbox` and more.
- `name` is the label the data travels under when the form is sent. Later, PHP reads the value using this name.
- `<label>` says what a field is for. Its `for` attribute must match the field's `id`, which links the two: clicking the label focuses the field.
- `<select>` is a drop-down, with one `<option>` per choice.
- A `<button type="submit">` sends the form.

Number inputs can limit their range with `min` and `max`.

## Task

Build Brewline's order form. Inside a `<form>`, add:

1. A text input with `name="name"`, and a `<label>` linked to it through `for` and `id`.
2. A `<select>` with `name="drink"` and at least **three** options.
3. A number input with `name="qty"` and `min="1"`.
4. A submit button.

## Hints

- Link a label to its field with matching values: `<label for="name">` and `<input id="name" ...>`.
- The quantity field: `<input type="number" name="qty" min="1" value="1">`.
- Each drink is `<option>Latte</option>` inside the `<select>`.

## Starter

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Order | Brewline</title>
  </head>
  <body>
    <h1>Order ahead</h1>

    <!-- Build the form here -->

  </body>
</html>
```

## Solution

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Order | Brewline</title>
  </head>
  <body>
    <h1>Order ahead</h1>

    <form>
      <p>
        <label for="name">Your name</label>
        <input type="text" id="name" name="name">
      </p>
      <p>
        <label for="drink">Drink</label>
        <select id="drink" name="drink">
          <option>Espresso</option>
          <option>Latte</option>
          <option>Cold brew</option>
        </select>
      </p>
      <p>
        <label for="qty">How many?</label>
        <input type="number" id="qty" name="qty" min="1" value="1">
      </p>
      <button type="submit">Place order</button>
    </form>
  </body>
</html>
```
