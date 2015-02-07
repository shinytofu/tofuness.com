var Hapi = require('hapi');
var Path = require('path');
var server = new Hapi.Server();
server.connection({ port: 1337 });

server.views({
	engines: {
		html: require('handlebars')
	},
	path: Path.join(__dirname, 'views'),
	partialsPath: Path.join(__dirname, 'views/partials')
});

server.route({
	method: 'GET',
	path: '/{param*}',
	handler: {
		directory: {
			path: 'public',
			listing: false
		}
	}
});

server.route({
	method: 'GET',
	path: '/',
	handler: function(request, reply) {
		reply.view('index');
	}
});

server.route({
	method: 'GET',
	path: '/portfolio',
	handler: function(request, reply) {
		reply.view('portfolio');
	}
});

if (process.env.NODE_ENV === 'development') {
	process.send({cmd: 'NODE_DEV', required: './views/index.html'});
	process.send({cmd: 'NODE_DEV', required: './views/partials/header.html'});
	process.send({cmd: 'NODE_DEV', required: './views/partials/footer.html'});
}

server.start(function() {
	console.log('Server running at: ' + server.info.uri);
});
