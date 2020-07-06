import React, {Component} from "react"
import serialize from 'form-serialize'
import PropTypes from 'prop-types'

import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'

import FieldRenderer from '../shared/FormFields'
import graphql from "../graphql/client";
import { APP } from "../graphql/queries"
import {
  CREATE_DIRECT_UPLOAD,
} from '../graphql/mutations'

import { toSnakeCase } from '../shared/caseConverter'
import { withStyles } from '@material-ui/core/styles';

import ContentHeader from '../components/ContentHeader'
import Content from '../components/Content'
import AvailabilitySettings from './settings/Availability'
import EmailRequirement from './settings/EmailRequirement'
import EmailForwarding from './settings/EmailForwarding' 
import LanguageSettings from './settings/Language'
import InboundSettings from './settings/InboundSettings'
import StylingSettings from './settings/Styling'
import UserData from './settings/UserDataFields'
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import timezones from '../shared/timezones'
import {
  getFileMetadata,
  directUpload,
  directUploadWithProgress,
  BlobUploadWithProgress
} from '../shared/fileUploader'
import { setCurrentPage, setCurrentSection } from "../actions/navigation";
import Divider from "@material-ui/core/Divider";
import LinearProgress from '@material-ui/core/LinearProgress';

const styles = theme => ({
  root: {
    [theme.breakpoints.up('sm')]: {
      margin: theme.spacing(3),
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
    margin: '50px!important',
    marginTop: '35px!important'
  },
  formControl: {
    margin: theme.spacing.unit,
    width: '100%'
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: theme.spacing.unit / 4,
  },
  noLabel: {
    marginTop: theme.spacing(3),
  },
  appSettingTitleContainer: {
    marginTop: 52,
    marginLeft: 44,
    backgroundColor: 'transparent',
    color: '#000000',
    width: 'calc(100% - 140px)'
  },
  appSettingTitle: {
    fontWeight: 'normal',
    fontSize: 42,
  },
  appSettingMenu: {
    marginBottom: 10,
  },
  tabIndicator: {
    display: 'none'
  },
  tabButton: {
    padding: '0 20px',
    '&:hover': {
      backgroundColor: '#FAF6F1'
    }
  },
  tabSelectedButton: {
    backgroundColor: '#FAF6F1'
  },
  imageButton: {
    backgroundColor: '#000000',
    color: '#ffffff',
    width: 150,
    height: 50
  },
  submitButton: {
    backgroundColor: '#FFD300',
    marginTop: 25,
    color: '#000000',
    width: 250,
    height: 50
  },
  mainContentHeader: {
    display: 'none'
  }
});

class SettingsForm extends Component {

  constructor(props){
    super(props)
    this.state = {
      selected: 0,
      data: {},
      errors: {}
    }    
  }

  tabs = ()=>{
    var b = []
    return b    
  }

  onSubmitHandler = (e) => {
    e.preventDefault()
    const serializedData = serialize(this.formRef, { hash: true, empty: true })
    const data           = toSnakeCase(serializedData)
    this.props.update(data)
  }

  render(){
    const { classes } = this.props;
    return <Paper
              elevation={0}
              classes={{
                root: classes.root
              }}>
              <form
                name="create-repo"
                onSubmit={this.onSubmitHandler.bind(this)}
                ref={form => {
                  this.formRef = form;
                }}>

                <Typography variant="h6" gutterBottom style={{margin: '30px auto', fontSize: 18}}>
                  {this.props.title}
                </Typography>
                <Divider style={{marginLeft: -30, width: 'calc(100% + 260px)'}}/>

                <Grid container spacing={3} style={{marginTop: 50}}>
                  {
                    this.props.definitions().map((field) =>
                      <Grid item
                        key={field.name}
                        xs={field.grid.xs}
                        sm={field.grid.sm}
                        style={field.style}
                        {...field.gridProps}>
                        <FieldRenderer
                          namespace={'app'}
                          data={field}
                          buttonClass={classes.imageButton}
                          props={this.props}
                          errors={this.props.data.errors || {} }
                         />
                        { (field.name === 'logo' && field.completed > 0) ?
                          <div>
                            <LinearProgress
                              variant="determinate"
                              value={field.completed}
                              color="primary" />
                          </div>
                        : '' }
                      </Grid>
                    )
                  }

                </Grid>

                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <Button variant="contained" color="primary" type="submit" classes={{root: classes.submitButton}}>
                      Save settings
                    </Button>
                  </Grid>
                </Grid>

              </form>
            </Paper>
  }

}



class AppSettingsContainer extends Component {

  constructor(props){
    super(props)
    this.state = {
      tabValue: 0,
      completed: 0
    }

  }

  componentDidMount(){
    //this.fetchApp()
    this.props.dispatch(setCurrentPage("app_settings"))
    this.props.dispatch(setCurrentSection("Settings"))
  }

  url = ()=>{
    return `/apps/${this.props.match.params.appId}.json`
  }

  fetchApp = ()=>{
    graphql(APP, { appKey: this.props.match.params.appId}, {
      success: (data)=>{
        this.setState({ app: data.app })
      },
      errors: (error)=>{
        console.log(error)
      }
    })
  }

  // Form Event Handlers
  update = (data) => {
    this.props.dispatch(
      this.props.updateApp(data.app, (d)=>{
        console.log(d)
      })
    )
  };


  uploadHandler = (file, kind) => {
    getFileMetadata(file).then((input) => {
      graphql(CREATE_DIRECT_UPLOAD, input, {
        success: (data)=>{
          const {signedBlobId, headers, url, serviceUrl} = data.createDirectUpload.directUpload
          const progressCallback = (event) => {
            if (event.lengthComputable) {
              var percentComplete = event.loaded / event.total;
              this.setState({completed: parseInt(percentComplete*100)})
            }
          }
          directUploadWithProgress(url, JSON.parse(headers), file, progressCallback).then(
            () => {
              let params = {}
              params[kind] = signedBlobId
              this.update({app: params })
          });
        },
        error: (error)=>{
         console.log("error on signing blob", error)
        }
      })
    });
  }

  handleTabChange = (e, i)=>{
    this.setState({tabValue: i})
  }

  tabsContent = ()=>{
    const { classes } = this.props;
    return <Tabs value={this.state.tabValue} 
              onChange={this.handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              textColor="inherit"
              classes={{
                indicator: classes.tabIndicator
              }}
              style={{marginTop: 10}}
            >
              <Tab textColor="inherit" label="App Settings" classes={{root: classes.tabButton, selected: classes.tabSelectedButton}}/>
              <Tab textColor="inherit" label="Security" classes={{root: classes.tabButton, selected: classes.tabSelectedButton}}/>
              <Tab textColor="inherit" label="Appearance" classes={{root: classes.tabButton, selected: classes.tabSelectedButton}}/>
              <Tab textColor="inherit" label="Translations" classes={{root: classes.tabButton, selected: classes.tabSelectedButton}}/>
              <Tab textColor="inherit" label="Availability" classes={{root: classes.tabButton, selected: classes.tabSelectedButton}}/>
              <Tab textColor="inherit" label="Email Requirement" classes={{root: classes.tabButton, selected: classes.tabSelectedButton}}/>
              <Tab textColor="inherit" label="Inbound settings" classes={{root: classes.tabButton, selected: classes.tabSelectedButton}}/>
              <Tab textColor={"inherit"} label="Messenger Style" classes={{root: classes.tabButton, selected: classes.tabSelectedButton}}/>
              <Tab textColor={"inherit"} label="User data" classes={{root: classes.tabButton, selected: classes.tabSelectedButton}}/>
              <Tab textColor="inherit" label="Email Forwarding" classes={{root: classes.tabButton, selected: classes.tabSelectedButton}}/>
            </Tabs>
  }

  definitionsForSettings = () => {
    return [
      {
        name: "name",
        type: 'string',
        style: {marginTop: 20},
        grid: { xs: 10, sm: 5 },
        gridProps: {style: {alignSelf: 'flex-end'}}
      },

      {
        name: 'logo',
        type: 'upload',
        grid: { xs: 10, sm: 5 },
        rowImage: {flexDirection: 'row'},
        imgStyle: {width: 95, height: 95, borderRadius: '50%', border: 'solid 1px', marginTop: -30, transform: 'translateY(-10px)'},
        handler: (file)=> this.uploadHandler(file, "logo"),
        completed: this.state.completed
      },

      {
        name: "domainUrl",
        type: 'string',
        label: "Domain URL",
        style: {marginTop: 20},
        hint: 'This will be the host site were upsend will be used',
        grid: { xs: 10, sm: 5 }
      },
      {
        name: "outgoingEmailDomain",
        label: "Outgoing email Domain",
        style: {marginTop: 20},
        hint: "The email domain to send conversations, for @yourapp use 'your app'",
        type: 'string',
        grid: { xs: 10, sm: 5 }
      },

      {
        name: "tagline",
        type: 'text',
        style: {marginTop: 20},
        hint: "Messenger text on botton",
        grid: { xs: 10, sm: 5 }
      },

      { name: "timezone", 
        type: "timezone", 
        options: timezones,
        style: {marginTop: 20},
        multiple: false,
        grid: { xs: 10, sm: 5 }
      },
      {
        name: "gatherSocialData",
        label: "Gather social data",
        type: 'bool',
        label: "Collect social data about your users",
        hint: "Collect social profiles via fullcontact service (e.g. LinkedIn, Twitter, etc.) for my users via a third party",
        grid: { xs: 12, sm: 12 }
      },
      {
        name: "registerVisits",
        label: "Register visits to database",
        type: 'bool',
        label: "Store visits for visitors",
        hint: "Even if this is disabled we will collect global counter of visits and store the last visit information on visitor's profile",
        grid: { xs: 12, sm: 12 }
      },
    ]
  }

  definitionsForSecurity = () => {
    return [
      {
        name: "encryptionKey",
        label: "Encryption Key", 
        type: 'string',
        maxLength: 16, minLength: 16,
        placeholder: "Leave it blank for no encryption",
        hint: "This key will be used to encrypt and decrypt JWE user data",
        grid: { xs: 10, sm: 5 }
      },
    ]
  }

  definitionsForAppearance = ()=>{
    return [
      /*{
        name: "state",
        type: "select",
        grid: { xs: 12, sm: 6 },
        options: ["enabled", "disabled"]
      },
      {
        name: "theme",
        type: "select",
        options: ["dark", "light"],
        grid: { xs: 12, sm: 6 }
      },*/
      {
        name: "activeMessenger",
        label: "Activate messenger",
        hint: 'When this is activate the messenger web widget will be activated',
        type: 'bool',
        grid: { xs: 12, sm: 12 }
      },

      {
        name: 'enableArticlesOnWidget',
        label: "Display article on chat window",
        hint: "This option will display the articles in the home section of the messenger",
        type: 'bool',
        grid: { xs: 12, sm: 12 }
      },

      {
        name: 'inlineNewConversations',
        label: "Display new messages in floating box",
        hint: "This option will not open chat box widget",
        type: 'bool',
        grid: { xs: 12, sm: 12 }
      },

    ]
  }

  definitionsForStyling = ()=>{
    return [
      {
        name: "primary_customization_color",
        type: 'color',
        handler: (color)=> {
          this.props.updateMemSettings({color: color})
        },
        grid: { xs: 12, sm: 4 }
      },

      {
        name: "secondary_customization_color",
        type: 'color',
        handler: (color)=> {
          this.props.updateMemSettings({color: color})
        },
        grid: { xs: 12, sm: 4 }
      },

      {
        name: "header_image",
        type: 'upload',
        handler: (file)=> this.uploadHandler(file, "header_image"),
        grid: { xs: 12, sm: 4 }
      },
    ]
  }

  renderTabcontent = ()=>{

    switch (this.state.tabValue){
      case 0:
        return <SettingsForm
                  title={"General app's information"}
                  currentUser={this.props.currentUser}
                  data={this.props.app}
                  update={this.update.bind(this)}
                  fetchApp={this.fetchApp}
                  classes={this.props.classes}
                  definitions={this.definitionsForSettings}
                  {...this.props}
               />

      case 1:
        return <SettingsForm
                  title={"Security Settings"}
                  currentUser={this.props.currentUser}
                  data={this.props.app}
                  update={this.update.bind(this)}
                  fetchApp={this.fetchApp}
                  classes={this.props.classes}
                  definitions={this.definitionsForSecurity}
                  {...this.props}
                />
      case 2:
        return <SettingsForm
                  title={"Appearance settings"}
                  currentUser={this.props.currentUser}
                  data={this.props.app}
                  update={this.update.bind(this)}
                  fetchApp={this.fetchApp}
                  classes={this.props.classes}
                  definitions={this.definitionsForAppearance}
                  {...this.props}
                />

      case 3:
          return <LanguageSettings 
                  settings={ this.props.app }
                  update={this.update}
                  namespace={'app'}
                  fields={['greetings', 'intro', 'tagline',]}
                />
      case 4:
        return <AvailabilitySettings 
                settings={ this.props.app } 
                update={this.update}
                namespace={'app'}
                fields={['greetings', 'intro', 'tagline',]}
              />
      case 5: 
        return <EmailRequirement settings={ this.props.app } 
                                update={this.update}
                                namespace={'app'}
                                />
      case 6:
        return <InboundSettings
                  settings={ this.props.app } 
                  update={this.update}
                  namespace={'app'}
                />

      case 7:
        return <StylingSettings
                  settings={ this.props.app } 
                  update={this.update}
                  namespace={'app'}
                />
      case 8:
        return <UserData 
          settings={ this.props.app } 
          update={this.update}
          namespace={'app'}
        />
      case 9: 
        return <EmailForwarding settings={ this.props.app } 
                                update={this.update}
                                namespace={'app'}
                                />
    }
  }

  render(){
    const { classes } = this.props;
    return <div>
        {
          this.props.app ?

          <React.Fragment>

            <ContentHeader 
              title={ 'App Settings' }
              headerClass={classes.appSettingTitleContainer}
              headerTitleClass={classes.appSettingTitle}
              headerMenuClass={classes.appSettingMenu}
              tabsContent={ this.tabsContent() }
              showDivider
            />

          

            <Content>
              {this.renderTabcontent()}
            </Content>
            

          </React.Fragment> : null
        }
        </div>
  }
}


export {SettingsForm}

AppSettingsContainer.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles, { withTheme: true })(AppSettingsContainer);



