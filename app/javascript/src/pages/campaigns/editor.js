import React, { Component } from "react";
import { isEmpty } from "lodash";
import graphql from "../../graphql/client";
import { CREATE_CAMPAIGN, UPDATE_CAMPAIGN, DELIVER_CAMPAIGN, TEST_CAMPAIGN } from "../../graphql/mutations";
import TextEditor from "../../textEditor";
import styled from "@emotion/styled";
import { ThemeProvider } from "emotion-theming";
import theme from "../../textEditor/theme";
import EditorContainer from "../../textEditor/editorStyles";
import StatusBadge from '../../components/StatusBadge';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import {TestEmailDialog} from './test_email';
import {errorMessage, successMessage} from '../../actions/status_messages'
import Logo_B from "../../../../assets/images/logo/Logo_B.png";
import { makeStyles } from '@material-ui/core/styles';
import {setCampaignsNeedToUpdateCount} from '../../actions/campaigns'

const useStyles = makeStyles(theme => ({
  textfield: {
    padding: '5px',
    width: '197px'
  }
}))

const ButtonsContainer = styled.div`
  display: flex;
  direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  float: right;
  margin: 4px 4px;
`;

const ButtonsRow = styled.div`
  align-self: flex-end;
  clear: both;
  margin: 0px;
  button {
    margin-right: 2px;
  }
`;

const BrowserSimulator = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  background: #fafafa;
  border: 1px solid #dde1eb;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  max-width: 680px;
  margin: auto;
  margin-top: 50px;
  margin-bottom: 50px;
  input{
    max-width: 800px;
    padding-left: 10px;
  }
  .mail-compaign-footer {
    padding: 0 10px;
  }
`;
const BrowserSimulatorHeader = styled.div`
  background: rgb(250, 247, 242);
  border-bottom: 1px solid #ececec;
  padding: 16px;
  display: flex;
`;
const BrowserSimulatorButtons = styled.div`
  display: flex;
  justify-content: space-between;
  width: 74px;

  .r {
    width: 30px;
    height: 6px;
    margin-right: 6px;
    border-radius: 4px;
    background-color: #fc635e;
    border: 1px solid #dc4441;
  }
  .y {
    width: 30px;
    height: 6px;
    margin-right: 6px;
    border-radius: 4px;
    background-color: #fdbc40;
    border: 1px solid #db9c31;
  }
  .g {
    width: 30px;
    height: 6px;
    margin-right: 6px;
    border-radius: 4px;
    background-color: #35cd4b;
    border: 1px solid #24a732;
  }
`;

const UnsubscriptionLinkInfoSection = styled.div`
  display: flex;
  justify-content: space-between;
  #unsubscriptionLinkInfoWrapper {
    margin-top: 10px;
    margin-right: 10px;
    #unsubscriptionLinkInfoHeading {
      color: grey;
    }
    .change-link {
      margin-left: 5px;
    }
    input[type='radio'] {
      display: inline;
      margin: 0 10px;
    }
  }
`;

const EditorPad = styled.div`
  ${(props) =>
    props.mode === "user_auto_messages"
      ? ` display:flex;
      justify-content: flex-end;
      flex-flow: column;
      height: 90vh;

      .postContent {
        height: 440px;
        overflow: auto;
      }
    `
      : `
      padding: 2em;
      background-color: white;

      @media all and (min-width: 1024px) and (max-width: 1280px) {
        margin: 8em;
      }

      @media (max-width: 640px){
        margin: 2em;
      }
      
    `}
`;

const EditorContentWrapper = styled.div`
  padding: 0 50 50px;
  border: solid 1px rgba(0,0,0,0.12);
  border-radius: 4px;
`;

const EditorContentWrapper1 = styled.div`
  margin: 20px !important;
  border: solid 1px rgba(0,0,0,0.12);
  border-radius: 4px;
`;

const EditorHead = styled.div`
  display: flex;
  fontWeight: 600;
  align-items: center; 
  border-bottom: 1px solid rgba(0,0,0,.125);
  padding: 20px 40px !important;
  input, .MuiSelect-selectMenu{
    padding: 5px;
    width: 197px;
  }
  ${(props) => props.justify ? `justify-content: ${props.justify};` : `justify-content: space-between;`}
