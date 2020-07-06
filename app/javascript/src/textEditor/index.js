import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { convertToHTML } from 'draft-convert'

import {
  CompositeDecorator,
  EditorState,
  convertToRaw,
  convertFromRaw,
  createEditorState,
  getVisibleSelectionRect,
  SelectionState
} from 'draft-js'
import MultiDecorator from 'draft-js-multidecorators'

import Dante from "Dante2"
import DanteEditor from 'Dante2/package/es/components/core/editor.js'
import Icons from "Dante2/package/es/components/icons.js"

import { DanteImagePopoverConfig } from 'Dante2/package/es/components/popovers/image.js'
import { DanteAnchorPopoverConfig } from 'Dante2/package/es/components/popovers/link.js'
import { DanteInlineTooltipConfig } from 'Dante2/package/es/components/popovers/addButton.js' //'Dante2/package/es/components/popovers/addButton.js'
import { WidgetsLayoutConfig } from '../editor/components/popovers/widgetsLayout.js' //'Dante2/package/es/components/popovers/addButton.js'
 

import { DanteTooltipConfig } from '../editor/components/popovers/toolTip.js' //'Dante2/package/es/components/popovers/toolTip.js'

import { ImageBlockConfig } from './blocks/image'
import { EmbedBlockConfig } from 'Dante2/package/es/components/blocks/embed.js'
import { VideoBlockConfig } from 'Dante2/package/es/components/blocks/video.js'
import { PlaceholderBlockConfig } from 'Dante2/package/es/components/blocks/placeholder.js'
import { VideoRecorderBlockConfig } from './blocks/videoRecorder' //'Dante2/package/es/components/blocks/videoRecorder'
import { CodeBlockConfig } from 'Dante2/package/es/components/blocks/code'
import { DividerBlockConfig } from "Dante2/package/es/components/blocks/divider";
import { ButtonBlockConfig } from "../editor/components/blocks/button";

//import DanteEditor from "../editor/components/editor";

import Prism from 'prismjs';
import { PrismDraftDecorator } from 'Dante2/package/es/components/decorators/prism'

import { GiphyBlockConfig } from './blocks/giphyBlock'
//import { SpeechToTextBlockConfig } from '../campaigns/article/speechToTextBlock'
//import { DanteMarkdownConfig } from './article/markdown'
import Link from 'Dante2/package/es/components/decorators/link'
//import Link from '../editor/components/decorators/link'
import BlockAlignment from '../editor/components/decorators/blockAlignment'


import findEntities from 'Dante2/package/es/utils/find_entities'
import {ThemeProvider} from 'emotion-theming'
import EditorStyles from 'Dante2/package/es/styled/base'
import theme from './theme'
import styled from '@emotion/styled'
import CircularProgress from '@material-ui/core/CircularProgress';

import {getFileMetadata, directUpload} from '../shared/fileUploader'

import {
  CREATE_URL_UPLOAD,
CREATE_DIRECT_UPLOAD
} from '../graphql/mutations'

import graphql from '../graphql/client'
 
import {DanteSideTooltipConfig} from './blocks/DanteUserFieldsPopoverConfig'


const EditorStylesExtend = styled(EditorStyles)`

  line-height: ${(props)=> props.styles.lineHeight || '2em' };
  font-size: ${(props)=> props.styles.fontSize || '1.2em' };

  .graf--p{
    line-height: ${(props)=> props.styles.lineHeight || '2em' };
    font-size: ${(props)=> props.styles.fontSize || '1.2em' };
    margin-bottom: 0px;
  }

  .dante-menu{
    z-index: 2000;
  }

  blockquote {
    margin-left: 20px;
  }
  
  .dante-menu-input{
    background: #333333;
  }
` 

const customStyleMap = {
  'STRIKETHROUGH': {
    textDecoration: 'line-through',
  }
};

