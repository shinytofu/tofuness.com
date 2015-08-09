'use strict';

var React = require('react');
var _ = require('lodash');
var championsData = require('../data/lol_champions').data;
var LeagueCard = require('./LeagueCard');
var LeagueLoading = require('./LeagueLoading');

var LeagueCardList = React.createClass({
	getInitialState: function() {
		return {
			loaded: false,
			summonerName: 'Hameru',
			summonerRegion: 'EUNE',
			matches: [],
			error: null
		};
	},
	componentWillMount: function() {
		$.ajax({
			type: 'GET',
			url: '/recent-matches',
			success: function(res) {
				this.setState({
					loaded: true,
					matches: res.splice(0, 8)
				});
				this.animateIn();
			}.bind(this),
			error: function() {
				this.setState({
					error: 'Riot API seems to be down :('
				});
			}.bind(this)
		});
	},
	animateIn: function() {
		$(this.refs.cardList.getDOMNode()).find('>div').velocity('transition.slideUpIn', {
			duration: 600,
			easing: [0.215, 0.61, 0.355, 1],
			stagger: 50
		});
		$(window).resize();
	},
	render: function() {
		if (!this.state.loaded) return <LeagueLoading error={this.state.error} />;

		var mergedMatches = this.state.matches.map(function(match) {
			var championName = _.findKey(championsData, {
				'key': '' + match.championId
			});
			var champion = championsData[championName];
			champion.cover = 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/' + champion.id + '_0.jpg';
			match.champion = champion;
			return match;
		}.bind(this));

		return (
			<div className="cf" ref="cardList">
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
