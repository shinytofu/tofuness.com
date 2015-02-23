var dotenv = require('dotenv');
dotenv.load();

var Hapi = require('hapi');
var Path = require('path');
var Request = require('superagent');
var Handlebars = require('handlebars');
require('swag').registerHelpers(Handlebars);

var server = new Hapi.Server();
server.connection({ port: 1337 });

server.views({
	engines: {
		html: Handlebars
	},
	path: Path.join(__dirname, 'views'),
	partialsPath: Path.join(__dirname, 'views/partials'),
	context: {
		env: process.env.NODE_ENV
	}
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
	path: '/projects',
	handler: function(request, reply) {
		reply.view('projects');
	}
});

server.route({
	method: 'GET',
	path: '/games',
	handler: function(request, reply) {
		reply.view('games');
	}
});

server.route({
	method: 'GET',
	path: '/experiments',
	handler: function(request, reply) {
		reply.view('experiments');
	}
});

var RIOT = {
	API_KEY: process.env.RIOT_API_KEY,
	SUMMONER_ID: 22045226
}

server.route({
	method: 'GET',
	path: '/recent-matches',
	handler: function(request, reply) {
		Request
		.get('https://eune.api.pvp.net/api/lol/eune/v1.3/game/by-summoner/' + RIOT.SUMMONER_ID + '/recent?api_key=' + RIOT.API_KEY)
		.end(function(err, response) {
			if (response.status !== 200){
				reply(new Error(response.status));
			} else {
				reply(JSON.parse(response.text).games).type('text/json');
			}
		});
	}
});

server.route({
	method: 'GET',
	path: '/match/{match_id}',
	handler: function(request, reply) {
		Request
		.get('https://eune.api.pvp.net/api/lol/eune/v2.2/match/' + request.params.match_id +'?includeTimeline=true&api_key=' + RIOT.API_KEY)
		.end(function(err, response) {
			if (response.status !== 200) return reply({ status: response.status }, null);
			reply(err, JSON.parse(response.text)).type('text/json');
		});
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
