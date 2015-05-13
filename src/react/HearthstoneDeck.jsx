var React = require('react');
var _ = require('lodash');
var HearthstoneCard = require('./HearthstoneCard');

var HearthstoneDeck = React.createClass({
	animateIn: function() {
		$(this.refs.deckList.getDOMNode()).find('.hearth-card-misc').velocity('transition.slideRightIn', {
			durtion: 300,
			stagger: 80,
			delay: 500
		});
	},
	componentDidMount: function() {
		this.animateIn();
	},
	render: function() {

		var groupedDeck = _.groupBy(this.props.deck.cards, function(card) {
			return card.name;
		});

		groupedDeck = _.map(groupedDeck, function(card) {
			if (card.length > 1) {
				card = card[0];
				card.count = 2;
			} else {
				card = card[0];
			}
			return card;
		});

		return (
			<div className="hearth-deck" ref="deckList">
				<div className="hearth-deck-left">
					<div className="hearth-deck-class">{this.props.deck.class}</div>
					<div className="hearth-deck-name">{this.props.deck.name}</div>
				</div>
				<div className="hearth-deck-cards">
					{
						groupedDeck.map(function(card) {
							return <HearthstoneCard card={card} />
						})
					}
				</div>
			</div>
		);
	}
});

module.exports = HearthstoneDeck;
