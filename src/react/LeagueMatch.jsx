// 1086892092

var React = require('react');
var LeagueMatchScoreboard = require('./LeagueMatchScoreboard');

var LeagueMatch = React.createClass({
	getInitialState: function() {
		return {
			match: null
		};
	},
	componentWillMount: function() {
		$.ajax({
			type: 'GET',
			url: '/match/1101046285',
			success: function(match) {
				this.setState({
					match: match
				});
			}.bind(this)
		});
	},
	render: function() {
		return (
			<div id="match">
				<div id="match-bg">
				</div>
				<div id="match-modal">
					<LeagueMatchScoreboard match={this.state.match} />
				</div>
			</div>
		);
	}
});

module.exports = LeagueMatch;