const defaultProps = {
  content: null,
  //read_only: false,
  spellcheck: false,
  title_placeholder: "Title",
  body_placeholder: "Write your story",

  default_wrappers: [
    { className: 'graf--p', block: 'unstyled' },
    { className: 'graf--h2', block: 'header-one' },
    { className: 'graf--h3', block: 'header-two' },
    { className: 'graf--h4', block: 'header-three' },
    { className: 'graf--blockquote', block: 'blockquote' },
    { className: 'graf--insertunorderedlist', block: 'unordered-list-item' },
    { className: 'graf--insertorderedlist', block: 'ordered-list-item' },
    { className: 'graf--code', block: 'code-block' },
    { className: 'graf--bold', block: 'BOLD' },
    { className: 'graf--italic', block: 'ITALIC' },
    { className: 'graf--divider', block: 'divider' }
  ],

  continuousBlocks: [
    "unstyled",
    "blockquote",
    "ordered-list",
    "unordered-list",
    "unordered-list-item",
    "ordered-list-item",
    "code-block"
  ],

  key_commands: {
      "alt-shift": [{ key: 65, cmd: 'add-new-block' }],
      "alt-cmd": [{ key: 49, cmd: 'toggle_block:header-one' },
                  { key: 50, cmd: 'toggle_block:header-two' },
                  { key: 53, cmd: 'toggle_block:blockquote' }],
      "cmd": [{ key: 66, cmd: 'toggle_inline:BOLD' },
              { key: 73, cmd: 'toggle_inline:ITALIC' },
              { key: 75, cmd: 'insert:link' },
              { key: 13, cmd: 'toggle_block:divider' }
      ]
  },

  character_convert_mapping: {
    '> ': "blockquote",
    '*.': "unordered-list-item",
    '* ': "unordered-list-item",
    '- ': "unordered-list-item",
    '1.': "ordered-list-item",
    '# ': 'header-one',
    '##': 'header-two',
    '==': "unstyled",
    '` ': "code-block"
  },

}


export default class ArticleEditor extends Component {

  constructor(props) {
    super(props)
    this.initialContent = this.defaultContent()
  }

  emptyContent = () => {
    return { 
      "entityMap": {},
      "blocks": [
        { 
          "key": "f1qmb", 
          "text": "", 
          "type": "unstyled", 
          "depth": 0, 
          "inlineStyleRanges": [], 
          "entityRanges": [], 
          "data": {} 
        }, 
      ] 
    }
  }

  defaultContent = () => {
    try {
      return JSON.parse(this.props.serializedContent) || this.emptyContent()
    } catch (error) {
      return this.emptyContent()
    }
  }


  imageFill = () => {
    return <svg id='icon-strikethrough' width="17" height="25" 
           shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" 
           fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 640 640">
           <path id="strikethrough" className="icon-fillcolor" fill="#B1B4C1" d="M503.711 0l5.079 203.849h-18.626c-8.623-51.119-30.024-92.233-64.206-123.486-34.181-31.099-70.973-46.642-110.694-46.642-30.638 0-54.957 8.161-72.816 24.626-18.012 16.323-26.953 35.256-26.953 56.658 0 13.394 3.236 25.56 9.555 36.024 8.61 14.174 22.63 28.182 41.87 41.883 14.174 10.004 46.809 27.567 97.927 52.807l10.701 5.386-213.676 37.513c-9.484-10.867-17.504-22.3-24.118-34.276-13.087-23.705-19.701-49.879-19.701-78.521 0-48.65 18.012-90.226 53.729-124.561C207.64 17.09 252.759 0 307.102 0c19.867 0 39.12 2.303 57.746 7.074 14.161 3.697 31.406 10.323 51.567 20.174 20.327 9.697 34.642 14.634 42.65 14.634 7.855 0 14.008-2.469 18.473-7.252 4.63-4.76 8.788-16.311 12.626-34.63h13.548zM61.099 332.154l504.349-88.548 13.453 76.572-504.337 88.56-13.465-76.584zm456.702 24.59c19.264 28.501 28.866 60.474 28.866 96.05 0 51.118-20.008 95.15-59.74 131.953C447.052 621.54 396.406 640 335.13 640c-19.24 0-37.572-1.996-54.663-5.847-17.079-4.004-38.646-11.386-64.512-22.17-14.469-6-26.327-8.917-35.552-8.917-7.854 0-16.17 2.918-24.791 8.918-8.776 6.012-15.863 15.248-21.249 27.567h-16.618V426.997l19.902-3.496c13.949 57.686 38.303 102.167 73.241 133.679 37.713 34.181 78.355 51.272 121.927 51.272 33.72 0 60.509-9.236 80.528-27.555 20.009-18.32 30.024-39.733 30.024-64.052 0-14.48-3.85-28.489-11.55-42.036-7.702-13.394-19.253-26.327-34.95-38.493-14.953-11.563-40.654-26.469-77.363-44.74l198.298-34.832z"></path>
           </svg> 

  }


