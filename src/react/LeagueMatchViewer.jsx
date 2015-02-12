var React = require('react');
var PubSub = require('pubsub-js');
var _ = require('lodash');

var purple = '#1e1433';
var purpleLight = '#685199';
var gold = '#f3d77f';

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
			goldDiff: [],
			matchChart: null,
			visible: false
		};
	},
	setUpChart: function() {
		var absMaxGoldDiff = _.max(_.map(this.state.goldDiff, function(diff) {
			return Math.abs(diff);
		})) + 500;
		var data = {
			labels: _.range(this.state.match.timeline.frames.length),
			series: [this.state.goldDiff, [100, 5000, 3000, 8000]]
		}
		var options = {
			low: -absMaxGoldDiff - 500,
			high: absMaxGoldDiff + 500,
			showArea: true,
			axisX: {
				labelInterpolationFnc: function(value, index) {
					return index % 2 === 0 ? value : null;
				}
			},
			classNames: {
				line: 'lolc-line',
				grid: 'lolc-grid',
				point: 'lolc-point'
			}
		}
		new Chartist.Line('.ct-chart', data, options);
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
					participant: participant,
					goldDiff: goldDiff
				});

				this.setUpChart();
			}.bind(this)
		});
	},
	render: function() {
		if (!this.state.visible) return <div />;
		return (
			<div className="league-match-modal">
				<div className="league-match-chart ct-chart ct-minor-seventh">
				</div>
			</div>
		);
	}
});

module.exports = LeagueMatchViewer;
