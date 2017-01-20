'use strict';

window.DebugNS = '*';

// Dependencies
import IframeBridge from 'iframe-bridge';
import React from 'react';
import Visualizer from 'react-visualizer';
import {Tabs as BTabs, Tab, Button} from 'react-bootstrap';

// Components
import TabTitle from './TabTitle';
import Login from './Login';

// Other
import Tabs from '../main/Tabs';
import iframeMessageHandler from '../main/iframeMessageHandler';
import iframeBridge from '../main/iframe-bridge';
import tabStorage from '../main/tabStorage';

var conf = require('../config/config.js');


const possibleViews = conf.possibleViews;
const forbiddenPossibleViews = Object.keys(possibleViews);

let tabInit = Promise.resolve();
let currentIframe;


class App extends React.Component {
    constructor() {
        super();

        IframeBridge.registerHandler('tab', iframeMessageHandler);
        IframeBridge.registerHandler('admin', (data, [level2]) => {
            if (level2 === 'connect' && data.windowID !== undefined) {
                possibleViews[currentIframe.id].windowID = data.windowID;
                possibleViews[currentIframe.id].id = currentIframe.id;
                currentIframe.resolve();
                if (possibleViews[currentIframe.id].data) {
                    IframeBridge.postMessage('tab.data', possibleViews[currentIframe.id].data, data.windowID);
                }
                tabStorage.save(currentIframe.id, possibleViews[currentIframe.id]);
            }
        });

        Tabs.on('openTab', this.doTab.bind(this));
        Tabs.on('status', this.setTabStatus.bind(this));
        Tabs.on('message', this.sendTabMessage.bind(this));
        Tabs.on('focus', this.focusTab.bind(this));

        this.state = {
            viewsList: [],
            activeTabKey: 0
        };

        for (var key in possibleViews) {
            possibleViews[key].id = key;
            this.doTab(possibleViews[key]);
        }

        this.loadTabs();
    }

    loadTabs() {
        var data = tabStorage.load();

        for (let i = 0; i < data.length; i++) {
            this.doTab(data[i]);
        }
    }

    setTabStatus(data) {
        // Find view with given window ID
        var ids = Object.keys(possibleViews);
        let id = ids.find(id => possibleViews[id].windowID === data.windowID);
        if (!id) return;
        let view = possibleViews[id];

        view = this.state.viewsList.find(el => el.id === view.id);
        if (!view) return;

        view.status = Object.assign({}, view.status, data.message);
        this.setState({
            viewsList: this.state.viewsList
        });
    }

    sendTabMessage(data) {
        const viewInfo = possibleViews[data.id];
        if (viewInfo) {
            IframeBridge.postMessage('tab.message', data.message, viewInfo.windowID);
        }
    }

    focusTab(tabId) {
        if (this.state.viewsList.find(el => el.id === tabId)) {
            this.setState({
                activeTabKey: tabId
            });
        }
    }

    doTab(obj) {
        if (!possibleViews[obj.id]) {
            possibleViews[obj.id] = {
                url: obj.url,
                data: obj.data,
                closable: obj.closable
            };
        } else {
            possibleViews[obj.id].data = obj.data;
        }

        if (conf.rewriteRules) {
            for (let i = 0; i < conf.rewriteRules.length; i++) {
                var rewriteRule = conf.rewriteRules[i];
                let url = possibleViews[obj.id].url;
                let reg = new RegExp(rewriteRule.reg);
                if(url.match(reg)) {
                    possibleViews[obj.id].rewrittenUrl = url.replace(reg, rewriteRule.replace);
                    break;
                }
            }
            if(!possibleViews[obj.id].rewrittenUrl) {
                console.warn('No rewrite rule matched the url');
            }
        }

        this.openView(obj.id);
    }

    openView(id) {
        var viewInfo = possibleViews[id];
        if (this.state.viewsList.find(el => el.id === id)) { // select tab with existing view
            this.setState({
                activeTabKey: id
            });
            if (viewInfo.data) {
                IframeBridge.postMessage('tab.data', viewInfo.data, viewInfo.windowID);
                tabStorage.save(id, viewInfo);
            }
        } else { // add a new View
            tabInit = tabInit.then(() => {
                return new Promise(resolve => {
                    if (this.state.viewsList.find(el => el.id === id)) {
                        console.warn('ignore open view...');
                        return resolve();
                    }
                    let view = {
                        id: id,
                        url: viewInfo.url,
                        rewrittenUrl: viewInfo.rewrittenUrl,
                        closable: viewInfo.closable
                    };
                    this.state.viewsList.push(view);
                    this.setState({
                        viewsList: this.state.viewsList,
                        activeTabKey: id
                    });
                    setTimeout(() => {
                        // This will have an effect only if Promise is not yet resolved
                        return resolve();
                    }, 3000);
                    currentIframe = {
                        resolve,
                        id
                    };
                });
            });
        }
    }

    removeTab(id) {
        tabStorage.remove(id);
        if (forbiddenPossibleViews.indexOf(id) === -1) {
            delete possibleViews[id];
        }
        let idx = this.state.viewsList.findIndex(el => el.id === id);
        if (idx === -1) return;
        this.state.viewsList.splice(idx, 1);

        var newActiveTab = 0;
        var viewsLength = this.state.viewsList.length;
        if (viewsLength > 0) {
            if (idx < viewsLength) {
                newActiveTab = this.state.viewsList[idx].id;
            } else {
                newActiveTab = this.state.viewsList[viewsLength - 1].id;
            }
        }

        this.setState({
            viewsList: this.state.viewsList,
            activeTabKey: newActiveTab
        });
    }


    onActiveTab(key) {
        if(key !== this.state.activeTabKey) {
            IframeBridge.postMessage('tab.focus', {}, possibleViews[key].windowID);
        }
        this.setState({
            activeTabKey: key
        });
    }

    render() {
        var arr = [];

        for (let view of this.state.viewsList) {
            var closable = view.closable === undefined ? true : view.closable;
            var saved = !view.status || view.status.saved === undefined ? true : view.status.saved;

            var textStyle = {};
            if (!saved) {
                textStyle.color = 'red';
            }
            arr.push(
                <Tab
                    title={<TabTitle textTitle={saved ? null : 'Not saved'} textStyle={textStyle} name={view.id} onTabClosed={closable ? this.removeTab.bind(this, view.id) : null} />}
                    key={view.id} eventKey={view.id}>
                    <Visualizer
                        fallbackVersion={conf.visualizerFallbackVersion || 'latest'}
                        cdn="https://www.lactame.com/visualizer"
                        viewURL={view.rewrittenUrl || view.url}
                        version={conf.visualizerVersion || 'auto'}
                        config={conf.visualizerConfig}
                        scripts={[iframeBridge]}
                        style={{position:'static', flex: 2, border: 'none'}}
                    />
                </Tab>
            );
        }

        return (
            <div className="visualizer-on-tabs-app">
                <Login></Login>
                <div className="visualizer-on-tabs-content">
                    <BTabs style={{flex: 2, display:'flex', flexFlow: 'column'}} activeKey={this.state.activeTabKey}
                           onSelect={this.onActiveTab.bind(this)} animation={false}>
                        {arr}
                    </BTabs>

                </div>
            </div>
        );
    }

}

export default App;
