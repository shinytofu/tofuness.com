var webpack = require('webpack');

module.exports = function(options){
	var plugins = [];

	if (options.minimize) {
		plugins.push(
			new webpack.optimize.UglifyJsPlugin(),
			new webpack.optimize.DedupePlugin(),
			new webpack.DefinePlugin({
				"process.env": {
					NODE_ENV: JSON.stringify("production")
				}
			}),
			new webpack.NoErrorsPlugin()
		);
	}

	return {
		plugins: plugins,
		debug: options.debug,
		entry: './src/react/app.jsx',
		output: {
			filename: 'components.js',
			path: './build',
			publicPath: options.devServer ? 'http://localhost:8090/assets' : './public/js/'
		},
		module: {
			loaders: [
				{
					test: /\.jsx$/,
					loader: 'babel-loader',
					exclude: /node_modules/,
					query: {
						presets: ['react', 'es2015']
					}
				}
			]
		},
		resolve: {
			extensions: ['', '.js', '.jsx']
		}
	};
};