  tooltipsConfig = () => {

    const inlineMenu = {
      selectionElements: [
        "unstyled",
        "blockquote",
        "ordered-list",
        "unordered-list",
        "unordered-list-item",
        "ordered-list-item",
        "code-block",
        'header-one',
        'header-two',
        'header-three',
        'header-four',
        'footer',
        'column',
        'jumbo', 
        'center',
        'STRIKETHROUGH',
      ],
      widget_options: {
        placeholder: "type a url",

        block_types: [
          { label: 'p', style: 'unstyled',  icon: Icons.bold },
          { label: 'h2', style: 'header-one', type: "block" , icon: Icons.h1 },
          { label: 'h3', style: 'header-two', type: "block",  icon: Icons.h2 },
          { label: 'h4', style: 'header-three', type: "block",  icon: Icons.h3 },

          { type: "separator" },
          { label: 'color', type: "color" },
          { type: "link" },

          { label: 'blockquote', style: 'blockquote', type: "block", icon: Icons.blockquote },
          { type: "separator" },
          { label: 'insertunorderedlist', style: 'unordered-list-item', type: "block", icon: Icons.insertunorderedlist },
          { label: 'insertorderedlist', style: 'ordered-list-item', type: "block", icon: Icons.insertunorderedlist },
          { type: "separator" },
          { label: 'code', style: 'code-block', type: "block",  icon: Icons.code },
          { label: 'bold', style: 'BOLD', type: "inline", icon: Icons.bold },
          { label: 'italic', style: 'ITALIC', type: "inline", icon: Icons.italic },
          { label: 'STRIKETHROUGH', style: 'STRIKETHROUGH', type: "inline", icon: this.imageFill },
          { type: "block-alignment", style: "left" },
          { type: "block-alignment", style: "center" },
          { type: "block-alignment", style: "right" },
        ]
      }
    }

    const menuConfig = Object.assign({}, DanteTooltipConfig(), inlineMenu)

    let items =  [
      DanteImagePopoverConfig(),
      DanteAnchorPopoverConfig(),
      DanteInlineTooltipConfig(),
      menuConfig, 
      //DanteMarkdownConfig()
    ]
    this.props.botConfigLayout ? items.push(WidgetsLayoutConfig()) : items.push(DanteInlineTooltipConfig())
    this.props.app ? items.push(DanteSideTooltipConfig({appUserFields: this.props.app.customFields })) : null

    return items

  }

  decorators = (context) => {
    return (context) => {
      return new MultiDecorator([
        PrismDraftDecorator({
          prism: Prism,
          defaultSyntax: 'javascript'
        }),
        new CompositeDecorator(
          [{
            strategy: findEntities.bind(null, 'LINK', context),
            component: Link
          }]
        ),
        //generateDecorator("hello")

      ])
    }
  }

  generateDecorator = (highlightTerm) => {
    const regex = new RegExp(highlightTerm, 'g');
    return new CompositeDecorator([{
      strategy: (contentBlock, callback) => {
        console.info("processing entity!", this.state.incomingSelectionPosition.length)
        if (this.state.incomingSelectionPosition.length > 0) {

          findSelectedBlockFromRemote(
            this.state.incomingSelectionPosition,
            contentBlock,
            callback
          )
        }
        /*if (highlightTerm !== '') {
          findWithRegex(regex, contentBlock, callback);
        }*/
      },
      component: this.searchHighlight,
    }])
  };


  setDisabled = (val)=>{
    this.props.setDisabled && this.props.setDisabled(val)
  }

  uploadHandler = (file, imageBlock)=>{
    if(!file){
      if(imageBlock.file && imageBlock.file.constructor.name === "Blob"){
        let blob = imageBlock.file
        //A Blob() is almost a File() - it's just missing the two properties below which we will add
        blob.lastModifiedDate = new Date();
        blob.name = 'recorded';
        return this.uploadFromFile(blob, imageBlock)
      }
      this.uploadFromUrl(file, imageBlock)
    } else {
      this.uploadFromFile(file, imageBlock)
    }    
  }

  uploadFromUrl = (file, imageBlock)=>{
    const url = imageBlock.props.blockProps.data.get("url")
    this.setDisabled(true)
    graphql(CREATE_URL_UPLOAD, {url: url} , {
      success: (data)=>{
        const {signedBlobId, headers, url, serviceUrl} = data.createUrlUpload.directUpload
        this.props.uploadHandler({signedBlobId, headers, url, serviceUrl, imageBlock})
        this.setDisabled(false)
      },
      error: ()=>{
        debugger
      }
    })
  }

