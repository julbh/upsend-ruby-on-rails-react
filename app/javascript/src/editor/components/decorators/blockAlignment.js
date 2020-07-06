import React from 'react'
import { Entity } from 'draft-js'

export default class BlockAlignment extends React.Component {

  constructor(props) {
    super(props)
  }

 
 
  render() {
    this.data = this.props.contentState.getEntity(this.props.entityKey).getData()
    const alignmentType = this.data.alignmentType;
    let styleString = { textAlign: alignmentType}
    return (
      <div
        style={ styleString }
      >
        { this.props.children }
      </div>
    )
  }
}

