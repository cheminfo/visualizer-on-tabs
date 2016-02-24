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


        this.state = {
            viewsList: [],
            activeTabKey: 0
        };

        for(var key in possibleViews) {
            this.openView(key);
        }

        this.loadTabs();
    }

    loadTabs() {
        var data = tabStorage.load();

        for (let i = 0; i < data.length; i++) {
            this.doTab(data[i]);
        }
    }



    doTab(obj) {
        if (!possibleViews[obj.id]) {
            if(conf.rewriteRules) {
                for(let i=0; i<config.rewriteRules.length; i++) {
                    var rewriteRule = config.rewriteRules[i];
                    obj.url = obj.url.replace(new RegExp(rewriteRule.reg), rewriteRule.replace);
                }
            }
            possibleViews[obj.id] = {
                url: obj.url,
                data: obj.data,
                closable: obj.closable
            };
        } else {
            possibleViews[obj.id].data = obj.data;
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
        this.setState({
            activeTabKey: key
        });
    }

    render() {
        var arr = [];

        for (let view of this.state.viewsList) {
            var closable = view.closable === undefined ? true : view.closable;
            arr.push(
                <Tab
                    title={<TabTitle name={view.id} onTabClosed={closable ? this.removeTab.bind(this, view.id) : null} />}
                    key={view.id} eventKey={view.id}>
                    <Visualizer
                        cdn="https://www.lactame.com/visualizer"
                        viewURL={view.url}
                        version="auto"
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