  uploadFromFile = (file, imageBlock)=>{
    this.setDisabled(true)
    getFileMetadata(file).then((input) => {
      graphql(CREATE_DIRECT_UPLOAD, input, {
        success: (data)=>{
          const {signedBlobId, headers, url, serviceUrl} = data.createDirectUpload.directUpload
       
          directUpload(url, JSON.parse(headers), file).then(
            () => {
              this.setDisabled(false)
              this.props.uploadHandler({signedBlobId, headers, url, serviceUrl, imageBlock})
              /*
              graphql(ARTICLE_BLOB_ATTACH, { 
                appKey: this.props.app.key ,
                id: parseInt(this.state.article.id),
                blobId: signedBlobId
              }, {
                success: (data)=>{
                  imageBlock.uploadCompleted(serviceUrl)
                },
                error: (err)=>{
                  console.log("error on direct upload", err)
                }
              })*/
          });
        },
        error: (error)=>{
          this.setDisabled(false)
         console.log("error on signing blob", error)
        }
      })
    });
  }

  sidebarWidgetsConfig=() => {
    let widgets = [  
    ]   
  
    return widgets
  }
  
  widgetsConfig = () => {
    let widgets = [
      CodeBlockConfig(),
      ImageBlockConfig({
        options: {
          //upload_url: `/attachments.json?id=${this.props.data.id}&app_id=${this.props.app.key}`,
          upload_handler: this.uploadHandler,
          image_caption_placeholder: "type a caption (optional)"
        }
      }),
      DividerBlockConfig(),
      EmbedBlockConfig({
        breakOnContinuous: true,
        editable: true,
        options: {
          placeholder: "put an external links",
          endpoint: `/oembed?url=`
        }
      }),
      VideoBlockConfig({
        breakOnContinuous: true,
        options: {
          placeholder: "put embed link ie: youtube, vimeo, spotify, codepen, gist, etc..",
          endpoint: `/oembed?url=`,
          caption: 'optional caption'
        }
      }),
      PlaceholderBlockConfig(),
      VideoRecorderBlockConfig({
        options: {
          seconds_to_record: 20000,
          upload_handler: this.uploadHandler,
          //upload_url: `/attachments.json?id=${this.props.data.id}&app_id=${this.props.app.key}`,
        }
      }),
      GiphyBlockConfig(),
      //SpeechToTextBlockConfig(),
      ButtonBlockConfig()
    ]

    if(this.props.botConfigLayout){
      widgets = [ 
        ImageBlockConfig({
          options: {
            //upload_url: `/attachments.json?id=${this.props.data.id}&app_id=${this.props.app.key}`,
            upload_handler: this.uploadHandler,
            image_caption_placeholder: "type a caption (optional)"
          }
        }), 
        VideoBlockConfig({
          breakOnContinuous: true,
          options: {
            placeholder: "put embed link ie: youtube, vimeo, spotify, codepen, gist, etc..",
            endpoint: `/oembed?url=`,
            caption: 'optional caption'
          }
        }),
        PlaceholderBlockConfig(),
        VideoRecorderBlockConfig({
          options: {
            seconds_to_record: 20000,
            upload_handler: this.uploadHandler,
            //upload_url: `/attachments.json?id=${this.props.data.id}&app_id=${this.props.app.key}`,
          }
        }),
        GiphyBlockConfig()
    ] 

    }

    if(this.props.appendWidgets)
      widgets = widgets.concat(this.props.appendWidgets)

    return widgets
  
  }

