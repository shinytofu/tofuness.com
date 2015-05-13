var React = require('react');
var _ = require('lodash');
var cardsData = require('../data/hearthstone_cards');
var HearthstoneDeck = require('./HearthstoneDeck');

var cardsData = _.union(
					cardsData['Basic'],
					cardsData['Blackrock Mountain'],
					cardsData['Classic'],
					cardsData['Curse of Naxxramas'],
					cardsData['Goblins vs Gnomes'],
					cardsData['Missions'],
					cardsData['Promotion'],
					cardsData['Reward']
				);

var HearthstoneDeckList = React.createClass({
	getInitialState: function() {
		return {
			loaded: false,
			decks: require('../data/hearthstone_decks')
		};
	},
	render: function() {
		return (
			<div id="hearth-decklist">
				{
					this.state.decks.map(function(deck) {
						deck.cards = deck.cards.map(function(card) {
							card = _.find(cardsData, function(tempCard) {
								return (tempCard.name === card && ['Minion', 'Spell', 'Weapon'].indexOf(tempCard.type) > -1);
							});
							return card;
						});
						deck.cards = _.sortBy(deck.cards, function(card) {
							return card.cost;
						});
						return (
							<div className="hearth-deck-wrap">
								<HearthstoneDeck deck={deck} />
							</div>
						);
					})
				}
			</div>
		);
	}
});

module.exports = HearthstoneDeckList;
