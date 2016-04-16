var dotenv = require('dotenv');
dotenv.load();

var Hapi = require('hapi');
var Path = require('path');
var Request = require('superagent');
var Handlebars = require('handlebars');
require('swag').registerHelpers(Handlebars);

var server = new Hapi.Server();
server.connection({ port: process.env.PORT || 1337 });

server.register(require('vision'), (err) => {
	if (err) {
		throw err;
	}
	server.views({
		engines: {
			html: Handlebars
		},
		path: Path.join(__dirname, 'views'),
		partialsPath: Path.join(__dirname, 'views/partials'),
		context: {
			// Available to all views
			env: process.env.NODE_ENV,
			revManifest: require('./build/rev-manifest.json')
		}
	});
});

server.register({
	register: require('hapi-sitemap'),
	options: {
		endpoint: '/sitemap',
		baseUri: 'https://tofuness.com'
	},
	function(err) {
		if (err) {
			console.log(err);
		}
	}
});

server.register(require('inert'), (err) => {
	if (err) {
		throw err;
	}

	server.route({
		method: 'GET',
		path: '/public/{param*}',
		handler: {
			directory: {
				path: 'public',
				listing: false
			}
		},
		config: {
			plugins: {
				sitemap: {
					exclude: true
				}
			},
			cache: {
				expiresIn: 7 * 24 * 3600 * 1000,
				privacy: 'public'
			}
		}
	});

	server.route({
		method: 'GET',
		path: '/assets/{param}',
		handler: {
			directory: {
				path: 'build',
				listing: false
			}
		},
		config: {
			plugins: {
				sitemap: {
					exclude: true
				}
			},
			cache: {
				expiresIn: 7 * 24 * 3600 * 1000,
				privacy: 'public'
			}
		}
	});
});

server.route({
	method: 'GET',
	path: '/',
	handler: function(request, reply) {
		reply.view('index' , { title: 'About', animate_logo: true });
	}
});

server.route({
	method: 'GET',
	path: '/projects',
	handler: function(request, reply) {
		reply.view('projects', { title: 'Projects' });
	}
});

server.route({
	method: 'GET',
	path: '/games/{slide?}',
	handler: function(request, reply) {
		if (['hearthstone', 'league', 'other'].indexOf(request.params.slide) > -1 || !request.params.slide) {
			reply.view('games', { title: 'Games & Fun' });
		} else {
			reply.view('404', { title: 'Page not found' }).code(404);
		}
	}
});

var RIOT = {
	API_KEY: process.env.RIOT_API_KEY,
	SUMMONER_ID: 22045226
};

server.route({
	method: 'GET',
	path: '/recent-matches',
	handler: function(request, reply) {
		Request
		.get('https://eune.api.pvp.net/api/lol/eune/v1.3/game/by-summoner/' + RIOT.SUMMONER_ID + '/recent?api_key=' + RIOT.API_KEY)
		.end(function(err, response) {
			if (err) {
				console.log(err);
				console.log(response);
				reply(new Error(err));
			} else if (response.status !== 200){
				console.log(response);
				reply(new Error(response.status));
			} else {
				reply(JSON.parse(response.text).games).type('text/json');
			}
		});
	},
	config: {
		plugins: {
			sitemap: {
				exclude: true
			}
		}
	}
});

server.route({
	method: 'GET',
	path: '/match/{match_id}',
	handler: function(request, reply) {
		Request
		.get('https://eune.api.pvp.net/api/lol/eune/v2.2/match/' + request.params.match_id +'?includeTimeline=true&api_key=' + RIOT.API_KEY)
		.end(function(err, response) {
			if (response.status !== 200) {
				return reply({ status: response.status }, null);
			}
			reply(err, JSON.parse(response.text)).type('text/json');
		});
	},
	config: {
		plugins: {
			sitemap: {
				exclude: true
			}
		}
	}
});

server.route({
	method: '*',
	path: '/{p*}',
	handler: function(request, reply) {
		return reply.view('404', { title: 'Page not found' }).code(404);
	},
	config: {
		plugins: {
			sitemap: {
				exclude: true
			}
		}
	}
});


if (process.env.NODE_ENV === 'development') {
	process.send({cmd: 'NODE_DEV', required: './views/index.html'});
	process.send({cmd: 'NODE_DEV', required: './views/projects.html'});
	process.send({cmd: 'NODE_DEV', required: './views/games.html'});
	process.send({cmd: 'NODE_DEV', required: './views/experiments.html'});
	process.send({cmd: 'NODE_DEV', required: './views/partials/header.html'});
	process.send({cmd: 'NODE_DEV', required: './views/partials/footer.html'});
}

server.start(function() {
	console.log('Server running at: ' + server.info.uri);
});
