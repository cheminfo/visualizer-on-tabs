import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './components/App';

const loc = window.location;
let hash = loc.hash.slice(1);
if (!hash) {
  hash = 'main';
}

const props = {
  origin: loc.origin,
  path: hash
};

const element = React.createElement(App, props);
ReactDOM.createRoot(document.getElementById('visualizer-on-tabs')).render(element);