  saveHandler = (context, content, cb) => {

    const exportedStyles = context.editor.styleExporter(context.editor.getEditorState())

    let convertOptions = {

      styleToHTML: (style) => {
        if (style === 'BOLD') {
          return <b />;
        }
        if (style === 'ITALIC') {
          return <i />;
        }
        if (style === 'STRIKETHROUGH') {
          return <del />;
        } 
        if (style === 'TEXTCENTER') {
          return <center />;
        } 
        if (style.includes("CUSTOM")) {
          const s = exportedStyles[style].style
          return <span style={s} />
        }
      },
      blockToHTML: (block, oo) => {

        if (block.type === "unstyled") {
          return <p className="graf graf--p" />
        }
        if (block.type === "header-one") {
          return <h1 className="graf graf--h2" />
        }
        if (block.type === "header-two") {
          return <h2 className="graf graf--h3" />
        }
        if (block.type === "header-three") {
          return <h3 className="graf graf--h4" />
        }
        if (block.type === "blockquote") {
          return <blockquote className="graf graf--blockquote" />
        }
        if (block.type === "button" || block.type === "unsubscribe_button") {
          const { href, buttonStyle, containerStyle, label } = block.data
          console.log("buttonblock", containerStyle);
          console.log("buttonblock", buttonStyle);

          const containerS = containerStyle ? styleString(containerStyle.toJS ? containerStyle.toJS() : containerStyle) : ''
          const buttonS = containerStyle ? styleString(buttonStyle.toJS ? buttonStyle.toJS() : buttonStyle) : ''
          return {
            start: `<div style="width: 100%; margin: 18px 0px 47px 0px">
                        <div 
                          style="${containerS}">
                          <a href="${href}"
                            className="btn"
                            target="_blank"
                            ref="btn"
                            style="${buttonS}">`,
            end: `</a>
                  </div>
                </div>`}
        }
        if (block.type === "card") {
          return {
            start: `<div class="graf graf--figure">
                  <div style="width: 100%; height: 100px; margin: 18px 0px 47px">
                    <div class="signature">
                      <div>
                        <a href="#" contenteditable="false">
                          <img src="${block.data.image}">
                          <div></div>
                        </a>
                      </div>
                      <div class="text" 
                        style="color: rgb(153, 153, 153);
                              font-size: 12px; 
                              font-weight: bold">`,
            end: `</div>
                    </div>
                  <div class="dante-clearfix"/>
                </div>
              </div>`
          }
        }
        if (block.type === "jumbo") {
          return {
            start: `<div class="graf graf--jumbo">
                  <div class="jumbotron">
                    <h1>` ,
            end: `</h1>
                  </div>
                </div>`
          }
        }
        if (block.type === "image") {
          const { width, height, ratio } = block.data.aspect_ratio.toJS ? block.data.aspect_ratio.toJS() : block.data.aspect_ratio
          const { url } = block.data
          
          return {
            start: `<figure class="graf graf--figure">
                  <div>
                    <div class="aspectRatioPlaceholder is-locked" style="max-width: 1000px; max-height: ${height}px;">
                      <div class="aspect-ratio-fill" 
                          style="padding-bottom: ${ratio}%;">
                      </div>

                      <img src="${url}" 
                        class="graf-image" 
                        contenteditable="false"
                      >
                    <div>
                  </div>

                  </div>
                  <figcaption class="imageCaption">
                    <span>
                      <span data-text="true">`,
            end: `</span>
                    </span>
                  </figcaption>
                  </div>
                </figure>`
          }
        }
        if (block.type === "column") {
          return <div class={`graf graf--column ${block.data.className}`} />
        }
        if (block.type === "footer") {

          return {
            start: `<div class="graf graf--figure"><div ><hr/><p>`,
            end: `</p></div></div>`
          }
        }

        if (block.type === "embed") {
          if (!block.data.embed_data)
            return

          let data = null

          // due to a bug in empbed component
          if (typeof (block.data.embed_data.toJS) === "function") {
            data = block.data.embed_data.toJS()
          } else {
            data = block.data.embed_data
          }

          if (data) {
            return <div class="graf graf--mixtapeEmbed">
              <span>
                {
                  data.images[0].url ?
                    <a target="_blank" class="js-mixtapeImage mixtapeImage"
                      href={block.data.provisory_text}
                      style={{ backgroundImage: `url(${data.images[0].url})` }}>
                    </a> : null 
                }
                <a class="markup--anchor markup--mixtapeEmbed-anchor"
                  target="_blank"
                  href={block.data.provisory_text}>
                  <strong class="markup--strong markup--mixtapeEmbed-strong">
                    {data.title}
                  </strong>
                  <em class="markup--em markup--mixtapeEmbed-em">
                    {data.description}
                  </em>
                </a>
                {data.provider_url}
              </span>
            </div>
          } else {
            <p />
          }
        }

        if (block.type === "video"){
          
          if (!block.data.embed_data)
            return

          let data = null

          // due to a bug in empbed component
          if (typeof (block.data.embed_data.toJS) === "function") {
            data = block.data.embed_data.toJS()
          } else {
            data = block.data.embed_data
          }

          return {
            start: `<figure class="graf--figure graf--iframe graf--first" tabindex="0">
                      <div class="iframeContainer">
                        ${data.html}
                      </div>
                      <figcaption class="imageCaption">
                        <div class="public-DraftStyleDefault-block public-DraftStyleDefault-ltr">
                          <span>
                          <span>
                          ${block.data.provisory_text}
                          </span>
                          </span>
                        </div>
                      </figcaption>
                    `,
            end: `</figure>`
          }
        }

        if (block.type === "recorded-video") {

          return (<figure className="graf--figure graf--iframe graf--first" tabindex="0">
                      <div className="iframeContainer">
                        <video 
                          autoplay={false} 
                          style={{width:"100%" }}
                          controls={true} 
                          src={block.data.url}>
                        </video>
                      </div>
                      <figcaption className="imageCaption">
                        <div className="public-DraftStyleDefault-block public-DraftStyleDefault-ltr">
                          <span>
                          {block.text}
                          </span>
                        </div>
                      </figcaption>
                   
            </figure> )
        }
        

        if ("atomic") {
          return <p />
        }

        if (block.type === 'PARAGRAPH') {
          return <p />;
        }
      },
      entityToHTML: (entity, originalText) => {
        if (entity.type === 'LINK') {
          return <a href={entity.data.url}>{originalText}</a>;
        }
        if (entity.type === 'block-alignment') {
          console.log("savealignment", entity.data.alignmentType);
          //const containerS = containerStyle ? styleString(entity.data.alignmentType.toJS ? containerStyle.toJS() : containerStyle) : ''
          return <div style={{textAlign: entity.data.alignmentType}}>{originalText}</div>;
        }
        return originalText;
      }
    }

    const currentContent = context.editorState().getCurrentContent()
    this.props.setDisabled && this.props.setDisabled(!currentContent.hasText())

    let html = convertToHTML(convertOptions)(currentContent)
    const serialized = JSON.stringify(content)
    const plain = context.getTextFromEditor(content)

    if(this.props.data.serialized_content === serialized)
      return

    this.props.updateState && this.props.updateState({
      status: "saving...",
      statusButton: "success",
      content: {
        html: html,
        serialized: serialized
      }
    })

    if (cb)
      cb(html3, plain, serialized)
  }

