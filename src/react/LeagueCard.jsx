var React = require('react');
var moment = require('moment');

var LeagueCard = React.createClass({
	propTypes: {
		match: React.PropTypes.object
	},
	render: function() {
		var style = {
			backgroundImage: 'url(' + this.props.match.champion.cover + ')'
		}
		return (
			<div className="league-card" ref="card">
				<div className="league-card-bg" style={style}>
					<div className="league-card-ovl">
						<div className="league-card-top">
							{this.props.match.champion.name} - { moment(this.props.match.createDate).format('LL') }
						</div>
						<div className="league-card-middle">
							<div className="league-card-kda">
								{this.props.match.stats.championsKilled || '0'} / {this.props.match.stats.numDeaths || '0'} / {this.props.match.stats.assists || '0'}
							</div>
							<div className="league-card-finance">
								<span className="league-card-gold">Earned {Math.round(this.props.match.stats.goldEarned / 1000)}k gold</span> · <span className="league-card-creeps">Killed {this.props.match.stats.minionsKilled + this.props.match.stats.neutralMinionsKilled} creeps</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

module.exports = LeagueCard;
