var React = require('react');

var HearthstoneCard = React.createClass({
	getInitialState: function() {
		return {
			imageLoaded: false,
			imageUrl: null
		};
	},
	moveImage: function(e) {
		$(this.refs.cardImage.getDOMNode()).css({
			position: 'absolute',
			left: e.pageX - $('#hearth-slide').offset().left,
			top: e.pageY - $('#hearth-slide').offset().top,
			marginLeft: -109,
			marginTop: -330
		});
	},
	showImage: function() {
		var $card = $(this.refs.cardImage.getDOMNode());
		if (!$card.closest('.me-slide').hasClass('active')) return false;
		if (!this.state.imageLoaded) {
			this.setState({
				imageLoaded: true,
				imageUrl: 'url(http://wow.zamimg.com/images/hearthstone/cards/enus/original/' + this.props.card.id + '.png)'
			});
		}
		$card.show().stop().velocity({
			scale: [1, 0.8],
			opacity: [1, 0],
			translateY: [0, 10],
			rotateX: [0, 50]
		}, {
			duration: 350,
			easing: [220, 20]
		});
	},
	hideImage: function() {
		$(this.refs.cardImage.getDOMNode()).hide();
	},
	render: function() {
		var misc;
		var card = this.props.card;
		if (card.count) {
			misc = (<div className="hearth-card-misc">{card.count}</div>);
		}
		if (card.rarity === 'Legendary') {
			misc = (<div className="hearth-card-misc legendary">{String.fromCharCode(9733)}</div>);
		}

		var style;
		if (this.state.imageUrl) {
			style = {
				backgroundImage: this.state.imageUrl
			};
		}
		return (
			<div className="hearth-card" onMouseMove={this.moveImage} onMouseEnter={this.showImage} onMouseLeave={this.hideImage} ref="cardWrap">
				<div className="hearth-card-image" ref="cardImage" style={style}>
				</div>
				<div className="hearth-card-cost">
					{card.cost}
				</div>
				<div className="hearth-card-name">
					{card.name}
				</div>
				{misc}
			</div>
		);
	}
});

module.exports = HearthstoneCard;
