var React = require('react');
var PubSub = require('pubsub-js');
var _ = require('lodash');

var LeagueMatchViewer = React.createClass({
	componentDidMount: function() {
		PubSub.subscribe('VIEW_MATCH', this.getMatchInfo);
	},
	getInitialState: function() {
		// 100 === blue
		// 200 === purple
		return {
			match: {},
			participant: {},
			visible: false
		};
	},
	getMatchInfo: function(msg, data) {
		if (this.state.match.matchId === data.match.gameId) return false;
		$.ajax({
			type: 'GET',
			url: '/match/' + data.match.gameId,
			success: function(response) {
				var participant = _.findWhere(response.participants, {
					championId: data.champion.championId
				});

				var goldDiff = [];
				// negative = in purple favor;
				response.timeline.frames.forEach(function(frame) {
					var purpleGold = 0;
					var blueGold = 0;
					_.forOwn(frame.participantFrames, function(value, key) {
						if (Number(key) < 6) {
							blueGold += value.totalGold;
						} else {
							purpleGold += value.totalGold;
						}
					});
					goldDiff.push(blueGold - purpleGold);
				});

				console.log(goldDiff);

				this.setState({
					visible: true,
					match: response,
					participant: participant
				});
			}.bind(this)
		});
	},
	render: function() {
		if (!this.state.visible) return <div />;
		return (
			<div className="league-match-modal">
				Match data here
			</div>
		);
	}
});

module.exports = LeagueMatchViewer;
