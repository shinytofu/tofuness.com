var React = require('react');
var moment = require('moment');
var mapreplace = require('mapreplace');
var PubSub = require('pubsub-js');
var cx = require('classnames');
var _ = require('lodash');

var LeagueCard = React.createClass({
	propTypes: {
		match: React.PropTypes.object
	},
	openMatchViewer: function() {
		PubSub.publish('VIEW_MATCH', {
			match: this.props.match,
			champion: this.props.match.champion
		});
	},
	render: function() {
		var style = {
			backgroundImage: 'url(' + this.props.match.champion.cover + ')'
		};
		var matchFormat = mapreplace(this.props.match.subType, {
			'NONE': 'Custom',
			'NORMAL': 'Normal 5v5',
			'NORMAL_3x3': 'Normal 3v3',
			'RANKED_SOLO_5x5': 'Ranked solo queue',
			'COUNTER_PICK': 'Nemesis mode',
			'RANKED_TEAM_5x5': 'Ranked 5v5'
		});

		var itemIds = [];

		_.forOwn(this.props.match.stats, function(value, key) {
			if (key.indexOf('item') > -1) itemIds.push(value);
		});

		while (itemIds.length < 7) {
			itemIds.push(0);
		}

		return (
			<div className="league-card" ref="card" onClick={this.openMatchViewer} style={style}>
				<div className="league-card-ovl">
					<div className="league-card-top">
						<span className={cx({
							'league-card-outcome': true,
							'victory': this.props.match.stats.win
						})}>{ this.props.match.stats.win ? 'Victory' : 'Defeat' }</span> as {this.props.match.champion.name} on <span className={cx({
								'league-card-team': true,
								'purple': this.props.match.teamId === 200
						})}>{ this.props.match.teamId === 200 ? 'Purple' : 'Blue' }</span>
					</div>
					<div className="league-card-middle">
						<div className="league-card-kda">
							{this.props.match.stats.championsKilled || '0'} / {this.props.match.stats.numDeaths || '0'} / {this.props.match.stats.assists || '0'}
						</div>
						<div className="league-card-finance">
							<span className="league-card-gold">
								{Math.round(this.props.match.stats.goldEarned / 1000)}k gold
							</span><br />
							<span className="league-card-creeps">
								{this.props.match.stats.minionsKilled + Number(this.props.match.stats.neutralMinionsKilled || '0')} creeps
							</span>
						</div>
					</div>
				<div className="league-card-meta">
					<div className="league-card-item-wrap">
						{
							itemIds.map(function(itemId) {
								var itemStyle = {
									backgroundImage: itemId === 0 ? 'url(/public/img/empty.png)' : 'url(https://ddragon.leagueoflegends.com/cdn/6.3.1/img/item/' + itemId + '.png)'
								};
								return (
									<div className="league-card-item" style={itemStyle}>
									</div>
								);
							})
						}
					</div>
				</div>
					<div className="league-card-bottom">
						{ matchFormat } / { Math.round(this.props.match.stats.timePlayed / 60) + ' mins.' } / { moment(this.props.match.createDate).format('LL') }
					</div>
				</div>
			</div>
		);
	}
});

module.exports = LeagueCard;
