var React = require('react');
var PubSub = require('pubsub-js');
var _ = require('lodash');
var leagueMatchTheme = require('./leagueMatchTheme');
var gold = '#f3d77f';
var blue = '#4a95ff';
var purple = '#a767d8';

var easing = {
	easeInCubic: [0.55, 0.055, 0.675, 0.19],
	easeOutCubic: [0.215, 0.61, 0.355, 1]
}

function generateSeries(data) {
	return {
		type: 'line',
		smooth: true,
		showAllSymbol: true,
		data: data,
		clickable: false,
		hoverable: false,
		itemStyle: {
			normal: {
				color: function(point) {
					if (point.data === 0) return '#fff';
					return point.data > 0 ? blue : purple;
				},
				lineStyle: {
					color: '#fff'
				},
				areaStyle: {
					color: 'rgba(255,255,255, 0.6)',
					type: 'default'
				},
				borderWidth: 1,
				borderColor: '#fff'
			},
			emphasis: {
				borderColor: '#1e1433',
				borderWidth: -1
			}
		},
		symbol: 'circle',
		symbolSize: 3
	}
}

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
			visible: false,
			loading: false
		};
	},
	setUpCharts: function() {
		// Messy but gotta go fast :^)
		var absMaxGoldDiff = _.max(_.map(this.state.goldDiff, function(diff) {
			return Math.abs(diff);
		})) + 500;

		var goldChart = echarts.init($(this.refs.chart.getDOMNode()).get(), leagueMatchTheme);
		var goldChartOptions = {
			animationDuration: 800,
			tooltip: {
				trigger: 'axis',
				showDelay: 0,
				hideDelay: 0,
				transitionDuration: 0,
				position: function(position) {
					return [position[0] - 50, 40];
				},
				axisPointer: {
					type: 'line',
					lineStyle: {
						color: 'rgba(255, 255, 255, 0.3)',
						width: 1
					}
				}
			},
			xAxis: {
				position: 'top',
				type: 'category',
				axisLabel: {
					interval: this.state.match.matchDuration > 1320 ? 2 : 1,
					textStyle: {
						color: '#534b5b'
					},
					formatter: function(value) {
						return value + 'm';
					}
				},
				axisLine: {
					onZero: false,
					lineStyle: {
						color: '#2a262e'
					}
				},
				splitLine: {
					lineStyle: {
						color: '#2a262e',
						width: 1,
						type: 'dotted'
					}
				},
				data: _.range(this.state.match.timeline.frames.length)
			},
			yAxis: {
				type: 'value',
				splitLine: false,
				min: (absMaxGoldDiff + 500) * -1,
				max: absMaxGoldDiff + 500,
				axisLine: false,
				splitNumber: 6,
				axisLabel : {
					textStyle: {
						color: '#534b5b',
					},
					formatter: function(value) {
						return Math.round(Math.abs(value) / 1000) + 'k';
					}
				}
			},
			series: [generateSeries(this.state.goldDiff)]
		}
		goldChart.setOption(goldChartOptions);
		window.onresize = goldChart.resize;

		/*
		goldChart.on('tooltipHover', function(e) {
			console.log(e);
		}); */

		var killData = [];
		this.state.match.timeline.frames.forEach(function(frame, index) {
			var killEvents = _.filter(frame.events, { eventType: 'CHAMPION_KILL' });
			killData.push([
				index,
				0.5,
				killEvents.length
			]);
		});

		var killsChart = echarts.init($(this.refs.killsChart.getDOMNode()).get(), leagueMatchTheme);
		var killsChartOption = {
			grid: {
				y: 20,
				y2: 60
			},
			tooltip: {
				trigger: 'axis',
				showDelay: 0,
				hideDelay: 0,
				transitionDuration: 0,
				position: function(position) {
					return [position[0] - 50, 40];
				},
				axisPointer: {
					type: 'line',
					lineStyle: {
						color: 'rgba(255, 255, 255, 0.3)',
						width: 0
					}
				}
			},
			xAxis: {
				type: 'value',
				axisLine: false,
				axisLabel: false,
				splitLine: false,
				min: 0,
				max: this.state.match.timeline.frames.length
			},
			yAxis: {
				type: 'value',
				axisLabel: false,
				axisLine: false,
				splitLine: false,
				min: 0,
				max: 1
			},
			series: [
				{
					type: 'scatter',
					symbolSize: 5,
					data: killData,
					itemStyle: {
						normal: {
							color: 'rgba(255, 255, 255, 0.6)'
						}
					},
					symbolSize: function(point) {
						return point[2] * 2;
					}
				}
			]
		}
		killsChart.setOption(killsChartOption);

		goldChart.connect([ killsChart ]);
		killsChart.connect([ goldChart ]);


		this.animateIn();
	},
	animateIn: function() {
		$(this.refs.bg.getDOMNode()).velocity({
			opacity: [1, 0]
		}, {
			duration: 300,
			easing: easing.easeOutCubic
		});

		$(this.refs.modal.getDOMNode()).velocity({
			opacity: [1, 0.6],
			translateX: [0, -30]
		}, {
			duration: 600,
			easing: easing.easeOutCubic
		});

		this.setState({
			loading: false
		});
	},
	animateOut: function(e) {
		if (e.target !== this.refs.bg.getDOMNode()) return e.preventDefault();
		$(this.refs.bg.getDOMNode()).velocity({
			opacity: [0, 1]
		}, {
			duration: 300,
			easing: easing.easeOutCubic,
			complete: function() {
				this.setState({
					visible: false,
					loading: false
				});
			}.bind(this)
		});
	},
	getMatchInfo: function(msg, data) {
		if (this.state.loading) return false;
		if (this.state.match.matchId === data.match.gameId) {
			this.setState({
				loading: true,
				visible: true
			});
			return this.setUpCharts();
		}

		this.setState({
			loading:  true
		});
		$.ajax({
			type: 'GET',
			url: '/match/' + data.match.gameId,
			success: function(response) {
				var participant = _.findWhere(response.participants, {
					championId: data.champion.key
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

				this.setState({
					visible: true,
					match: response,
					participant: participant,
					goldDiff: goldDiff
				});
				this.setUpCharts();
			}.bind(this)
		});
	},
	render: function() {
		if (!this.state.visible) return <div />;
		return (
			<div className="league-match-bg" ref="bg" onClick={this.animateOut}>
				<div className="league-match-modal" ref="modal">
					<div className="league-match-title">
						Gold difference
					</div>
					<div className="league-match-chart" ref="chart">
					</div>
					<div className="league-match-title">
						Game Events
					</div>
					<div className="league-match-smallchart" ref="killsChart"></div>
				</div>
			</div>
		);
	}
});

module.exports = LeagueMatchViewer;
