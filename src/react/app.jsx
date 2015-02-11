'use strict';

var React = require('react');
var LeagueCardList = require('./LeagueCardList');
var LeagueMatchViewer = require('./LeagueMatchViewer');

React.render(<LeagueCardList />, document.getElementById('league-card-wrap'));
React.render(<LeagueMatchViewer />, document.getElementById('league-match-wrap'));
