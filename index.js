import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, hashHistory } from "react-router";
import Main from './main.jsx';
import 'bulma';
import './styles.scss';

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/" component={Main}>
    </Route>
  </Router>,
  document.getElementById("react-entry-point")
)
