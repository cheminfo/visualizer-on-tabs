'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

let loc = window.location;
let hash = loc.hash.slice(1);
if (!hash) {
    hash = 'main';
}

let props = {
    origin: loc.origin,
    path: hash
};

let element = React.createElement(App, props);
ReactDOM.render(element, document.getElementById('visualizer-on-tabs'));
