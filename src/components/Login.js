import React from 'react';

const styles = {
  position: 'fixed',
  right: 20,
  top: 10,
};

class Login extends React.Component {
  constructor(props) {
    super(props);
    const { config } = props;
    this.state = {};
    this.logout = this.logout.bind(this);
    if (!config.rocLogin) return;

    this.loginUrl = `${config.rocLogin.url}/auth/login?continue=${encodeURIComponent(
      config.rocLogin.redirect || window.location.href,
    )}`;
  }

  componentDidMount() {
    void this.session();
  }

  async session() {
    const rocLogin = this.props.config.rocLogin;
    if (!rocLogin) return;
    const response = await fetch(`${rocLogin.url}/auth/session`, {
      credentials: 'include',
    });
    if (response.ok) {
      const body = await response.json();
      if (
        rocLogin.auto &&
        (!body.authenticated ||
          (rocLogin.user && body.username !== rocLogin.user))
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
    if (!this.props.config.rocLogin) return;
    const response = await fetch(
      `${this.props.config.rocLogin.url}/auth/logout`,
      {
        credentials: 'include',
      },
    );
    if (!response.ok) {
      throw new Error(`Unexpected logout response: ${response.statusText}`);
    }
    void this.session();
  }

  render() {
    if (!this.props.config.rocLogin) {
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
