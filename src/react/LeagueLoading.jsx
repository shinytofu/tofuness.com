var React = require('react');

var LeagueLoading = React.createClass({
	componentDidMount: function() {
		var opts = {
			top: '7px',
			lines: 8,
			length: 2,
			width: 2,
			radius: 3,
			corners: 1,
			color: '#fff',
			speed: 1.8,
			trail: 70,
			zIndex: 2,
			hwaccel: true,
		};
		var spinner = new Spinner(opts).spin();
		$(this.refs.spinner.getDOMNode()).prepend(spinner.el);
	},
	render: function() {
		return (
			<div className="league-loading" ref="spinner">
				<div className="league-loading-message">
					{ (this.props.error) ? this.props.error : 'Ohnomnom (fetching data)...' }
				</div>
			</div>
		);
	}
});

module.exports = LeagueLoading;
