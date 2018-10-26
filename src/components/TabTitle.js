import React from 'react';
import { Glyphicon } from 'react-bootstrap';

class TabTitle extends React.Component {
  constructor(props) {
    super(props);
    this.onClosedClicked = this.onClosedClicked.bind(this);
  }
  onClosedClicked(event) {
    event.stopPropagation();
    event.preventDefault();
    if (this.props.onTabClosed) {
      this.props.onTabClosed.call();
    }
  }

  render() {
    var closeHandle;
    if (this.props.onTabClosed) {
      closeHandle = (
        <span>
          &nbsp;&nbsp;
          <Glyphicon
            className="close-tab-glyph"
            glyph="remove"
            onClick={this.onClosedClicked}
          />
        </span>
      );
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
}

export default TabTitle;