`;

const EditorFooter = styled.div`
  display: flex;
  fontWeight: 600;
  align-items: center; 
  border-top: 1px solid rgba(0,0,0,.125);
  padding: 20px 40px !important;
  ${(props) => props.justify ? `justify-content: ${props.justify};` : `justify-content: space-between;`}
  background: #fff;
`; 

const EditorMessengerEmulator = styled.div`
  ${(props) =>
    props.mode === "user_auto_messages"
      ? `
  display:flex;
  justify-content: flex-end;`
      : ``}
`;

const EditorMessengerEmulatorWrapper = styled.div`
  ${(props) =>
    props.mode === "user_auto_messages"
      ? `width: 380px;
    background: #fff;
    border: 1px solid #f3efef;
    margin-bottom: 25px;
    margin-right: 20px;
    box-shadow: 3px 3px 4px 0px #b5b4b4;
    border-radius: 10px;
    padding: 12px;
    padding-top: 0px;
    .icon-add{
      margin-top: -2px;
      margin-left: -2px;
    }
    `
      : ``}
`;

const EditorMessengerEmulatorHeader = styled.div`
  ${(props) =>
    props.mode === "user_auto_messages"
      ? `
  padding: 1em;
  border-bottom: 1px solid #ccc;
  `
      : ``}
`;

const MailCompaignFooterContainer = styled.div`
  text-align: center;
  text-align: -webkit-center;
`;

const MailCompaignFooter = styled.div`
  .plain-template-footer {
    .heading1 {
      text-align: left;
      color: grey;
      font-size: 14px;
    }
  }
  .company-template-footer {
    .heading1 {
      color: grey;
      margin-bottom: 20px;
    }
  }
