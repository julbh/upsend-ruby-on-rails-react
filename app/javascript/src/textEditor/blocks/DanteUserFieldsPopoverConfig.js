// import React from 'react' 
import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles'; 

import {
  addNewBlock,
  resetBlockWithType,
  getCurrentBlock
} from '../../editor/model/index.js'

import {
  getVisibleSelectionRect
} from 'draft-js'

import { EditorState, Modifier, ContentBlock, genKey, CharacterMetadata, BlockMapBuilder } from 'draft-js';

import { List, Repeat } from 'immutable';
import ListItem from '@material-ui/core/ListItem'; 
import ListItemText from '@material-ui/core/ListItemText'; 
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'; 
import Avatar from '@material-ui/core/Avatar';
import AddCircleOutlineRoundedIcon from '@material-ui/icons/AddCircleOutlineRounded';
import AddCircleSharpIcon from '@material-ui/icons/AddCircleSharp';

import { getSelectionRect,
  getSelection,
  getSelectedBlockNode,
  getRelativeParent } from "../../editor/utils/selection.js"

import {InlinetooltipWrapper} from 'Dante2/package/es/styled/base'
 
import CodeIcon from '@material-ui/icons/Code';
import CodeOutlinedIcon from '@material-ui/icons/CodeOutlined';
import CloseIcon from '@material-ui/icons/Close';

import styled from '@emotion/styled'

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';

 
function tooltipCodeIcon(){
  return <svg width='24' height='23' viewBox='0 0 34 31' xmlns='http://www.w3.org/2000/svg'>
            <path d='M15.512,11.828 L5.236,15.916 L15.512,20.004 L15.512,23.196 L1.288,17.568 L1.288,14.264 L15.512,8.608 L15.512,11.828 Z M19.392,20.004 L29.668,15.916 L19.392,11.828 L19.392,8.608 L33.616,14.264 L33.616,17.568 L19.392,23.196 L19.392,20.004 Z'
            id='&lt;-&gt;' className="icon-fillcolor" fill="#FFB600" />
          </svg>
}
 

export default class DanteSideTooltip extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      position: { top: 0, left: 0 },
      show: false,
      scaled: false,
      scaledWidth: 0,
      showPopup: false,
      appUserFields: this.props.configTooltip.appUserFields
    }
    this.initialPosition = 0 
  }

  componentDidMount(){
    this.initialPosition = this.refs.tooltip.offsetLeft
  }

  componentDidUnMount(){
    this.initialPosition = this.refs.tooltip.offsetLeft
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    return this.collapse()
  }

  display =(b)=> {
    if (b) {
      return this.show()
    } else {
      return this.hide()
    }
  }

  show = ()=> {
    return this.setState({
      show: true })
  }

  hide = ()=> {
    return this.setState({
      show: false })
  }

  setPosition =(coords)=> {
    return this.setState({
      position: coords })
  }

  _toggleScaled =(ev)=> {
    ev.preventDefault()
    if (this.state.scaled) {
      return this.collapse()
    } else {
      return this.scale()
    }
  }

  scale = ()=> {
    if(this.state.scaled){
      return
    }
    return this.setState({
      scaled: true }, ()=>{
        this.setState({scaledWidth: 300})
      })
  }

  collapse = ()=> {
    if(!this.state.scaled){
      return
    }
    return this.setState({
      scaled: false }, ()=>{
        setTimeout(()=>{
          this.setState({scaledWidth: 0})
        }, 300)

      })
  }

  activeClass = ()=> { 
    if (this.isActive()) {
      return "is-active"
    } else {
      return ""
    }
  }

  isActive = ()=> {
    return this.state.show
  }

  scaledClass = ()=> {
    if (this.state.scaled) {
      return "is-scaled"
    } else {
      return ""
    }
  }
 

  showPopup = () => {
     this.setState({showPopup: true});  
  }
  hidePopup = () => { 
     this.setState({showPopup: false}); 
     this.props.editor.focus = true; 
     this.relocate();  
  }

  insertText = (text) => {
    this.hidePopup()  
    const { block, blockProps, editorState } = this.props 
    const currentContent = editorState.getCurrentContent(),
          currentSelection = editorState.getSelection();

    const newContent = Modifier.replaceText(
      currentContent,
      currentSelection,
      text
    );

    const newEditorState = EditorState.push(editorState, newContent, 'insert-characters');   
    this.props.onChange(EditorState.forceSelection(newEditorState, newContent.getSelectionAfter())); 
  }


  handleInsertion = (e)=>{  
    this.showPopup();   

  }

  widgets = ()=> {
    return this.props.editor.props.sidebarWidgetsConfig
  }

  clickHandler =(e, type)=> {
 
    let request_block = this.widgets().find(o => o.type === type)

    switch (request_block.widget_options.insertion) {
      case "insertion":
        return this.handleInsertion(request_block)
      default:
        return console.log(`WRONG TYPE FOR ${ request_block.widget_options.insertion }`)
    }
  }

  getItems = ()=> {
    return this.widgets().filter(o => {
      return o.widget_options ? o.widget_options.displayOnInlineTooltip : null
    })
  }

  isDescendant =(parent, child)=> {
    let node = child.parentNode
    while (node !== null) {
      if (node === parent) {
        return true
      }
      node = node.parentNode
    }
    return false
  }

  relocate = ()=>{

    if(!this.props.editor.focus)
      return this.hide()

    const { editorState } = this.props
    const currentBlock = getCurrentBlock(this.props.editorState)
    const blockType = currentBlock.getType()
    const block = currentBlock

    if (!editorState.getSelection().isCollapsed()){
      return
    }

    // display tooltip only for unstyled

    let nativeSelection = getSelection(window)
    if (!nativeSelection.rangeCount) {
      return
    }

    let selectionRect = getSelectionRect(nativeSelection)

    let parent = ReactDOM.findDOMNode(this.props.editor)

    // hide if selected node is not in editor
    if (!this.isDescendant(parent, nativeSelection.anchorNode)) {
      this.hide()
      return
    }

    const relativeParent = getRelativeParent(this.refs.tooltip.parentElement);
    const toolbarHeight = this.refs.tooltip.clientHeight;
    const toolbarWidth = this.refs.tooltip.clientWidth;
    const relativeRect = (relativeParent || document.body).getBoundingClientRect();


    if(!relativeRect || !selectionRect)
      return

    let top = (selectionRect.top - relativeRect.top) - (toolbarHeight/5)
    let left = (selectionRect.left - relativeRect.left + (selectionRect.width/2) ) - (toolbarWidth*1.3)
    let right = (selectionRect.right - relativeRect.right + (selectionRect.width/2) ) - (toolbarWidth*1.3)

    if (!top || !left) {
      return
    }

    const selection = document.getElementsByClassName("is-selected")[0]
    if(selection){

      const selectionRectBox = selection.getBoundingClientRect()
   
      
      console.log(relativeRect);

      //this.display(block.getText().length === 0 && blockType === "unstyled")
      this.display(true);
      this.setPosition({
        top: top , //+ window.scrollY - 5,
        left: selectionRectBox.right + 35
        //show: block.getText().length === 0 && blockType === "unstyled"
      })
    }
  }


  handleClose = (value) => { 
    this.insertText(value);
  };
 
 


  render(){   
    return (
      <React.Fragment>  
      { this.state.showPopup ? <MergeFieldsBlock insertText={this.insertText} hidePopup={this.hidePopup} appUserFields={this.state.appUserFields} /> :
      
        <InlinetooltipWrapper
          ref="tooltip"
          className={ `inlineTooltip is-active ${ this.activeClass() } ${ this.scaledClass() }` }
          style={ this.state.position }
        >
          <button
            type="button"
            className = "inlineTooltip-button control tooltip-black"
            title="Close Menu"
            data-action="inline-menu"
            onMouseDown={ (e) => {
              //e.preventDefault()
              this.handleInsertion(e)
            }}
            style={{border: '1px solid #FFB600', background: '#FFB600'}}
          >
            {tooltipCodeIcon()}
          </button>
          <div
             className="inlineTooltip-menu"
             style={ { width: `${ this.state.scaledWidth }px` } }
           >
            { this.getItems().map( (item, i) => {
              return  <SideTooltipItem
                        item={ item }
                        key={ i }
                        clickHandler={ this.clickHandler }
                      />
              })
            }
         
              <input
                type="file"
                accept="image/*"
                style={ { display: 'none' } }
                ref="fileInput"
                multiple="multiple"
                onChange={ this.handleFileInput }
              />
            
          </div>
        </InlinetooltipWrapper>
      }
      </React.Fragment>

    )
  }
}






