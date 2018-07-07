import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { getTranslate, setActiveLanguage } from 'react-localize-redux';
import { connect } from 'react-redux';
import 'react-table/react-table.css';

import { store } from './store';
import { alertActions } from './alert.actions';
import { authenticationActions } from '../auth';
import { availableLanguages, currentLanguage } from '../i18n';
import { history } from './history';
import Header from '../header/Header';
import UserSettings from '../user-settings/UserSettings';
import Dashboard from '../dashboard/Dashboard';
import Employees from '../employee/Employees';

import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    const { dispatch } = this.props;
    history.listen(() => {
      // clear alert on location change
      dispatch(alertActions.clear());
    });
    dispatch(authenticationActions.checkLogin());
  }

  render() {
    const { alert, user, translate } = this.props;
    if (!user) {
      return (translate('app.redirectLogin'));
    }
    return (
      <Router>
        <div>
          <Header
            onChange={l => store.dispatch(setActiveLanguage(l))}
            current={currentLanguage}
            available={availableLanguages}
          />

          <div id="main">
            {alert && alert.message &&
            <div className={`alert ${alert.type}`}>
              {alert.message.toString()}
            </div>
            }
            <Switch>
              <Route exact path="/" component={Dashboard} />
              <Route path="/user-settings" component={UserSettings} />
              <Route path="/employees" component={Employees} />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

function mapStateToProps(state) {
  const { alert } = state;
  const { user } = state.authentication;
  return {
    user,
    alert,
    translate: getTranslate(state.locale),
  };
}

export default connect(mapStateToProps)(App);
