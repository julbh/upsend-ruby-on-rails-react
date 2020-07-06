import React, {Component, useState} from 'react'

import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import RadioGroup from '@material-ui/core/RadioGroup'
import Radio from '@material-ui/core/Radio'
import Button from '@material-ui/core/Button'

import SegmentManager from '../../components/segmentManager'
import { parseJwt, generateJWT } from '../../components/segmentManager/jwt'
import { PREDICATES_SEARCH} from '../../graphql/mutations'
import graphql from '../../graphql/client'
import userFormat from '../../components/table/userFormat';
import {toggleDrawer} from '../../actions/drawer'
import {
  getAppUser 
} from '../../actions/app_user'
import { withRouter, Switch } from 'react-router-dom'
import { connect } from 'react-redux'

import {makeStyles} from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";


const useStyles = makeStyles(theme => ({
    root: {
        margin: '50px!important',
        marginTop: '35px!important'
    },
    checkLabel: {
        fontSize: 15
    },
    radioIcon: {
        '& .MuiSvgIcon-root': {
            width: 20,
            height: 20
        }
    },submitButton: {
        backgroundColor: '#FFD300',
        marginTop: 25,
        color: '#000000',
        width: 250,
        height: 50
    },
}));


function InboundSettings({settings, update, dispatch}){
    const classes = useStyles();
  const [state, setState] = React.useState({
    enable_inbound: settings.inboundSettings.enabled,

    users_radio: settings.inboundSettings.users.segment,
    users_enabled: settings.inboundSettings.users.enabled,
    usersPredicates: settings.inboundSettings.users.predicates,

    visitors_radio: settings.inboundSettings.visitors.segment,
    visitors_enabled: settings.inboundSettings.visitors.enabled,
    visitorsPredicates: settings.inboundSettings.visitors.predicates,
  });

  const handleChange = name => event => {
    setState({ ...state, [name]: event.target.checked });
  };

  function setPredicates(name, value){
    setState({ ...state, [name]: value });
  }

  function handleSubmit(){
    const {
      enable_inbound, users_enabled, users_radio, usersPredicates, 
      visitors_radio, visitors_enabled, visitorsPredicates
    } = state

    const data = {
      app: {
        inbound_settings: {
          enabled: enable_inbound,
          users: {
            enabled: users_enabled,
            segment: users_radio,
            predicates: usersPredicates
          },
          visitors: {
            enabled: visitors_enabled,
            segment: visitors_radio,
            predicates: visitorsPredicates
          }
        }
      }
    } 
    update(data)
  }

  return (
      <Paper
          elevation={0}
          classes={{
              root: classes.root
          }}>
          <Typography variant="h6" gutterBottom style={{margin: '30px auto', fontSize: 18}}>
              Email Requirements
          </Typography>
          <Divider style={{marginLeft: -30, width: 'calc(100% + 260px)'}}/>

        <div>

          <Box mb={2} >
            <Typography variant={"h6"} style={{fontSize: 18, marginTop: 30}}>
              Control inbound conversations and the launcher
            </Typography>
            <Typography variant={"body1"} style={{fontSize: 13}}>
              Control who can send you messages and where they see the launcher
            </Typography>
          </Box>

          <Typography variant={"h6"} style={{fontSize: 18, marginTop: 30}}>
            New conversations button
          </Typography>

          <Grid container>
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.enable_inbound}
                  onChange={handleChange('enable_inbound')}
                  value={state.enable_inbound}
                  color="primary"
                  classes={{root: classes.radioIcon}}
                />
              }
              label="Let people start new inbound conversations with you"
              classes={{ label: classes.checkLabel}}
            />
          </Grid>

          <Typography variant={"overline"} style={{fontSize: 13}}>
            When this is turned off, people can only reply to the outbound messages  you send.
          </Typography>

          {/*<Box mb={2} mt={2}>*/}
            <Typography variant={"h5"} style={{fontSize: 18, marginTop: 30}}>
              visibility
            </Typography>
          {/*</Box>*/}

          <Typography variant={"body1"} style={{fontSize: 13}}>
            Control who sees the standard Messenger launcher on your website.
          </Typography>

          <Typography variant={"overline"} style={{fontSize: 13}}>
            Any messages you send will still be delivered.
          </Typography>


          <Box mb={2} mt={2}>

            <Typography variant={"subtitle1"} style={{fontSize: 13}}>
              On the web, show the standard Messenger launcher to:
            </Typography>

            <AppSegmentManager
              app={settings}
              label={"Users"}
              namespace={"users"}
              all={"All Users"}
              checked={state.users_enabled}
              updateChecked={handleChange}
              predicates={state.usersPredicates || []}
              setPredicates={setPredicates}
              radioValue={state.users_radio}
              dispatch={dispatch}
              some={"Users who match certain data"}
            />

            <AppSegmentManager
              app={settings}
              label={"Visitors"}
              all={"All Visitors"}
              namespace="visitors"
              dispatch={dispatch}
              checked={state.visitors_enabled}
              updateChecked={handleChange}
              predicates={state.visitorsPredicates || []}
              setPredicates={setPredicates}
              radioValue={state.visitors_radio}
              some={"Visitors who match certain data"}
            />

            <Typography variant="caption" style={{fontSize: 13}}>
              This doesn’t affect the outbound messages you send.
            </Typography>

          </Box>

          <Grid container>
            <Button onClick={handleSubmit}
              variant={"contained"} color={"primary"}
              classes={{root: classes.submitButton}}
            >
                Save Settings
            </Button>
          </Grid>

        </div>
      </Paper>
  )
}

