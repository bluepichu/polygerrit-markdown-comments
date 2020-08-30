declare namespace Gerrit {
	interface Plugin {}

	export function install(fn: (plugin: Plugin) => void): void;
}