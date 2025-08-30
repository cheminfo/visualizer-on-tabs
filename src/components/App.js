/* eslint-disable no-await-in-loop */

import { postMessage, registerHandler } from 'iframe-bridge/main';
import React from 'react';
import Tab from 'react-bootstrap/Tab';
import BTabs from 'react-bootstrap/Tabs';
import { Visualizer } from 'react-visualizer';

import { getConfig } from '../config/config.js';
import customConfig from '../config/custom.json' with { type: 'json' };
import Tabs from '../main/Tabs.js';
import iframeMessageHandler from '../main/iframeMessageHandler.js';
import * as tabStorage from '../main/tabStorage.js';
import { rewriteURL } from '../util.js';

import Login from './Login.js';
import TabTitle from './TabTitle.js';

const config = getConfig(customConfig);
let tabInit = Promise.resolve();
let currentIframe;

const pageURL = new URL(window.location);
const pageQueryParameters = (() => {
  let params = {};
  for (let key of pageURL.searchParams.keys()) {
    params[key] = pageURL.searchParams.get(key);
  }
  return params;
})();

const iframeStyle = { position: 'static', flex: 2, border: 'none' };

class App extends React.Component {
  config;
  constructor(props) {
    super(props);
    this.config = window.structuredClone(config);
    for (let key in this.config.possibleViews) {
      this.config.possibleViews[key].id = key;
    }
    this.onActiveTab = this.onActiveTab.bind(this);

    registerHandler('tab', iframeMessageHandler);
    registerHandler('admin', (data, [level2]) => {
      if (level2 === 'connect' && data.windowID !== undefined) {
        if (!currentIframe) {
          // The iframe was refreshed
          this.config.possibleViews[this.state.activeTabKey].windowID =
            data.windowID;
          this.sendData(this.state.activeTabKey);
        } else {
          this.config.possibleViews[currentIframe.id].windowID = data.windowID;
          currentIframe.resolve();
          currentIframe = null;
        }
      }
    });

    Tabs.on('openTab', (obj) => {
      const options = {};
      ['noFocus', 'noFocusEvent', 'noData', 'load'].forEach((prop) => {
        options[prop] = obj[prop];
        delete obj[prop];
      });
      this.doTab(obj, options);
    });
    Tabs.on('status', this.setTabStatus.bind(this));
    Tabs.on('message', this.sendTabMessage.bind(this));
    Tabs.on('focus', this.focusTab.bind(this));

    this.visualizerVersion = pageURL.searchParams.get('v');

    this.state = {
      viewsList: [],
      activeTabKey: 0,
      isConfigLoaded: false,
    };

    void this.loadTabs();
  }

  async loadTabs() {
    let firstTab;
    const loadTab = async (view) => {
      if (!firstTab) firstTab = view.id;
      await this.doTab(view, {
        noFocus: true,
        load: this.config.loadHidden,
        noFocusEvent: true,
      });
    };
    const data = tabStorage.load();
    // Load possible views first
    for (let key in this.config.possibleViews) {
      let saved;
      if ((saved = data.find((el) => el.id === key))) {
        await loadTab(saved);
      } else {
        await loadTab(this.config.possibleViews[key]);
      }
    }

    for (let i = 0; i < data.length; i++) {
      if (!this.config.possibleViews[data[i].id]) {
        await loadTab(data[i]);
      }
    }

    // Nothing is focused at this point
    const lastSelected = tabStorage.getSelected();
    if (this.state.viewsList.find((el) => el.id === lastSelected)) {
      await this.showTab(lastSelected);
    } else {
      await this.showTab(firstTab);
    }
  }

  setTabStatus(data) {
    // Find view with given window ID
    const ids = Object.keys(this.config.possibleViews);
    let id = ids.find(
      (id) => this.config.possibleViews[id].windowID === data.windowID,
    );
    if (!id) return;
    let view = this.config.possibleViews[id];

    view = this.state.viewsList.find((el) => el.id === view.id);
    if (!view) return;

    view.status = { ...view.status, ...data.message };
    this.setState((state) => ({
      viewsList: state.viewsList,
    }));
  }

  sendTabMessage(data) {
    const viewInfo = this.config.possibleViews[data.id];
    if (viewInfo) {
      postMessage('tab.message', data.message, viewInfo.windowID);
    }
  }

  async focusTab(tabId) {
    if (this.state.viewsList.find((el) => el.id === tabId)) {
      await this.showTab(tabId, {
        noData: true,
      });
    }
  }

  async doTab(obj, options) {
    if (!this.config.possibleViews[obj.id]) {
      this.config.possibleViews[obj.id] = {
        id: obj.id,
        url: obj.url,
        data: obj.data,
        closable: obj.closable,
        rawIframe: obj.rawIframe,
      };
    } else {
      this.config.possibleViews[obj.id].data = obj.data;
    }

    if (this.config.rewriteRules) {
      let newURL = rewriteURL(
        this.config.rewriteRules,
        this.config.possibleViews[obj.id].url,
      );
      if (newURL) {
        this.config.possibleViews[obj.id].rewrittenUrl = newURL;
      }
    }

    await this.showTab(obj.id, options);
  }