function mapStateToProps(state) {
  const { drawer } = state
  return {
    drawer
  }
}

export default withRouter(connect(mapStateToProps)(InboundSettings))


function AppSegmentManager({
  app, 
  label, 
  all, 
  some, 
  checked, 
  updateChecked, 
  namespace,
  predicates,
  setPredicates,
  radioValue,
  dispatch
}){

  //const [checked, setChecked]= useState(checked)
  //const [radioValue, setRadioValue] = useState("all")
  //const [predicates, setPredicates] = useState([])
    const classes = useStyles();
  
  function handleChange(e){
    updateChecked(e)
    //setChecked(!checked)
  }

  function handleChangeRadio(e){
    setPredicates(`${namespace}_radio`, e.target.value)
  }

  function updatePredicates(data, cb){
    setPredicates(`${namespace}Predicates`, data.segments)
    cb && cb()
  }

  return (

    <Grid container xl={6} lg={8} md={10} sm={12} style={{border: 'solid 1px #e0bcbc', borderRadius: 5, marginBottom: 10, paddingLeft: 10}}>

      <Grid item sm={6}>
        <FormControlLabel
          control={
            <Checkbox
              checked={checked}
              onChange={updateChecked(`${namespace}_enabled`)}
              value={checked}
              color="primary"
              classes={{root: classes.radioIcon}}
            />
          }
          label={label}
          classes={{label: classes.checkLabel}}
        />
      </Grid>

      <Grid item={6}>
        <RadioGroup
          //aria-label="gender"
          //name="gender1"
          //className={classes.group}
          disabled={!checked}
          value={radioValue}
          onChange={handleChangeRadio}
        >

          <FormControlLabel 
            disabled={!checked}
            value="all"
            control={<Radio classes={{root: classes.radioIcon}}/>}
            label={all}
            classes={{label: classes.checkLabel}}
          />

          <FormControlLabel 
            disabled={!checked}
            value="some"
            control={<Radio classes={{root: classes.radioIcon}}/>}
            label={some}
            classes={{label: classes.checkLabel}}
          />
          

        </RadioGroup>
      </Grid>

      <Grid item sm={12}>
        {
          checked && radioValue === "some" ?
          <AppSegment
            app={app}
            data={{ segments: predicates }}
            updateData={updatePredicates} 
            dispatch={dispatch}
          /> : null
        }
      </Grid>

    </Grid>

  )
}


class AppSegment extends Component {

