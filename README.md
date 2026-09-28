# steam-block

[![npm version](https://img.shields.io/npm/v/steam-block.svg)](https://www.npmjs.com/package/steam-block)

A dependency free web component for hero and split sections, styled with CSS custom properties. No build step, no framework.

![One steam-block element switching between hero, split and flipped split layouts](https://raw.githubusercontent.com/gommaar/steam-block/main/media/steam-block-demo.gif)

**[Docs and live examples](https://steam-block.stimulies.be/)** · [Visual reference](https://steam-block.stimulies.be/documentation/visual-reference/) · [Changelog](https://steam-block.stimulies.be/changelog/)

## Install

From a CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/steam-block@1.1.1/dist/steam-block.js" integrity="sha384-iQB69ION+fOI85hIazKAsDqsORX4sV3IemwxcTiqslH/JsGXlJly9as9oMh12ob8" crossorigin="anonymous" defer></script>
```

With the optional scroll reveal helper, loaded first:

```html
<script src="https://cdn.jsdelivr.net/npm/steam-block@1.1.1/dist/steam-emerge.js" integrity="sha384-PUXKVdqPLk7akL4rVn2ozcfToQqu5RLDUZ7Xamn074ilP5U/fIwla1lVOJkihDv+" crossorigin="anonymous" defer></script>
<script src="https://cdn.jsdelivr.net/npm/steam-block@1.1.1/dist/steam-block.js" integrity="sha384-iQB69ION+fOI85hIazKAsDqsORX4sV3IemwxcTiqslH/JsGXlJly9as9oMh12ob8" crossorigin="anonymous" defer></script>
```

Or from npm:

```bash
npm install steam-block
```

```js
import 'steam-block/dist/steam-emerge.js' // optional, first
import 'steam-block/dist/steam-block.js'
```

## Usage

```html
<steam-block type="split" media="fluid" order="flip">
  <div slot="content">
    <h1>Welcome to Steam Block</h1>
    <p>Flexible layouts made simple.</p>
  </div>
  <img slot="media" src="your-image.jpg" alt="">
</steam-block>
```

| Attribute | Values | |
|---|---|---|
| `type` | `split` (default), `hero` | side by side, or content over media |
| `media` | `fluid` | media bleeds to the viewport edge |
| `order` | `flip` | media on the other side |
| `overlay` | `true` | hero: keep content overlaid on mobile |
| `prefix` | e.g. `hero-` | own CSS variable prefix per instance |
| `emerge` | `true` | scroll reveal, needs `steam-emerge.js` |

Styling:

```css
steam-block {
  --steam-block-gap: 3rem;
  --steam-block-media-border-radius: 1rem;
}
steam-block::part(content) { backdrop-filter: blur(8px); }
```

## Docs

[Quickstart](https://steam-block.stimulies.be/quickstart/) ·
[Installation](https://steam-block.stimulies.be/documentation/installation/) ·
[Usage](https://steam-block.stimulies.be/documentation/usage/) ·
[Slots](https://steam-block.stimulies.be/documentation/slots/) ·
[Attributes](https://steam-block.stimulies.be/documentation/attributes/) ·
[CSS variables](https://steam-block.stimulies.be/documentation/css-variables/) ·
[Visual reference](https://steam-block.stimulies.be/documentation/visual-reference/) ·
[Parts](https://steam-block.stimulies.be/documentation/parts/) ·
[Helpers](https://steam-block.stimulies.be/documentation/helpers/) ·
[Examples](https://steam-block.stimulies.be/examples/)

## License

MIT, see [LICENSE](LICENSE).