class SideTooltipItem extends React.Component {

  clickHandler = (e)=> {
    e.preventDefault()
    return this.props.clickHandler(e, this.props.item.type)
  }

  render() {
    return (
      <button
        type="button"
        className="inlineTooltip-button scale"
        title={ this.props.title }
        onMouseDown={ this.clickHandler }
        onClick={(e)=> e.preventDefault()}
        style={{fontSize: '21px'}}
      >
      {
        <span className={ 'tooltip-icon'}>
          {this.props.item.icon()}
        </span>
      }
      </button>
    )
  }
}

export const DanteSideTooltipConfig = (options={})=>{

  let config = {
    ref: 'add_field_tooltip',
    component: DanteSideTooltip
  }
  return Object.assign(config, options)
}







class MergeFieldsBlock extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      embed_data: this.defaultData(),
      open: true,
      userFields: this.props.appUserFields || [],
    }
  }
 

  defaultData =() =>{
    return {} 
  } 

  selectField = (o)=>{ 
    const {name} = o;
    const key = `{{${name}}}`
    this.props.insertText(key);

  }
 
  render(){ 
    return <React.Fragment>
          
              <Dialog
                open={this.state.open} 
                onClose={()=>{
                  this.setState({
                    open: !this.state.open
                  }, this.props.hidePopup() ) 
                }}
                maxWidth={'sm'}
                fullWidth={false}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">
                  User Fields
                </DialogTitle>
                
                <DialogContent>
                  <DialogContentText id="alert-dialog-description"> 
                    
                    {
                      this.state.userFields && this.state.userFields.map((o,index) => (
                     
                          <ListItem button  onClick={(e)=>(this.selectField(o))} key={`user-field-${index}`}>
                            <ListItemIcon> <AddCircleSharpIcon color="primary" fontSize="small"/> </ListItemIcon>
                            <ListItemText primary={o.name} color="primary" />
                          </ListItem>
                       
                      
                      ))
                    }


                  </DialogContentText>
                </DialogContent>
        
                <DialogActions>
                  
                </DialogActions>
        
              </Dialog>     
          </React.Fragment>
  }
} 
