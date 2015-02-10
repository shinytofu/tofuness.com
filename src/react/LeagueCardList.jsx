'use strict';

var React = require('react');
var championsData = require('../champions.json').data;
var _ = require('lodash');
var mapreplace = require('mapreplace');
var LeagueCard = require('./LeagueCard');

var LeagueCardList = React.createClass({
	getInitialState: function() {
		return {
			loaded: false,
			summonerName: 'Hameru',
			summonerRegion: 'EUNE',
			matches: []
		}
	},
	componentWillMount: function() {
		$.ajax({
			type: 'GET',
			url: '/matches',
			success: function(res) {
				this.setState({
					loaded: true,
					matches: res
				});
			}.bind(this)
		});
	},
	render: function() {
		if (!this.state.loaded) return <div />;

		var mergedMatches = this.state.matches.map(function(match) {
			var championName = _.findKey(championsData, {
				'key': '' + match.championId
			});
			var champion = championsData[championName];
			champion.cover = 'http://ddragon.leagueoflegends.com/cdn/img/champion/splash/' + champion.id + '_0.jpg';
			match.champion = champion;
			return match;
		}.bind(this));

		return (
			<div className="cf">
				{
					mergedMatches.map(function(match) {
						return <LeagueCard match={match} key={match.gameId} />;
					}.bind(this))
				}
			</div>
		);
	}
});

module.exports = LeagueCardList;
