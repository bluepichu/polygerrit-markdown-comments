module.exports = {
	mode: "production",
	entry: {
		"polygerrit-markdown-comments": "./src/index.ts"
	},
	devtool: "source-map",
	output: {
		path: __dirname + "/dist",
		filename: "[name].js"
	},
	resolve: {
		extensions: ["ts", ".js"]
	},
	module: {
		rules: [
			{ test: /\.ts$/, loader: "ts-loader" }
		]
	},
	externals: {
		"highlight.js": "hljs"
	}
};
