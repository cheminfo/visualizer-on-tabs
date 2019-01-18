import React from 'react';
import superagent from 'superagent';

const conf = require('../config/config.js');

const styles = {
  position: 'fixed',
  right: 20,
  top: 10
};

class Login extends React.Component {
  constructor() {
    super();
    this.state = {};
    this.logout = this.logout.bind(this);
    if (!conf.rocLogin) return;

    if (conf.rocLogin.urlAbsolute) {
      this.loginUrl = conf.rocLogin.urlAbsolute;
    } else {
      this.loginUrl = `${conf.rocLogin.url}/auth/login?continue=${conf.rocLogin
        .redirect || location.href}`;
    }
    this.session();
  }

  session() {
    if (!conf.rocLogin) return;
    const login = conf.rocLogin;
    superagent
      .get(`${login.url}/auth/session`)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          throw err;
        } else if (res && res.status === 200 && res.body) {
          if (
            login.auto &&
            (!res.body.authenticated ||
              (login.user && res.body.username !== login.user))
          ) {
            location.href = this.loginUrl;
          }
          this.setState({
            user: res.body.username
          });
          return;
        }
        this.setState({
          user: null
        });
      });
  }

  logout() {
    if (!conf.rocLogin) return;
    superagent
      .get(`${conf.rocLogin.url}/auth/logout`)
      .withCredentials()
      .end((err, res) => {
        if (err) throw err;
        if (res && res.status === 200) {
          this.session();
        }
      });
  }

  render() {
    if (!conf.rocLogin) {
      return <div />;
    }
    if (!this.state.user || this.state.user === 'anonymous') {
      return (
        <div style={styles}>
          <a href={this.loginUrl}>Login</a>
        </div>
      );
    } else {
      return (
        <div style={styles}>
          {this.state.user}
          &nbsp;
          <a href="#" onClick={this.logout}>
            Logout
          </a>
        </div>
      );
    }
  }
}

export default Login;