  constructor(props) {
    super(props)
    this.state = {
      jwt: null,
      app_users: [],
      search: false,
      meta: {}
    }
  }
  componentDidMount() {
    /*this.props.actions.fetchAppSegment(
      this.props.app.segments[0].id
    )*/
    
    this.search()
  }

  updateData = (data, cb) => {
    const newData = Object.assign({}, this.props.data, { segments: data.data })
    this.props.updateData(newData, cb ? cb() : null)
  }

  updatePredicate = (data, cb) => {
    const jwtToken = generateJWT(data)
    //console.log(parseJwt(jwtToken))
    if (cb)
      cb(jwtToken)
    this.setState({ jwt: jwtToken }, () => this.updateData(parseJwt(this.state.jwt), this.search))
  }

  addPredicate = (data, cb) => {

    const pending_predicate = {
      attribute: data.name,
      comparison: null,
      type: data.type,
      value: data.value
    }

    const new_predicates = this.props.data.segments.concat(pending_predicate)
    const jwtToken = generateJWT(new_predicates)
    //console.log(parseJwt(jwtToken))
    if (cb)
      cb(jwtToken)

    this.setState({ jwt: jwtToken }, () => this.updateData(parseJwt(this.state.jwt)))
  }

  deletePredicate(data) {
    const jwtToken = generateJWT(data)
    this.setState({ jwt: jwtToken }, () => this.updateData(parseJwt(this.state.jwt), this.search))
  }

  search = (page) => {

    this.setState({ searching: true })
    // jwt or predicates from segment
    //console.log(this.state.jwt)
    const data = this.state.jwt ? parseJwt(this.state.jwt).data : this.props.data.segments
    const predicates_data = {
      data: {
        predicates: data.filter((o) => o.comparison)
      }
    }

    graphql(PREDICATES_SEARCH, { 
      appKey: this.props.app.key,
      search: predicates_data,
      page: page || 1,
      per: 5,
    },{
      success: (data) => { 
        const appUsers = data.predicatesSearch.appUsers
        this.setState({
          app_users: appUsers.collection,
          meta: appUsers.meta,
          searching: false
        })
      },
      error: (error) => {
        debugger
      }
    })
  }

  showUserDrawer = (o)=>{
    this.props.dispatch(
      toggleDrawer({ rightDrawer: true }, ()=>{
        this.props.dispatch(getAppUser(o.id))
      })
    )
  }

  render() {
    return <SegmentManager {...this.props}
      loading={this.state.searching}
      predicates={this.props.data.segments}
      meta={this.state.meta}
      collection={this.state.app_users}
      updatePredicate={this.updatePredicate.bind(this)}
      addPredicate={this.addPredicate.bind(this)}
      deletePredicate={this.deletePredicate.bind(this)}
      search={this.search.bind(this)}

      loading={this.props.searching}
      columns={userFormat(this.showUserDrawer, this.props.app)}

      defaultHiddenColumnNames={
        ['id', 
        'state', 
        'online', 
        'lat', 
        'lng', 
        'postal',
        'browserLanguage', 
        'referrer', 
        'os', 
        'osVersion',
        'lang'
        ]}
      //selection [],
      tableColumnExtensions={[
        //{ columnName: 'id', width: 150 },
        { columnName: 'email', width: 250 },
        { columnName: 'lastVisitedAt', width: 120 },
        { columnName: 'os', width: 100 },
        { columnName: 'osVersion', width: 100 },
        { columnName: 'state', width: 80 },
        { columnName: 'online', width: 80 },
        //{ columnName: 'amount', align: 'right', width: 140 },
      ]}
      leftColumns={ ['email']}
      rightColumns={ ['online']}
      //toggleMapView={this.toggleMapView}
      //map_view={this.state.map_view}
      //enableMapView={true}
    >
      { /*
        this.state.jwt ?
          <Button isLoading={false}
            appearance={'link'}
            onClick={this.handleSave}>
            <i className="fas fa-chart-pie"></i>
            {" "}
            Save Segment
          </Button> : null
      */
      }

    </SegmentManager>
  }
}