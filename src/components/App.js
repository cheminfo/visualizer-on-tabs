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
import {rewriteURL} from '../util';


const conf = require('../config/config.js');
const loadHidden = conf.loadHidden || false;


const possibleViews = conf.possibleViews;
const forbiddenPossibleViews = Object.keys(possibleViews);

let tabInit = Promise.resolve();
let currentIframe;

function getParameterByName(name) {
    const match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

class App extends React.Component {
    constructor() {
        super();

        IframeBridge.registerHandler('tab', iframeMessageHandler);
        IframeBridge.registerHandler('admin', (data, [level2]) => {
            if (level2 === 'connect' && data.windowID !== undefined) {
                possibleViews[currentIframe.id].windowID = data.windowID;
                currentIframe.resolve();
            }
        });

        Tabs.on('openTab', (obj) => {
            const options = {};
            ['noFocus', 'noFocusEvent', 'noData'].forEach(prop => {
                options[prop] = obj[prop];
                delete obj[prop];
            });
            this.doTab(obj, options);
        });
        Tabs.on('status', this.setTabStatus.bind(this));
        Tabs.on('message', this.sendTabMessage.bind(this));
        Tabs.on('focus', this.focusTab.bind(this));

        this.visualizerVersion = getParameterByName('v');

        this.state = {
            viewsList: [],
            activeTabKey: 0
        };

        this.loadTabs();
    }

    async loadTabs() {
        let firstTab;
        const loadTab = async (view) => {
            if(!firstTab) firstTab = view.id;
            await this.doTab(view, {
                noFocus: !loadHidden,
                noFocusEvent: true
            });
        };
        const data = tabStorage.load();
        // Load possible views first
        for (let key in possibleViews) {
            possibleViews[key].id = key;
            let saved;
            if(saved = data.find(el => el.id === key)) {
               await loadTab(saved);
            } else {
                await loadTab(possibleViews[key]);
            }
        }

        for (let i = 0; i < data.length; i++) {
            if(!possibleViews[data[i].id]) {
                await loadTab(data[i]);
            }
        }

        if(!loadHidden) {
            // Nothing is focused at this point
            await this.showTab(firstTab);
        }

    }

    setTabStatus(data) {
        // Find view with given window ID
        const ids = Object.keys(possibleViews);
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

    async focusTab(tabId) {
        if (this.state.viewsList.find(el => el.id === tabId)) {
            await this.showTab(tabId, {
                noData: true
            });
        }
    }

    async doTab(obj, options) {
        if (!possibleViews[obj.id]) {
            possibleViews[obj.id] = {
                id: obj.id,
                url: obj.url,
                data: obj.data,
                closable: obj.closable
            };
        } else {
            possibleViews[obj.id].data = obj.data;
        }

        if (conf.rewriteRules) {
            let newURL = rewriteURL(conf.rewriteRules, possibleViews[obj.id].url);
            if (newURL) {
                possibleViews[obj.id].rewrittenUrl = newURL;
            }
        }

        await this.showTab(obj.id, options);
    }

    async showTab(id, options) {
        options = options || {};
        const sameTab = this.state.activeTabKey === id;
        if(sameTab && !options.force) return;

        const noFocus = options.noFocus;
        let viewFromList = this.state.viewsList.find(el => el.id === id);
        const newTab = !viewFromList;
        const viewInfo = possibleViews[id];

        if (!viewInfo) throw new Error('unreachable');
        if (!viewFromList) {
            viewFromList = {
                id: id,
                url: viewInfo.url,
                rewrittenUrl: viewInfo.rewrittenUrl,
                closable: viewInfo.closable
            };
            this.state.viewsList.push(viewFromList)
        }
        const firstRender = !noFocus && (newTab || !viewFromList.rendered);

        await tabInit;
        if (firstRender) { // We should map the tab id with the window ID generated by IframeBridge
            tabInit = new Promise(resolve => {
                viewFromList.rendered = true;
                this.setState({
                    activeTabKey: id,
                    viewsList: this.state.viewsList
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
            await tabInit;
        } else { // Either it has already been renderer, or it is not to be focused
            if (noFocus) {
                this.setState({
                    viewsList: this.state.viewsList
                });
            } else {
                this.setState({
                    activeTabKey: id
                });
            }
        }
        if (viewInfo.data && (!options.noData || firstRender)) { // always send data on first render
            IframeBridge.postMessage('tab.data', viewInfo.data, viewInfo.windowID);
        }
        tabStorage.save(id, viewInfo);

        if(!options.noFocusEvent && !sameTab) {
            this.sendTabFocusEvent();
        }

}

    async removeTab(id) {
        tabStorage.remove(id);
        if (forbiddenPossibleViews.indexOf(id) === -1) {
            delete possibleViews[id];
        }
        let idx = this.state.viewsList.findIndex(el => el.id === id);
        if (idx === -1) return;
        this.state.viewsList.splice(idx, 1);

        let newActiveTab;
        if(id !== this.state.activeTabKey) {
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
            force: true
        });
    }

    sendTabFocusEvent() {
        const key = this.state.activeTabKey;
        if(possibleViews[key]) {
            IframeBridge.postMessage('tab.focus', {}, possibleViews[key].windowID);
        }
    }

    async onActiveTab(key) {
        await this.showTab(key, {
            noData: true
        });
    }

    render() {
        const arr = [];

        for (let view of this.state.viewsList) {
            const closable = view.closable === undefined ? true : view.closable;
            const saved = !view.status || view.status.saved === undefined ? true : view.status.saved;

            const textStyle = {};
            if (!saved) {
                textStyle.color = 'red';
            }
            const shouldRender = view.rendered || view.id === this.state.activeTabKey;
            arr.push(
                <Tab
                    title={<TabTitle textTitle={saved ? null : 'Not saved'} textStyle={textStyle} name={view.id}
                                     onTabClosed={closable ? this.removeTab.bind(this, view.id) : null}/>}
                    key={view.id} eventKey={view.id}>
                    {shouldRender ?
                        <Visualizer
                            fallbackVersion={conf.visualizerFallbackVersion || 'latest'}
                            cdn="https://www.lactame.com/visualizer"
                            viewURL={view.rewrittenUrl || view.url}
                            version={this.visualizerVersion || conf.visualizerVersion || 'auto'}
                            config={conf.visualizerConfig}
                            scripts={[iframeBridge]}
                            style={{position: 'static', flex: 2, border: 'none'}}
                        />
                        : <div>Not rendered</div> }
                </Tab>
            );
        }

        return (
            <div className="visualizer-on-tabs-app">
                <Login></Login>
                <div className="visualizer-on-tabs-content">
                    <BTabs style={{flex: 2, display: 'flex', flexFlow: 'column'}} activeKey={this.state.activeTabKey}
                           onSelect={this.onActiveTab.bind(this)} animation={false}>
                        {arr}
                    </BTabs>

                </div>
            </div>
        );
    }

}

export default App;
