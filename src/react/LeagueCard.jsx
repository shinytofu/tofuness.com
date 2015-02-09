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
						var style = {
							backgroundImage: 'url(' + match.champion.cover + ')'
						}
						return (
							<div className="league-card" style={style}>
								<div className="league-card-ovl">
									<div className="league-card-top">
										Played as {match.champion.name}
									</div>
									<div className="league-card-stats">
										<div className="league-card-kda">
											{match.stats.championsKilled || '0'} / {match.stats.numDeaths || '0'} / {match.stats.assists || '0'}
										</div>
										<div className="league-card-finance">
											<div className="league-card-gold">
												Earned {Math.round(match.stats.goldEarned / 1000)}k gold
											</div>
											<div className="league-card-creeps">
												Killed {match.stats.minionsKilled + match.stats.neutralMinionsKilled} creeps
											</div>
										</div>
									</div>
								</div>
							</div>
						);
					})
				}
			</div>
		);
	}
});

module.exports = LeagueCard;
