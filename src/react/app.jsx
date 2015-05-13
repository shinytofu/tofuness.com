'use strict';

var React = require('react');
var LeagueCardList = require('./LeagueCardList');
var HearthstoneDeckList = require('./HearthstoneDeckList');

var leagueCardWrap = document.getElementById('league-card-wrap');
if (leagueCardWrap) {
	React.render(<LeagueCardList />, document.getElementById('league-card-wrap'));
	React.render(<HearthstoneDeckList />, document.getElementById('hearth-decklist-wrap'));
}
