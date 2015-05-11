'use strict';

var React = require('react');
var LeagueCardList = require('./LeagueCardList');
var HearthstoneDeckList = require('./HearthstoneDeckList');

React.render(<LeagueCardList />, document.getElementById('league-card-wrap'));
React.render(<HearthstoneDeckList />, document.getElementById('hearth-decklist-wrap'));
