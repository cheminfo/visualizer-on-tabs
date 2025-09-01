import React from 'react';

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
    let closeHandle;
    if (this.props.onTabClosed) {
      closeHandle = (
        <span className="close-tab-glyph" onClick={this.onClosedClicked}>
          ×
        </span>
      );
    } else {
      closeHandle = '';
    }

    return (
      <div
        title={this.props.textTitle}
        style={this.props.textStyle}
        className="d-flex flex-row gap-2 align-items-baseline"
      >
        {this.props.name}
        {closeHandle}
      </div>
    );
  }
}

export default TabTitle;
