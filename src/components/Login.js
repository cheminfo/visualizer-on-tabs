import React from 'react';
import superagent from 'superagent';

const styles = {
  position: 'fixed',
  right: 20,
  top: 10,
};

class Login extends React.Component {
  config = {};
  constructor(config) {
    super();
    this.state = {};
    this.config = config;
    this.logout = this.logout.bind(this);
    if (!config.rocLogin) return;

    if (config.rocLogin.urlAbsolute) {
      this.loginUrl = config.rocLogin.urlAbsolute;
    } else {
      this.loginUrl = `${config.rocLogin.url}/auth/login?continue=${
        config.rocLogin.redirect || window.location.href
      }`;
    }
    this.session();
  }

  session() {
    if (!this.config.rocLogin) return;
    const login = this.config.rocLogin;
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
            window.location.href = this.loginUrl;
          }
          this.setState({
            user: res.body.username,
          });
          return;
        }
        this.setState({
          user: null,
        });
      });
  }

  async logout() {
    if (!this.config.rocLogin) return;
    const response = await fetch(`${this.config.rocLogin.url}/auth/logout`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`Unexpected logout response: ${response.statusText}`);
    }
    this.session();
  }

  render() {
    if (!this.config.rocLogin) {
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
