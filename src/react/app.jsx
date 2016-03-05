'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var LeagueCardList = require('./LeagueCardList');
var HearthstoneDeckList = require('./HearthstoneDeckList');

var leagueCardWrap = document.getElementById('league-card-wrap');
if (leagueCardWrap) {
	ReactDOM.render(<LeagueCardList />, document.getElementById('league-card-wrap'));
	ReactDOM.render(<HearthstoneDeckList />, document.getElementById('hearth-decklist-wrap'));
}
