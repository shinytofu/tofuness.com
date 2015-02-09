'use strict';

var React = require('react');
var championsData = require('../champions.json').data;
var _ = require('lodash');

var LeagueCard = React.createClass({
	getInitialState: function() {
		return {
			loaded: false,
			summonerName: 'Hameru',
			summonerRegion: 'EUNE',
			match: {}
		}
	},
	componentWillMount: function() {
		$.ajax({
			type: 'GET',
			url: '/matches',
			success: function(res) {
				this.setState({
					loaded: true,
					match: res
				});
			}.bind(this)
		});
	},
	render: function() {
		if (!this.state.loaded) return <div />;

		var championName = _.findKey(championsData, {
			'key': '' + this.state.match.championId
		});
		var champion = championsData[championName];
		var style = {
			backgroundImage: 'url(http://ddragon.leagueoflegends.com/cdn/img/champion/splash/' + champion.id + '_0.jpg)'
		}

		console.log(champion);

		return (
			<div className="league-card" style={style}>
			</div>
		);
	}
});

module.exports = LeagueCard;
