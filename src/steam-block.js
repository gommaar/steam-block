class SteamBlock extends HTMLElement {

  static get observedAttributes() {
    return ['type', 'media', 'order', 'overlay'];
  }

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    this.templates = {
      split: document.createElement('template'),
      hero: document.createElement('template'),
    };

    // Re-measure on resize, debounced.
    const debouncedResizeHandler = this.debounce(() => {
      const hostRect = this.getBoundingClientRect();
      const templateType = this.getAttribute('type') || 'split';
      this.setupStyles(null, hostRect, templateType);
    }, 180);
    window.addEventListener('resize', debouncedResizeHandler);

  }

  connectedCallback() {

    // emerge="true" needs steam-emerge.js loaded first, both as classic defer scripts.
    const stageAttribute = this.getAttribute('emerge');
    if (stageAttribute && stageAttribute.toLowerCase() === 'true') {

      if (typeof emerge === 'function') {
        try {
          emerge(this);
        } catch (error) {
          console.error('Error invoking emerge function from steam-emerge module:', error);
        }
      } else {
        console.warn('emerge function from steam-emerge module is not available.');
      }
    }

    this.setup();

    // Measure again after two frames: the first setup() can run mid layout
    // (e.g. a DevTools device switch) and store a wrong scrollbar width.
    requestAnimationFrame(() => requestAnimationFrame(() => this.setup()));
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (SteamBlock.observedAttributes.includes(name) && oldValue !== newValue) {
      this.setup();
    }
  }

  debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  setupTemplates(fluid, flip, overlay) {

    // .content-inner wraps the slot: the layout box for slotted content
    // (-content-display), painted between .content's ::before and ::after.
    // part="...": every box is exposed for ::part() styling. Part names are
    // public API, renaming or moving one is a breaking change.
    this.templates.split.innerHTML = `
      <section class="split${flip ? ' flip' : ''}${fluid ? ' fluid' : ''}" part="section">
        <div class="left" part="left"><div class="content" part="content"><div class="content-inner" part="content-inner"><slot name="content"></slot></div></div></div>
        <div class="right" part="right"><div class="media" part="media"><slot name="media"></slot></div></div>
      </section>
    `;
    this.templates.hero.innerHTML = `
      <section class="hero${fluid ? ' fluid' : ''}${overlay ? ' overlay' : ''}" part="section">
        <div class="background" part="background"><div class="media" part="media"><slot name="media"></slot></div></div>
        <div class="foreground" part="foreground"><div class="content" part="content"><div class="content-inner" part="content-inner"><slot name="content"></slot></div></div></div>
      </section>
    `;
  }

  // Comments stay out of the CSS template strings: text in a string ships
  // to the browser, real comments are stripped by the minifier.
  setupStyles(pfx, hostRect, templateType) {

    if(pfx === null || pfx === undefined){
      pfx = this.getAttribute('prefix') || 'steam-block-';
    }
    this.shadowRoot.querySelectorAll('style').forEach(styleElement => {
      styleElement.remove();
    });

    const style = document.createElement('style');

    // Scrollbar width: 100vw minus the root clientWidth. 100vw is measured
    // with a probe element. window.innerWidth can report a stale width
    // (iOS Safari, DevTools emulation) and visualViewport.width excludes
    // the scrollbar.
    const probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;top:0;left:0;height:0;width:100vw;visibility:hidden;pointer-events:none;';
    document.body.appendChild(probe);
    const viewportWidth = probe.getBoundingClientRect().width;
    probe.remove();
    const sbw = Math.max(0, viewportWidth - document.documentElement.clientWidth);
    let mwbp = getComputedStyle(this).getPropertyValue('--' + pfx + 'min-width-breakpoint') || '768px';

    // data-size="auto" on the slotted media keeps its intrinsic size.
    let auto = this.querySelector('[data-size]')?.getAttribute('data-size') === 'auto';

    let templateStyles = '';

    switch (templateType) {
        case 'hero': {
            const parts = [];
            // Background layer: the media, in normal flow.
            // --_media-width: the fluid width, capped by -hero-media-max-width,
            // never wider than the viewport.
            parts.push(`
              .hero{position:relative;}
              .hero.fluid{
                --_content-width: calc(100vw - var(--${pfx}scrollbar-width, 0px));
                --_media-width: min(var(--${pfx}hero-media-max-width, var(--_content-width)), var(--_content-width));
                left: calc((var(--_content-width) - var(--_media-width)) / 2 - ${hostRect.left}px);
                width: var(--_media-width);
              }
              .background{position:relative;}
              .fluid .background{
                background: var(--${pfx}background);
                border-radius: var(--${pfx}border-radius);
                box-shadow: var(--${pfx}box-shadow);
              }
            `);
            parts.push(`
              .media{aspect-ratio: var(--${pfx}media-aspect-ratio, 16 / 9);
                @media(min-width:${mwbp}){
                  margin: var(--${pfx}media-margin, 0px);
                }
              }
              .media slot{position:absolute;top:0;right:0;bottom:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;
                align-items: var(--${pfx}media-align-items, center);
                justify-content: var(--${pfx}media-justify-content, center);
              }
            `);
            // -media-margin: desktop only. .hero clips it unless media="fluid".
            // Foreground layer: the content. Stacks under the media below the
            // breakpoint, overlays it above, or at every width with overlay="true".
            // No z-index: it would create a stacking context and keep the content
            // layers from blending with the photo.
            // pointer-events:none lets clicks outside the text reach the media
            // (e.g. video controls). .content-inner turns them back on.
            parts.push(`
              .foreground{position:static;display:flex;flex-direction:column;align-items:var(--${pfx}hero-align-items, center);justify-content: var(--${pfx}content-justify-content, center);margin:0 auto;width:100%;pointer-events:none;
                @media(min-width:${mwbp}){
                  position:absolute;top:0;right:0;bottom:0;left:0;width:100%;height:100%;
                }
              }
              .overlay .foreground{position:absolute;top:0;right:0;bottom:0;left:0;height:100%;
              }
            `);
            // Stacked without overlay: stretch the content to the media's width.
            // -hero-align-items only applies to the overlay.
            parts.push(`
              @media(max-width: calc(${mwbp} - 1px)){
                .hero:not(.overlay) .foreground{align-items: stretch;}
              }
            `);
            // Content padding applies at every width. Margin and width apply above
            // the breakpoint only.
            // -hero-content-width: .content sizes to its text, so a fixed width is
            // the way to keep a card style box steady and still use -hero-align-items.
            parts.push(`
              .content{padding: var(--${pfx}content-padding, 5vw);
                text-align: var(--${pfx}content-text-align, center);
                @media(min-width:${mwbp}){
                  margin: var(--${pfx}content-margin, 0px);
                  width: var(--${pfx}hero-content-width, auto);
                  max-width: var(--${pfx}hero-content-max-width, 99%);
                }
              }
            `);
            // overlay + fluid below the breakpoint: drop the aspect ratio so the
            // media grows with the content instead of the content overflowing it.
            parts.push(`
              @media(max-width: calc(${mwbp} - 1px)){
                .overlay.fluid .background{position:absolute;top:0;right:0;bottom:0;left:0;}
                .overlay.fluid .media{aspect-ratio:auto;}
                .overlay.fluid .foreground{position:relative;height:auto;}
                .overlay.fluid .content{height:auto;}
              }
            `);
            templateStyles = parts.join('');
            break;
        }
        case 'split':
        default: {
            const parts = [];
            // Layout: a grid with .left (content) and .right (media). One column
            // below the breakpoint, two above. order="flip" only reorders them.
            // The transition variables also apply to .left and .right.
            // Min widths fall back to 0 so extreme ratios (90% / 10%) still work.
            parts.push(`
              .split{display:grid;grid-template-columns:100%;margin-block:0;
                @media(min-width:${mwbp}){
                  gap: var(--${pfx}gap, 5vw);
                  grid-template-columns:
                    minmax(
                      var(--${pfx}content-min-width, 0),
                      var(--${pfx}content-width, 1fr)
                    )
                    minmax(
                      var(--${pfx}media-min-width, 0),
                      var(--${pfx}media-width, 1fr)
                    )
                  ;
                }
              }
              .split.flip{
                @media(min-width:${mwbp}){
                  grid-template-columns:
                    minmax(
                      var(--${pfx}media-min-width, 0),
                      var(--${pfx}media-width, 1fr)
                    )
                    minmax(
                      var(--${pfx}content-min-width, 0),
                      var(--${pfx}content-width, 1fr)
                    )
                  ;
                }
              }
              .left,.right{position:relative;z-index:1;display:flex;flex-direction:column;height:100%;text-align: var(--${pfx}content-text-align, left);}
              .left{z-index:2;align-items:flex-start;justify-content:var(--${pfx}content-justify-content, center);
                transition: var(--${pfx}content-transition, none);
                @media(min-width:${mwbp}){
                  margin: var(--${pfx}content-margin, 0px);
                }
              }
            `);
            // .content fills its column, so an auto-fit
            // -content-grid-template-columns has a definite width to work with.
            parts.push(`.content{width:100%;}`);
            // -media-align-items positions .media in its column when data-size="auto"
            // shrinks it. Same variable as in hero, different box.
            // -media-aspect-ratio has no fallback in split and only holds while the
            // media column is the taller one: the grid row grows with the content.
            // -media-margin: desktop only, not clipped in split.
            parts.push(`
              .right{align-items:var(--${pfx}media-align-items, flex-start);justify-content: var(--${pfx}media-justify-content, center);
                transition: var(--${pfx}media-transition, none);
              }
              .media{aspect-ratio: var(--${pfx}media-aspect-ratio);
                @media(min-width:${mwbp}){
                  margin: var(--${pfx}media-margin, 0px);
                }
              }
              .flip .left{
                @media(min-width:${mwbp}){
                  order:2;
                }
              }
            `);
            // Desktop: content padding defaults to 0.
            parts.push(`
              @media(min-width:${mwbp}){
                .flip .right{order:1;}
                .content{padding: var(--${pfx}content-padding, 0px);}
              }
            `);
            // Stacked: spacing is content padding, not a grid gap, so a background
            // runs through media and content without a strip in between.
            parts.push(`
              @media(max-width: calc(${mwbp} - 1px)){
                .right{order:1;}
                .left{order:2;}
                .content{padding: var(--${pfx}content-padding, 5vw);}
              }
              .fluid:not(.flip) .right {
                margin-right: calc(${hostRect.right}px - 100vw + var(--${pfx}scrollbar-width, 0px));
                margin-left: 0;
              }
              .fluid.flip .right {margin-right:0;
                margin-left: calc(${hostRect.left}px * -1);
              }
            `);
            // Stacked: the fluid media row bleeds to both viewport edges.
            parts.push(`
              @media(max-width: calc(${mwbp} - 1px)){
                .fluid:not(.flip) .right,
                .fluid.flip .right{
                  margin-left: calc(${hostRect.left}px * -1);
                  margin-right: calc(${hostRect.right}px - 100vw + var(--${pfx}scrollbar-width, 0px));
                }
              }
            `);
            templateStyles = parts.join('');
        }
    }

    // Shared rules first, then the template's own rules.
    const parts = [];
    parts.push(`
        :host{--${pfx}scrollbar-width:${sbw}px;display:block;}
        :where(audio,canvas,iframe,img,svg,video){vertical-align:middle;}
        .hero:not(.fluid),
        .split{
          padding: var(--${pfx}padding, 0px);
          background: var(--${pfx}background);
          border: var(--${pfx}border, 0px solid transparent);
          border-radius: var(--${pfx}border-radius);
          box-shadow: var(--${pfx}box-shadow);
        }
    `);
    // -max-width caps and centers the section. Not with media="fluid": the
    // breakout is measured from the full width host.
    parts.push(`
        .hero:not(.fluid),
        .split:not(.fluid){
          max-width: var(--${pfx}max-width, none);
          margin-inline: auto;
        }
    `);
    // Per side borders fall back to the -border shorthand. Without a
    // fallback an unset var() would reset that side on every instance.
    parts.push(`
        .hero:not(.fluid),
        .split{
          border-top: var(--${pfx}border-top, var(--${pfx}border, 0px solid transparent));
          border-right: var(--${pfx}border-right, var(--${pfx}border, 0px solid transparent));
          border-bottom: var(--${pfx}border-bottom, var(--${pfx}border, 0px solid transparent));
          border-left: var(--${pfx}border-left, var(--${pfx}border, 0px solid transparent));
        }
    `);
    // .hero clips its children to its rounded corners. .split doesn't: its
    // fluid breakout bleeds .right past the section.
    parts.push(`
        .hero{
          overflow: hidden;
        }
    `);
    // Media: blend mode, opacity and filter go on ::slotted(*). A <slot>
    // doesn't paint, so they would have no effect on it.
    parts.push(`
        .media ::slotted(*) {display:block;
          width: ${auto ? 'auto' : '100% !important'};
          height: ${auto ? 'auto' : '100% !important'};object-fit:cover;
          object-position: var(--${pfx}media-object-position, center);
          mix-blend-mode: var(--${pfx}media-blend-mode, normal);
          opacity: var(--${pfx}media-opacity, 1);
          filter: var(--${pfx}media-filter, none);
        }
    `);
    // isolation:isolate so blend modes and the ::before z-index resolve
    // against .media, not an ancestor that happens to form a stacking context.
    // Transitions animate the real properties the variables feed.
    // Transform on .media only: also on .right it would compound.
    parts.push(`
        .media{position:relative;overflow:hidden;box-sizing:border-box;isolation:isolate;
          width: ${auto ? 'auto' : '100%'};
          height: ${auto ? 'auto' : '100%'};
          border: var(--${pfx}media-border, 0px solid transparent);
          border-top: var(--${pfx}media-border-top, var(--${pfx}media-border, 0px solid transparent));
          border-right: var(--${pfx}media-border-right, var(--${pfx}media-border, 0px solid transparent));
          border-bottom: var(--${pfx}media-border-bottom, var(--${pfx}media-border, 0px solid transparent));
          border-left: var(--${pfx}media-border-left, var(--${pfx}media-border, 0px solid transparent));
          border-radius: var(--${pfx}media-border-radius, 0px);
          box-shadow: var(--${pfx}media-box-shadow);
          clip-path: margin-box var(--${pfx}media-clip-path);
          mask: var(--${pfx}media-mask, none);
          transform: var(--${pfx}media-transform, none);
          transition: var(--${pfx}media-transition, none);
        }
    `);
    // Media ::before: a backdrop, visible through transparent media. No blend
    // mode, there is nothing behind it inside .media. Use -media-blend-mode.
    parts.push(`
        .media::before{content:"";position:absolute;top:0;right:0;bottom:0;left:0;z-index:-1;
          background: var(--${pfx}media-before-background, transparent);
          border-radius: inherit;
          clip-path: margin-box var(--${pfx}media-before-clip-path);
          mask: var(--${pfx}media-before-mask, none);
          opacity: var(--${pfx}media-before-opacity, 1);
        }
    `);
    // Content box. border-box keeps -content-padding inside the width. Not
    // isolated, so ::before and ::after can blend with the hero photo.
    parts.push(`
        .content {
          position:relative;
          box-sizing:border-box;
          background: var(--${pfx}content-background, transparent);
          border: var(--${pfx}content-border, 0px solid transparent);
          border-top: var(--${pfx}content-border-top, var(--${pfx}content-border, 0px solid transparent));
          border-right: var(--${pfx}content-border-right, var(--${pfx}content-border, 0px solid transparent));
          border-bottom: var(--${pfx}content-border-bottom, var(--${pfx}content-border, 0px solid transparent));
          border-left: var(--${pfx}content-border-left, var(--${pfx}content-border, 0px solid transparent));
          border-radius: var(--${pfx}content-border-radius, 0px);
          box-shadow: var(--${pfx}content-box-shadow);
          clip-path: margin-box var(--${pfx}content-clip-path);
          mask: var(--${pfx}content-mask, none);
          transform: var(--${pfx}content-transform, none);
          transition: var(--${pfx}content-transition, none);
        }
    `);
    // .content-inner wraps the slot. Not isolated, so -content-blend-mode
    // blends the text with everything behind it. position:relative paints
    // it between ::before and ::after.
    parts.push(`
        .content-inner{position:relative;box-sizing:border-box;width:100%;height:100%;pointer-events:auto;
    `);
    // -content-display grid or flex lays out several slot="content" elements
    // without a wrapper: the slot is transparent, so they become items of
    // .content-inner.
    parts.push(`
          display: var(--${pfx}content-display, block);
          grid-template-columns: var(--${pfx}content-grid-template-columns, none);
          gap: var(--${pfx}content-gap, normal);
        }
        .content ::slotted(*){
          mix-blend-mode: var(--${pfx}content-blend-mode, normal);
          opacity: var(--${pfx}content-opacity, 1);
          filter: var(--${pfx}content-filter, none);
        }
    `);
    // Content ::after: same box as -content-background, painted last, so no
    // z-index. Rounds its own corners since .content doesn't clip.
    // pointer-events:none keeps buttons and links clickable.
    parts.push(`
        .content::after{content:"";position:absolute;top:0;right:0;bottom:0;left:0;pointer-events:none;
          mix-blend-mode: var(--${pfx}content-after-blend-mode, normal);
          background: var(--${pfx}content-after-background, transparent);
          border-radius: inherit;
          clip-path: margin-box var(--${pfx}content-after-clip-path);
          mask: var(--${pfx}content-after-mask, none);
          opacity: var(--${pfx}content-after-opacity, 1);
        }
    `);
    // Content ::before: same box as -content-background, painted before
    // .content-inner. No z-index: a negative one would drop it behind the photo.
    parts.push(`
        .content::before{content:"";position:absolute;top:0;right:0;bottom:0;left:0;
          background: var(--${pfx}content-before-background, transparent);
          border-radius: inherit;
          clip-path: margin-box var(--${pfx}content-before-clip-path);
          mask: var(--${pfx}content-before-mask, none);
          mix-blend-mode: var(--${pfx}content-before-blend-mode, normal);
          opacity: var(--${pfx}content-before-opacity, 1);
        }
    `);
    // Media ::after: overlay on top of the media, the only layer with
    // border-image. pointer-events:none keeps video controls clickable.
    parts.push(`
        .media::after{content:"";position:absolute;top:0;right:0;bottom:0;left:0;z-index:2;box-sizing:border-box;pointer-events:none;
          mix-blend-mode: var(--${pfx}media-after-blend-mode, normal);
          background: var(--${pfx}media-after-background, transparent);
          border-image: var(--${pfx}media-after-border-image, none);
          border-radius: inherit;
          clip-path: margin-box var(--${pfx}media-after-clip-path);
          mask: var(--${pfx}media-after-mask, none);
          opacity: var(--${pfx}media-after-opacity, 1);
        }
    `);
    parts.push(templateStyles);
    const combinedStyles = parts.join('');

    style.textContent = combinedStyles;

    this.shadowRoot.appendChild(style);
  }

  setup() {

    const pfx = this.getAttribute('prefix') || 'steam-block-';

    // The host's own position drives the fluid breakout.
    let hostRect = this.getBoundingClientRect();

    // Unknown type falls back to split.
    let templateValue = this.getAttribute('type');
    if (!this.templates[templateValue]) templateValue = 'split';

    let fluid = this.getAttribute('media') === "fluid";

    let flip = this.getAttribute('order') === "flip";

    // overlay="true": hero content stays overlaid at every width.
    let overlay = this.getAttribute('overlay') === "true";

    this.setupTemplates(fluid, flip, overlay);

    this.shadowRoot.innerHTML = '';

    this.shadowRoot.appendChild(this.templates[templateValue].content.cloneNode(true));

    this.setupStyles(pfx, hostRect, templateValue);

    // Run setup() again once late loading media has its real size.
    const mediaEl = this.querySelector('[slot="media"]');
    if (mediaEl) {
      if (mediaEl.tagName === 'IMG' && !mediaEl.complete) {
        mediaEl.addEventListener('load', () => this.setup(), { once: true });
      } else if (mediaEl.tagName === 'VIDEO' && mediaEl.readyState < 1) {
        mediaEl.addEventListener('loadedmetadata', () => this.setup(), { once: true });
      }
    }

  }
}

customElements.define('steam-block', SteamBlock);
