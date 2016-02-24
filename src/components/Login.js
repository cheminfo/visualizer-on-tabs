'use strict';

import React from 'react';
import {Glyphicon} from 'react-bootstrap';
import superagent from 'superagent';

var conf = require('../config/config.js');
var styles = {
    position: 'fixed',
    right: 20,
    top: 10
};

class Login extends React.Component {
    constructor() {
        super();
        this.state = {};
        this.session();
    }

    session() {
        superagent.get(`${conf.login.url}/auth/session`)
            .withCredentials()
            .end((err, res) => {
                if (err) console.log('Could not get session', err);
                else if (res && res.status == 200 && res.body) {
                    return this.setState({
                        user: res.body.username
                    });
                }
                this.setState({
                    user: null
                });
            });
    }


    logout() {
        superagent.get(`${conf.login.url}/auth/logout`)
            .withCredentials()
            .end((err, res) => {
                if (err) console.error('Could not logout', err);
                if (res && res.status == 200) {
                    this.session();
                }
            })
    }

    render() {
        if (!conf.login) {
            return <div></div>
        }
        if (!this.state.user || this.state.user === 'anonymous') {
            return <div style={styles}><a
                href={`${conf.login.url}/auth/login?continue=${conf.login.redirect}`}>Login</a></div>
        } else {
            return <div style={styles}>{this.state.user} (<a href="#" onClick={this.logout.bind(this)}>Logout</a>)</div>
        }
    }
}

export default Login;
