var React = require('react');
var moment = require('moment');
var mapreplace = require('mapreplace');
var PubSub = require('pubsub-js');
var cx = React.addons.classSet;

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
		}
		var matchFormat = mapreplace(this.props.match.subType, {
			'NONE': 'Custom',
			'NORMAL': 'Normal 5v5',
			'NORMAL_3x3': 'Normal 3v3',
			'RANKED_SOLO_5x5': 'Ranked solo queue',
			'RANKED_TEAM_5x5': 'Ranked 5v5'
		});

		return (
			<div className="league-card" ref="card" onClick={this.openMatchViewer}>
				<div className="league-card-bg" style={style}>
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
									$: {Math.round(this.props.match.stats.goldEarned / 1000)}k gold
								</span><br />
								<span className="league-card-creeps">
									#: {this.props.match.stats.minionsKilled + this.props.match.stats.neutralMinionsKilled} creeps
								</span>
							</div>
						</div>
						<div className="league-card-bottom">
							{ matchFormat } - { moment(this.props.match.createDate).format('LL') }
						</div>
					</div>
				</div>
			</div>
		);
	}
});

module.exports = LeagueCard;
