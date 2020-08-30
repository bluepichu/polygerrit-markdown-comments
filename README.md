# Polygerrit Markdown Comments

I love using Gerrit for code review, but its lack of rich comment formatting is silly.  It doesn't even have a way to do inline code for crying out loud!

This Polygerrit plugin patches the comment renderer to use Markdown syntax instead.

## Installation

Simply copy `dist/polygerrit-markdown-comments.js` into your Gerrit site's `plugins` directory.  It will automatically load in the frontend.

(At some point I'll look into publishing this platform such that it can be installed via the plugin manager, but first I'll need to figure out how one actually does that...)

## Notes and Caveats

- This plugin uses [`marked`](https://github.com/markedjs/marked) for Markdown rendering so anything it supports by default is supported here.  (This means that this plugin uses GFM, so you can have tables and checkboxes and the like.)

- You can specify the language used by a code block by using the standard language specifier after the code block fence.  Highlighted code blocks use the same color theme as the rest of your Gerrit site, be it the default light theme, the dark theme, or a custom theme, so long as the theme properly sets Gerrit's standard CSS variables.

- Since it changes how comments are rendered, this will make existing comments on a Gerrit installation appear malformatted.  However, it's only client-side; they're still stored fine in the backend.

- Custom HTML in comments **is allowed**.  In order to not introduce trivial XSS vulnerabilities, the markdown output is run through [`DOMPurify`](https://github.com/cure53/DOMPurify), though I've loosened its default restrictions to allow for `iframe`s because I wanted to be able to embed things.  (As far as I can tell there's no way to provide configuration options to Polygerrit plugins; if it turns out that _is_ possible, I'd absolutely make this a configurable option.)

- This plugin is something of a poor ecosystem citizen in that it monkey-patches one of Polygerrit's web components in order to work.  This is necessary because Polygerrit's plugin system does not currently provide the necessary hook to change how comments are rendered, but naturally makes the plugin more fragile as it might not play nicely with other plugins and might break spontaneously with a future Gerrit update.