  decodeEditorContent = (raw_as_json) => {
    const new_content = convertFromRaw(raw_as_json)
    return EditorState.createWithContent(new_content)
  }


  render(){

      return <ThemeProvider theme={theme }>
           <EditorStylesExtend campaign={true} 
            styles={this.props.styles}>

             {
               !this.props.loading ?
             
                <DanteEditor
                  {...defaultProps}
                  customStyleMap= {customStyleMap} 
                  read_only={this.props.read_only}
                  toggleEditable={this.props.toggleEditable}
                  debug={false}
                  data_storage={
                    {
                      url: "/",
                      save_handler: this.saveHandler
                    }
                  }
                  onChange={(e) => {
                    this.dante_editor = e
                  }}
                  content={this.initialContent}
                  tooltips={this.props.tooltipsConfig ? this.props.tooltipsConfig() : this.tooltipsConfig() }
                  widgets={ this.props.widgetsConfig ? this.props.widgetsConfig() : this.widgetsConfig() }
                  sidebarWidgetsConfig={ this.sidebarWidgetsConfig() }
                  decorators={(context) => {
                    return new MultiDecorator([
                      //this.generateDecorator("hello"),
                      PrismDraftDecorator({ prism: Prism }),
                      new CompositeDecorator(
                        [{
                          strategy: findEntities.bind(null, 'LINK', context),
                          component: Link
                        }]
                      ),
                      new CompositeDecorator(
                        [{
                          strategy: findEntities.bind(null, 'block-alignment', context),
                          component: BlockAlignment
                        }]
                      ),


                    ])
                  }
                  }
                /> : <CircularProgress/>
            }

           </EditorStylesExtend>
         </ThemeProvider>

  }


}

const styleString = (style) => {
  console.log("button", style);
  return Object.entries(style).map(([k, v]) => {
    k = k.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
    //if(k == "font-size" && !v.includes("px")){
    //  v = v + "px";
    //}
    return `${k}:${v}`
  }).join(';')

}
