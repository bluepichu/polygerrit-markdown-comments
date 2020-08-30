import marked from "marked";
import { sanitize } from "dompurify";

// The instance of highlight.js that polygerrit loads on its own has a tendency
// to not load until after the plugin loads and the page content renders.  While
// not particularly elegant, this function lets us wait on highlight.js so that
// we can asynchronously highlight code blocks in comments after they load.
async function getHljs(): Promise<typeof window.hljs> {
	if ("hljs" in window) {
		return window.hljs;
	} else {
		await new Promise((resolve) => setTimeout(resolve, 100));
		return getHljs();
	}
}

class MarkdownText extends Polymer.Element {
	static get is() {
		return "markdown-text";
	}

	static get properties() {
		return {
			content: {
				type: String,
				observer: "_contentChanged"
			}
		}
	}

	static get template() {
		return Polymer.html`
<style scope="markdown-text">
#container {
	margin-bottom: 24px;
}

.gr-syntax-attribute {
	color: var(--syntax-attribute-color);
}

.gr-syntax-function {
	color: var(--syntax-function-color);
}

.gr-syntax-meta {
	color: var(--syntax-meta-color);
}

.gr-syntax-keyword,
.gr-syntax-name {
	color: var(--syntax-keyword-color);
}

.gr-syntax-number {
	color: var(--syntax-number-color);
}

.gr-syntax-selector-class {
	color: var(--syntax-selector-class-color);
}

.gr-syntax-variable {
	color: var(--syntax-variable-color);
}

.gr-syntax-template-variable {
	color: var(--syntax-template-variable-color);
}

.gr-syntax-comment {
	color: var(--syntax-comment-color);
	font-style: italic;
}

.gr-syntax-string {
	color: var(--syntax-string-color);
}

.gr-syntax-selector-id {
	color: var(--syntax-selector-id-color);
}

.gr-syntax-built_in {
	color: var(--syntax-built_in-color);
}

.gr-syntax-tag {
	color: var(--syntax-tag-color);
}

.gr-syntax-link {
	color: var(--syntax-link-color);
}

.gr-syntax-meta-keyword {
	color: var(--syntax-meta-keyword-color);
}

.gr-syntax-type {
	color: var(--syntax-type-color);
}

.gr-syntax-title {
	color: var(--syntax-title-color);
}

.gr-syntax-attr {
	color: var(--syntax-attr-color);
}

.gr-syntax-literal {
	color: var(--syntax-literal-color);
}

.gr-syntax-selector-pseudo {
	color: var(--syntax-selector-pseudo-color);
}

.gr-syntax-regexp {
	color: var(--syntax-regexp-color);
}

.gr-syntax-selector-attr {
	color: var(--syntax-selector-attr-color);
}

.gr-syntax-template-tag {
	color: var(--syntax-template-tag-color);
}

.gr-syntax-params {
	color: var(--syntax-params-color);
}

.gr-syntax-doctag {
	font-weight: var(--syntax-doctag-weight);
}

.range {
	background-color: var(--diff-highlight-range-color);
	display: inline;
}

.rangeHighlight {
	background-color: var(--diff-highlight-range-hover-color);
	display: inline;
}

pre {
	background: var(--view-background-color);
	padding: 6px;
	border-radius: 4px;
}

code {
	background: rgba(0, 0, 0, .2);
	padding: .3em .4em;
	border-radius: 6px;
	font-family: var(--monospace-font-family);
	font-size: .9em;
	vertical-align: 1px;
	font-weight: 500;
}

pre code {
	padding: 0px;
	border: 0px;
	background: transparent;
	vertical-align: auto;
}

img {
	max-width: 100%;
}

a:link,
a:visited {
	color: var(--primary-text-color);
	background: rgba(255, 255, 255, 0.15);
	padding: .2em .4em;
	text-decoration: underline;
	border-radius: 6px;
	transition: background 200ms ease;
}

a:hover {
	background: rgba(255, 255, 255, 0.25);
}

table {
	border-collapse: collapse;
}

tr:nth-child(2n) {
	background: rgba(255, 255, 255, 0.15);
}

td, th {
	border: 1px solid white;
	padding: 6px 12px;
}
</style>
<div id="container"></div>
		`;
	}

	public content: string = "";

	private _contentChanged(content: string): void {
		let dirty = marked(content);
		let clean = sanitize(dirty, {
			ADD_TAGS: ["iframe"], // TODO: stricter iframe sanitization?
			ADD_ATTR: ["frameborder", "allowfullscreen"]
		});
		this.$.container.innerHTML = clean;

		getHljs().then((hljs) => {
			this.$.container.querySelectorAll("pre code").forEach((block) => {
				let language = Array.from(block.classList).find((name) => name.startsWith("language-"))?.substring(9);

				if (language) {
					block.innerHTML = hljs.highlight(language, (block as HTMLElement).innerText).value;
				} else {
					block.innerHTML = hljs.highlightAuto((block as HTMLElement).innerText).value;
				}
			});
		});
	}
}

customElements.define(MarkdownText.is, MarkdownText);

Gerrit.install((plugin) => {
	customElements.get("gr-formatted-text").prototype._contentOrConfigChanged = function(this: Polymer.Element, content: string) {
		let container = this.$.container;

		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}

		let child = new MarkdownText();
		child.setAttribute("content", content);
		container.appendChild(child);
	};
});