  async showTab(id, options) {
    options = options || {};
    const sameTab = this.state.activeTabKey === id;
    if (sameTab && !options.force) return;

    const focusedTabId = options.noFocus ? undefined : id;
    let viewFromList = this.state.viewsList.find((el) => el.id === id);
    const newTab = !viewFromList;
    const viewInfo = this.config.possibleViews[id];

    if (!viewInfo) throw new Error('unreachable');
    if (!viewFromList) {
      viewFromList = {
        id,
        url: viewInfo.url,
        rewrittenUrl: viewInfo.rewrittenUrl,
        closable: viewInfo.closable,
        rawIframe: viewInfo.rawIframe,
      };
      this.state.viewsList.push(viewFromList);
    }
    const firstRender =
      (options.load || !options.noFocus) && (newTab || !viewFromList.rendered);
    await tabInit;
    // First render means we expect the render function to initialize a new iframe
    // We need to get the IframeBridge ID of that frame and prevent any other iframes
    // to load during that time
    if (firstRender) {
      // TODO: there is probably a cleaner way than a global promise
      // eslint-disable-next-line require-atomic-updates
      tabInit = new Promise((resolve) => {
        viewFromList.rendered = true;
        this.setState((state) => ({
          activeTabKey: focusedTabId,
          viewsList: state.viewsList,
        }));

        setTimeout(() => {
          // This will have an effect only if Promise is not yet resolved
          // It prevents completely blocking the interface if there is a problem
          // with that tab
          return resolve();
        }, 3000);
        currentIframe = {
          resolve,
          id,
        };
      });
      await tabInit;
    } else {
      this.setState((state) => ({
        activeTabKey: focusedTabId,
        viewsList: state.viewsList,
      }));
    }

    // always send data on first render
    if (!options.noData || firstRender) {
      this.sendData(id);
    }
    tabStorage.save(id, viewInfo);
    if (!options.noFocus) {
      tabStorage.saveSelected(id);
    }
    if (!options.noFocusEvent && !sameTab) {
      this.sendTabFocusEvent(focusedTabId);
    }
  }

  sendData(id) {
    const viewInfo = this.config.possibleViews[id];
    postMessage(
      'tab.data',
      { ...viewInfo.data, queryParameters: pageQueryParameters },
      viewInfo.windowID,
    );
  }

  async removeTab(id) {
    const forbiddenPossibleViews = Object.keys(this.config.possibleViews);
    tabStorage.remove(id);
    if (forbiddenPossibleViews.indexOf(id) === -1) {
      delete this.config.possibleViews[id];
    }
    let idx = this.state.viewsList.findIndex((el) => el.id === id);
    if (idx === -1) return;
    this.state.viewsList.splice(idx, 1);

    let newActiveTab;
    if (id !== this.state.activeTabKey) {
      newActiveTab = this.state.activeTabKey;
    } else {
      const viewsLength = this.state.viewsList.length;
      // Set next active tab
      if (viewsLength > 0) {
        if (idx < viewsLength) {
          newActiveTab = this.state.viewsList[idx].id;
        } else {
          newActiveTab = this.state.viewsList[viewsLength - 1].id;
        }
      }
    }

    await this.showTab(newActiveTab, {
      noData: true,
      force: true,
    });
  }

  sendTabFocusEvent(key) {
    if (this.config.possibleViews[key]) {
      postMessage('tab.focus', {}, this.config.possibleViews[key].windowID);
    }
  }

  async onActiveTab(key) {
    await this.showTab(key, {
      noData: true,
    });
  }

  render() {
    const arr = [];
    for (let view of this.state.viewsList) {
      const closable = view.closable === undefined ? true : view.closable;
      const saved =
        !view.status || view.status.saved === undefined
          ? true
          : view.status.saved;

      const textStyle = {};
      if (!saved) {
        textStyle.color = 'red';
      }
      const shouldRender = view.rendered || view.id === this.state.activeTabKey;
      let viewPage;
      if (shouldRender) {
        if (view.rawIframe) {
          viewPage = (
            <iframe
              allow="fullscreen; clipboard-read; clipboard-write;"
              src={view.rewrittenUrl || view.url}
              style={iframeStyle}
            />
          );
        } else {
          viewPage = (
            <Visualizer
              url="visualizer.html"
              viewURL={view.rewrittenUrl || view.url}
              version={
                this.visualizerVersion ||
                this.config.visualizerVersion ||
                'auto'
              }
              config={this.config.visualizerConfig}
              style={iframeStyle}
            />
          );
        }
      } else {
        viewPage = <div>Not rendered</div>;
      }
      arr.push(
        <Tab
          title={
            <TabTitle
              textTitle={saved ? null : 'Not saved'}
              textStyle={textStyle}
              name={view.id}
              onTabClosed={closable ? () => this.removeTab(view.id) : null}
            />
          }
          key={view.id}
          eventKey={view.id}
        >
          {viewPage}
        </Tab>,
      );
    }

    return (
      <div className="visualizer-on-tabs-app">
        <Login config={this.config} />
        <div className="visualizer-on-tabs-content d-flex flex-column">
          <BTabs
            id="visualizer-on-tabs-tab"
            transition={false}
            activeKey={this.state.activeTabKey}
            onSelect={this.onActiveTab}
          >
            {arr}
          </BTabs>
        </div>
      </div>
    );
  }
}

export default App;
