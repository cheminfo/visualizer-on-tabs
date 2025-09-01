import React from 'react';

const styles = {
  position: 'fixed',
  right: 20,
  top: 10,
};

class Login extends React.Component {
  config = {};
  constructor(props) {
    super(props);
    const config = props.config;
    this.state = {};
    this.config = props.config;
    this.logout = this.logout.bind(this);
    if (!config.rocLogin) return;

    if (config.rocLogin.urlAbsolute) {
      this.loginUrl = config.rocLogin.urlAbsolute;
    } else {
      this.loginUrl = `${config.rocLogin.url}/auth/login?continue=${
        config.rocLogin.redirect || window.location.href
      }`;
    }
  }

  componentDidMount() {
    void this.session();
  }

  async session() {
    if (!this.config.rocLogin) return;
    const login = this.config.rocLogin;
    const response = await fetch(`${login.url}/auth/session`, {
      credentials: 'include',
    });
    if (response.ok) {
      const body = await response.json();
      if (
        login.auto &&
        (!body.authenticated || (login.user && body.username !== login.user))
      ) {
        window.location.href = this.loginUrl;
      }
      this.setState({
        user: body.username,
      });
    } else {
      this.setState({
        user: null,
      });
    }
  }

  async logout() {
    if (!this.config.rocLogin) return;
    const response = await fetch(`${this.config.rocLogin.url}/auth/logout`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`Unexpected logout response: ${response.statusText}`);
    }
    void this.session();
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
