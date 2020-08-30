declare namespace Polymer {
	class Element extends HTMLElement {
		protected $: { [key: string]: HTMLElement };
	}

	export function html(parts: TemplateStringsArray, ...subtemplates: HTMLTemplateElement[]): HTMLTemplateElement;
}