`;

const MailCompaignFooterBottom = styled.div`
margin-top: 50px;
color: grey;
`;

function TextStyle(props){
  const classes = useStyles();
  return(
    <TextField
      className = {classes.textfield}
      variant={props.variant}
      label={props.label}
      defaultValue={props.defaultValue}
      disabled={props.disabled}
    /> 
  )
}

export default class CampaignEditor extends Component {
  constructor(props) {
    super(props);

    this.ChannelEvents = null;
    this.conn = null;
    this.menuResizeFunc = null;
    this.state = {
      loading: true,
      currentContent: null,
      diff: "",
      videoSession: false,
      selectionPosition: null,
      incomingSelectionPosition: [],
      data: {},
      errors: {},
      status: "",
      read_only: false,
      statusButton: "inprogress",
      testEmailDialog: false,
      campaignStoryParams: {},
      html_content: '',
      serialized_content: '',
      template: props.data.template || 'plain',
      template_was: props.data.template || 'plain',
      subject: this.props.data.subject,
      canSendTestEmail: this.props.data.id != undefined,
      showUnsubscriptionOptions: false,
      includeUnsubscriptionLink: true,
      footerAddress: '3503 Jack Northrop Ave - Hawthorne, CA 90250',
      editModeFooterAddress: false,
      helpEmail: 'help@projectxyz.com',
      editModeHelpEmail: false,
      helpContact: '1(800)232-90-26',
      editModeHelpContact: false
    };

  }

  saveContent = (content) => {
    if (this.props.data.serializedContent === content.serialized) return;
    this.setState({
      status: "saving...",
      statusButton: "success",
      html_content: content.html,
      serialized_content: content.serialized
    });
  }

  updateOrCreate = () => {
    this.setcampaignParams();
    if(this.props.data.id == null){
      graphql(
        CREATE_CAMPAIGN,
        {
          appKey: this.props.app.key,
          mode: this.props.mode,
          operation: "create",
          campaignParams: {
            id: this.props.data.id,
            name: this.state.subject,
            subject: this.state.subject,
            from_name: this.props.currentUser.firstName,
            from_email: this.props.currentUser.email,
            reply_email: this.props.app.emailForwardingAddress,
            template: this.state.template,
            html_content: this.state.html_content,
            serialized_content: this.state.serialized_content,
          }
        },
        {
          success: (data) => {
            this.setState({
              data: data.campaignCreate.campaign,
              errors: data.campaignCreate.errors
            });
            if(isEmpty(this.state.errors)){
              this.props.dispatch(successMessage("Email saved successfully."))
              this.props.dispatch(setCampaignsNeedToUpdateCount())
            }else{
              const errs = []
              Object.entries(this.state.errors).map((key) => {
                errs.push(key[0] + ' ' + key[1].join(', '))
              })
              this.props.dispatch(errorMessage(errs.join(', ')))
            }
          }
        },
      )
    } else {
      graphql(UPDATE_CAMPAIGN, {
        appKey: this.props.app.key,
        id: this.props.data.id,
          campaignParams: {
            id: this.props.data.id,
            name: this.state.subject,
            subject: this.state.subject,
            from_name: this.props.currentUser.firstName,
            from_email: this.props.currentUser.email,
            reply_email: this.props.app.emailForwardingAddress,
            template: this.state.template,
            html_content: this.state.html_content,
            serialized_content: this.state.serialized_content,
          }
      },
      {
        success: (data) => {
          const result = data.campaignUpdate;
          this.setState({ data: result.campaign, errors: result.errors });
          if(isEmpty(this.state.errors)){
            this.props.dispatch(successMessage("Email saved successfully."))
            this.props.dispatch(setCampaignsNeedToUpdateCount())
          }else{
            const errs = []
            Object.entries(this.state.errors).map((key) => {
              errs.push(key[0] + ' ' + key[1].join(', '))
            })
            this.props.dispatch(errorMessage(errs.join(', ')))
          }
        },
        error: (error) => {
          console.log(error)
        },
      });
    }
  };

  saveHandler = (html3, plain, serialized) => {
    debugger;
  };

  uploadHandler = ({ serviceUrl, imageBlock }) => {
    imageBlock.uploadCompleted(serviceUrl);
  };

  handleSend = (e) => {
    const params = {
      appKey: this.props.app.key,
      id: this.props.data.id,
    };

    graphql(DELIVER_CAMPAIGN, params, {
      success: (data) => {
        this.props.updateData(data.campaignDeliver.campaign, null);
        this.setState({ status: "saved" });
      },
      error: () => {},
    });
  };

  setcampaignParams = () => {
    this.setState({
      campaignParams: {
        id: this.props.data.id,
        name: this.state.subject,
        subject: this.state.subject,
        from_name: this.props.currentUser.firstName,
        from_email: this.props.currentUser.email,
        reply_email: this.props.app.emailForwardingAddress,
        template: this.state.template,
        html_content: this.state.html_content,
        serialized_content: this.state.serialized_content,
        includeUnsubscriptionLink: this.state.includeUnsubscriptionLink,
        footerAddress: this.state.footerAddress,
        helpEmail: this.state.helpEmail,
        helpContact: this.state.helpContact
      }
    });
  }

  testEmailDialogOpen = () => {
    this.setState({testEmailDialog: true});
    this.setcampaignParams();
  };

  testEmailDialogClose = () => {
    this.setState({ testEmailDialog: false });
  };

  changeSubjectHandler = (e) => {
    this.setState({subject: e.target.value})
    this.setState({canSendTestEmail: (e.target.value != '')})
  }

  selectClickHandler = (e) => {
    this.setState({template_was: this.state.template})
    this.setState({template: e.target.value})
  }

  renderTestDialog = () => {
    return(
      <TestEmailDialog {...this.props}
        data = {this.state.campaignParams}
        handleClose={this.testEmailDialogClose} />
      )
  }

  personalFooter = () => {
    const {currentUser, app} = this.props
    return(
      <table cellPadding='0' cellSpacing='0' border='0' width='88%' style={{ width: '88% !important', minWidth: '88%', maxWidth: '88%' }}>
        <tr>
          <td align='center' valign='top'>
            {
              currentUser.avatarUrl ? <img src={currentUser.avatarUrl} alt='img' width='50' border='0' style={{display: 'block', width: '50px' }} /> :

              <img src={Logo_B} alt='img' width='50' border='0' style={{display: 'block', width: '50px' }} />
            }
          </td>
          <td>
            <p className='mob_title2' style={{ color: '#000000', fontSize: '15px', lineHeight: '1.2', fontWeight: '600'}}>
              {currentUser.firstName} from {app.name}
            </p>
          </td>
        </tr>
      </table>
    )
  }

  chagneFooterAddress = (e) => {
    this.setState({editModeFooterAddress: true}, () => {
      this.refs.footerAddressInputRef.focus()
    });
  }

  changeHelpEmail = (e) => {
    this.setState({editModeHelpEmail: true}, () => {
      this.refs.helpEmailInputRef.focus()
    });
  }

  changeHelpContact = (e) => {
    this.setState({editModeHelpContact: true}, () => {
      this.refs.helpContactInputRef.focus()
    });
  }

  updateFooterAddress = (e) => {
    this.setState({editModeFooterAddress: false});
    this.setState({footerAddress: e.target.value});
  }

  updateHelpEmail = (e) => {
    this.setState({editModeHelpEmail: false});
    this.setState({helpEmail: e.target.value});
  }

  updateHelpContact = (e) => {
    this.setState({editModeHelpContact: false});
    this.setState({helpContact: e.target.value});
  }

  handleFooterAddressInput = (e) => {
    this.setState({footerAddress: e.target.footerAddress});
  }

  handleHelpEmailInput = (e) => {
    this.setState({helpEmail: e.target.helpEmail});
  }

  handleHelpContactInput = (e) => {
    this.setState({helpContact: e.target.helpContact});
  }

  mailCompaignFooter = () => {
    const template = this.state.template || this.state.template_was
    switch (template) {
      case "plain":
        return (
          <div class='plain-template-footer'>
            {
              this.state.includeUnsubscriptionLink &&
              <div class='heading1'>
                Don't want to get emails like this? <a href='javascript:void(0)'>Unsubscribe from our emails</a>
              </div>
            }
          </div>
        )
      case "personal":
        return ''
      case "company":
        return (
          <div class='company-template-footer'>
            {
              !this.state.editModeFooterAddress ?
              <div class='heading1' onClick={this.chagneFooterAddress}>{this.state.footerAddress}</div> :
              <input className='heading1' style={{'margin-top': '0', 'padding-top':'0', 'width': '75%'}} ref={"footerAddressInputRef"} value={this.state.footerAddress} onChange={this.handleFooterAddressInput} onBlur={this.updateFooterAddress} />
            }
            <div class='heading2'>
              {
                !this.state.editModeHelpEmail ?
                <span class='help-email' onClick={this.changeHelpEmail}> {this.state.helpEmail} </span> :
                <input style={{'display': 'inline', 'margin-top': '0', 'padding-top':'0', 'width': '50%'}} ref={"helpEmailInputRef"} value={this.state.helpEmail} onChange={this.handleHelpEmailInput} onBlur={this.updateHelpEmail} />
              }
                  |
              {
                !this.state.editModeHelpContact ?
                <span class='help-contact' onClick={this.changeHelpContact}> {this.state.helpContact} </span> :
                <input style={{'display': 'inline', 'margin-top': '0', 'padding-top':'0', 'width': '50%'}} ref={"helpContactInputRef"} value={this.state.helpContact} onChange={this.handleHelpContactInput} onBlur={this.updateHelpContact} />
              }
              {
                this.state.includeUnsubscriptionLink &&
                <span>| <span class='unsubscription-link'> <a href='javascript:void(0)'>Unsubscribe</a></span></span>
              }
            </div>
          </div>
        )
      default:
        return "";
        break;
    }
  }

  changeIncludeUnsubscriptionOption = (e) => {
    let isAllowed = e.target.getAttribute("value") == 'yes'
    this.setState({includeUnsubscriptionLink: isAllowed})
  }

  unsubscriptionLinkInfoSection = () => (
    <UnsubscriptionLinkInfoSection>
      <div>
      </div>
      <div id='unsubscriptionLinkInfoWrapper'>
        <span class='new-line' id='unsubscriptionLinkInfoHeading'>Unsubscribe options</span>
        <span class='new-line'>This email includes an unsubscribe link
        <Link href="javascript:void(0)" color="primary" class='change-link' onClick={this.toggleUnsubscriptionOptions}>
          Change
        </Link>
        </span>
        {this.state.showUnsubscriptionOptions && this.unsubscriptionLinkOptions()}
      </div>
    </UnsubscriptionLinkInfoSection>
  )

  unsubscriptionLinkOptions = () => (
    <div>
      <span class='new-line'>
        <input type="radio" id="unsubscriptionLinkInclude" name="unsubscription_link" value='yes' checked={this.state.includeUnsubscriptionLink} onChange={this.changeIncludeUnsubscriptionOption} />
        <label for="unsubscriptionLinkInclude">Include an unsubscribe link<small>(Recommended)</small></label>
      </span>
      <span class='new-line'>
        <input type="radio" id="unsubscriptionLinkExclude" name="unsubscription_link" value='no' checked={!this.state.includeUnsubscriptionLink} onChange={this.changeIncludeUnsubscriptionOption} />
        <label for="unsubscriptionLinkExclude">Don't include an unsubscribe link</label>
      </span>
    </div>
  )

  toggleUnsubscriptionOptions = () => {
    let newState = !this.state.showUnsubscriptionOptions
    this.setState({ showUnsubscriptionOptions: newState})
  }


  render() {
    // !this.state.loading &&
    /*if (this.state.loading) {
      return <Loader />
    }*/

    return (
      <React.Fragment>
      {this.state.testEmailDialog ? this.renderTestDialog() : null }
      
      <EditorContentWrapper mode={this.props.mode}>
        <EditorHead>
          <span>Create your message</span>  
          <Button variant="outlined" color="primary" onClick={this.updateOrCreate}>
            Save
          </Button> 
        </EditorHead>

        <EditorHead>
          <TextStyle variant="outlined" label="From" defaultValue={this.props.currentUser.email} disabled/>
          <TextStyle variant="outlined" label="Replies assigned to" defaultValue={this.props.app.emailForwardingAddress} disabled/> 
          <TextField variant="outlined" label = "Email Template" value={this.state.template} onClick={this.selectClickHandler} select>
            <option value="plain">Plain</option>
            <option value="personal">Personal</option>
            <option value="company">Company</option>
          </TextField>    
          <Button variant="outlined" color="primary" onClick={this.testEmailDialogOpen} disabled={!this.state.canSendTestEmail}>
            Send a test email
          </Button> 
        </EditorHead>

        {((['plain', 'company'].indexOf(this.state.template || this.state.template_was)) > -1) && this.unsubscriptionLinkInfoSection()}

        <BrowserSimulator mode={this.props.mode}>
          <BrowserSimulatorHeader>
            <BrowserSimulatorButtons>
              <div className={"circleBtn r"}></div>
              <div className={"circleBtn y"}></div>
              <div className={"circleBtn g"}></div>
            </BrowserSimulatorButtons>
          </BrowserSimulatorHeader>
          <TextField placeholder = "Write subject here" value={this.state.subject} onChange={this.changeSubjectHandler}></TextField>
          <EditorContentWrapper1 mode={this.props.mode}>
            <EditorPad mode={this.props.mode}>
              <EditorMessengerEmulator mode={this.props.mode}>
                <EditorMessengerEmulatorWrapper mode={this.props.mode}>
                  <EditorMessengerEmulatorHeader mode={this.props.mode} />

                  <TextEditor
                    campaign={true}
                    uploadHandler={this.uploadHandler}
                    serializedContent={this.props.data.serializedContent}
                    read_only={this.state.read_only}
                    toggleEditable={() => {
                      this.setState({ read_only: !this.state.read_only });
                    }}
                    data={{
                      serialized_content: this.props.data.serializedContent,
                    }}
                    styles={{
                      lineHeight: "2em",
                      fontSize: "1.2em",
                    }}
                    saveHandler={this.saveHandler}
                    updateState={({ status, statusButton, content }) => {
                      this.saveContent(content);
                    }}
                    app={this.props.app}
                  />
                </EditorMessengerEmulatorWrapper>
              </EditorMessengerEmulator>
            </EditorPad>
              {(this.state.template || this.state.template_was) === "personal" && <EditorFooter>
                {this.personalFooter()}
                </EditorFooter>
              }
          </EditorContentWrapper1>
          <MailCompaignFooterContainer>
            <MailCompaignFooter className='mail-compaign-footer'>
              {this.mailCompaignFooter()}
            </MailCompaignFooter>
            <MailCompaignFooterBottom>
              {'Powred by Upsend'}
            </MailCompaignFooterBottom>
          </MailCompaignFooterContainer>
        </BrowserSimulator>
      </EditorContentWrapper>
      </React.Fragment>
    );
  }
}
