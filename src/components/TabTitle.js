'use strict';

import React from 'react';
import {Glyphicon} from 'react-bootstrap';

class TabTitle extends React.Component {
    render() {
        console.log('render tab title', this.props)
        var closeHandle;
        if(this.props.onTabClosed) {
            closeHandle = <span>&nbsp;&nbsp;<Glyphicon className="close-tab-glyph" glyph="remove" onClick={this.onClosedClicked.bind(this)} /></span>
        } else {
            closeHandle = '';
        }

        return (
            <span title={this.props.textTitle} style={this.props.textStyle}>
                {this.props.name}
                {closeHandle}
            </span>

        );
    }

    onClosedClicked(event) {
        event.stopPropagation();
        event.preventDefault();
        if(this.props.onTabClosed) {
            this.props.onTabClosed.call();
        }
    }
}

export default TabTitle;
