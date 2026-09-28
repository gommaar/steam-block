# Changelog

Versions follow [semver](https://semver.org): a patch for a fix, a minor for a backwards-compatible addition, a major for anything that changes existing attribute or CSS-variable behavior.

---

## 1.1.1 (2026-09-28)

Package release. The component code is unchanged, so both files are byte for byte identical to 1.1.0 and keep the same SRI hashes.

- Source now public on GitHub: https://github.com/gommaar/steam-block. The npm Repository and Issues links point there.
- Shorter README with an attribute table and links to the Visual reference, Quickstart and Changelog.
- Concise source comments.

__steam-block.js__

```html
<script src="https://cdn.jsdelivr.net/npm/steam-block@1.1.1/dist/steam-block.js" integrity="sha384-iQB69ION+fOI85hIazKAsDqsORX4sV3IemwxcTiqslH/JsGXlJly9as9oMh12ob8" crossorigin="anonymous" defer></script>
```

__steam-emerge.js__

```html
<script src="https://cdn.jsdelivr.net/npm/steam-block@1.1.1/dist/steam-emerge.js" integrity="sha384-PUXKVdqPLk7akL4rVn2ozcfToQqu5RLDUZ7Xamn074ilP5U/fIwla1lVOJkihDv+" crossorigin="anonymous" defer></script>
```

__SRI__

- steam-block.js  <br>sha384-iQB69ION+fOI85hIazKAsDqsORX4sV3IemwxcTiqslH/JsGXlJly9as9oMh12ob8
- steam-emerge.js <br>sha384-PUXKVdqPLk7akL4rVn2ozcfToQqu5RLDUZ7Xamn074ilP5U/fIwla1lVOJkihDv+

---

## 1.1.0 (2026-09-25)

- Added `--steam-block-hero-content-width`, default `auto`. Sets the width of the hero content overlay at and above the breakpoint.
- Why: `--steam-block-hero-content-max-width` only caps the overlay. The overlay sizes to its own content, so short content never reaches the cap and a content box with a background changed width with its text. The only way to force a width was `--steam-block-hero-align-items: stretch`, which also dropped the left, center or right positioning. Use the new variable for a fixed box, and keep `-hero-content-max-width` as its upper limit, for example `width: 45%` with `max-width: 40rem`.
- Existing layouts are unaffected: with the `auto` default the overlay sizes exactly as in 1.0.x.
- Removed `--steam-block-media-before-blend-mode`. It never had a visible effect: the media before layer is the bottom layer inside the isolated media box, so there was nothing behind it to blend with. To blend the media with the before layer, use `--steam-block-media-blend-mode`.
- Removed `--steam-block-align-items`. It never had a visible effect: both split columns always fill the full row height, so there was no space to align in. To place the content vertically, use `--steam-block-content-justify-content`.
- Fixed `--steam-block-content-blend-mode`, which had no visible effect: the slotted content sat in an isolated wrapper with nothing behind it to blend with. It now blends with the content background, the content before layer and, in a hero, the photo behind it.
- Added parts: every box inside the component is exposed for `::part()` styling (`section`, `media`, `content`, `content-inner`, `left`, `right`, `background`, `foreground`), including their before and after layers. Optional and additive: without a `::part()` rule nothing changes, and all CSS variables keep working. See the new [Parts](https://steam-block.stimulies.be/documentation/parts) page.
- Fixed `--steam-block-hero-media-max-width` on small screens: a cap wider than the viewport made the fluid hero wider than the screen, so the page scrolled sideways. The media is now never wider than the viewport.
- The npm README now includes the optional steam-emerge import in its install snippet.

__steam-block.js__

```html
<script src="https://cdn.jsdelivr.net/npm/steam-block@1.1.0/dist/steam-block.js" integrity="sha384-iQB69ION+fOI85hIazKAsDqsORX4sV3IemwxcTiqslH/JsGXlJly9as9oMh12ob8" crossorigin="anonymous" defer></script>
```

__steam-emerge.js__

```html
<script src="https://cdn.jsdelivr.net/npm/steam-block@1.1.0/dist/steam-emerge.js" integrity="sha384-PUXKVdqPLk7akL4rVn2ozcfToQqu5RLDUZ7Xamn074ilP5U/fIwla1lVOJkihDv+" crossorigin="anonymous" defer></script>
```

__SRI__

- steam-block.js  <br>sha384-iQB69ION+fOI85hIazKAsDqsORX4sV3IemwxcTiqslH/JsGXlJly9as9oMh12ob8
- steam-emerge.js <br>sha384-PUXKVdqPLk7akL4rVn2ozcfToQqu5RLDUZ7Xamn074ilP5U/fIwla1lVOJkihDv+ (unchanged)

---

## 1.0.1 (2026-09-23)

Documentation release. The component code is unchanged, so both files are byte for byte identical to 1.0.0 and keep the same SRI hashes.

- Updated npm README with npm and CDN install instructions.

__steam-block.js__

```html
<script src="https://cdn.jsdelivr.net/npm/steam-block@1.0.1/dist/steam-block.js" integrity="sha384-YwIY+hiJmmY++WoHN6pIgs5jecZz/0XMHA98EA3oRhtVUIVCW1+OaNNKsMhV2PaE" crossorigin="anonymous" defer></script>
```

__steam-emerge.js__

```html
<script src="https://cdn.jsdelivr.net/npm/steam-block@1.0.1/dist/steam-emerge.js" integrity="sha384-PUXKVdqPLk7akL4rVn2ozcfToQqu5RLDUZ7Xamn074ilP5U/fIwla1lVOJkihDv+" crossorigin="anonymous" defer></script>
```


__SRI__

- steam-block.js  <br>sha384-YwIY+hiJmmY++WoHN6pIgs5jecZz/0XMHA98EA3oRhtVUIVCW1+OaNNKsMhV2PaE
- steam-emerge.js <br>sha384-PUXKVdqPLk7akL4rVn2ozcfToQqu5RLDUZ7Xamn074ilP5U/fIwla1lVOJkihDv+

---

## 1.0.0 (2026-09-14)

Initial release.

- Two layout templates, `split` and `hero`, styled entirely through CSS custom properties, no build step, no dependencies.
- Optional `steam-emerge` scroll-reveal module, loaded separately so it's only paid for if used.
- Full CSS-variable reference and live examples in the [Documentation](../documentation) and [Examples](../examples) sections.

__steam-block.js__

```html
<script src="https://cdn.jsdelivr.net/npm/steam-block@1.0.0/dist/steam-block.js" integrity="sha384-YwIY+hiJmmY++WoHN6pIgs5jecZz/0XMHA98EA3oRhtVUIVCW1+OaNNKsMhV2PaE" crossorigin="anonymous" defer></script>
```

__steam-emerge.js__

```html
<script src="https://cdn.jsdelivr.net/npm/steam-block@1.0.0/dist/steam-emerge.js" integrity="sha384-PUXKVdqPLk7akL4rVn2ozcfToQqu5RLDUZ7Xamn074ilP5U/fIwla1lVOJkihDv+" crossorigin="anonymous" defer></script>
```

__SRI__

- steam-block.js  <br>sha384-YwIY+hiJmmY++WoHN6pIgs5jecZz/0XMHA98EA3oRhtVUIVCW1+OaNNKsMhV2PaE
- steam-emerge.js <br>sha384-PUXKVdqPLk7akL4rVn2ozcfToQqu5RLDUZ7Xamn074ilP5U/fIwla1lVOJkihDv+
