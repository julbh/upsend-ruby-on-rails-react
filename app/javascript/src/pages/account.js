import React, {useState} from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import graphql from '../graphql/client'
import Avatar from "@material-ui/core/Avatar";

import {errorMessage, successMessage} from '../actions/status_messages'
import {isEmpty} from 'lodash'
import { UPDATE_ACCOUNT_DETAILS, CREATE_DIRECT_UPLOAD } from '../graphql/mutations'
import {getFileMetadata, directUpload} from '../shared/fileUploader'

const useStyles = makeStyles(theme => ({
  /*'@global': {
    body: {
      backgroundColor: theme.palette.common.black,
    },
  },*/
  divWrapper: {
    marginTop: theme.spacing(3),
  },
  paper: {
    marginTop: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
  },
  participantAvatar: {
    //margin: 10,
    width: "3rem",
    height: "3rem",
  },
  logo: {
    height: '100%',
    width: '100%'
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  fileUploadBtn: {
    position: 'relative',
  },
  fileupload: {
    opacity: 0,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: "100%",
  }
}));

function Account(props){
  const {app, current_user, dispatch} = props
  const classes = useStyles();
  const [firstName, setFirstName] = useState(current_user.firstName);
  const [lastName, setLastName] = useState(current_user.lastName);
  const [email, setEmail] = useState(current_user.email);
  const [password, setPassword] = useState('');
  const [isDisabled, setIsDisabled] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(current_user.avatarUrl);
  
  const handleSubmit = (e)=>{
    e.preventDefault();
    if(password.length > 0){
      const options = {}
      options["first_name"] = firstName
      options["last_name"] = lastName
      options["email"] = email
      options["current_password"] = password
      graphql(UPDATE_ACCOUNT_DETAILS, {
        appKey: app.key, 
        options: options
      }, {
        success: (data)=>{
          if(isEmpty(data.updateAccountDetails.errors)){
            setPassword('')
            dispatch(successMessage("Account Information Updated"))
          }
          else{
            dispatch(errorMessage("Can not Update Account, Please check details again"))
          }
        },
        error: (error)=>{
          console.log("ERRR Updating app", error)
        }
      })
    }
  }

  const handleCurrentPasswordChange = (e)=>{
    if(e.target.value.length > 0){
      setIsDisabled(false)
    }
    else{
      setIsDisabled(true)
    }
    setPassword(e.target.value)
  }

  const updatePhoto = (signedBlobId)=>{
    graphql(UPDATE_ACCOUNT_DETAILS, {
      appKey: app.key, 
      options: {
        avatar: signedBlobId
      }
    }, {
      success: (data)=>{
        setAvatarUrl(data.updateAccountDetails.currentUser.avatarUrl)
        dispatch(successMessage("photo Updated"))
      },
      error: ()=>{
        dispatch(errorMessage("Can not Update photo"))
      }
    })
  }

  const handleRemovePhoto = ()=>{
    graphql(UPDATE_ACCOUNT_DETAILS, {
      appKey: app.key, 
      options: {
        remove_photo: true 
      }
    }, {
      success: (data)=>{
        if(isEmpty(data.updateAccountDetails.errors)){
          setAvatarUrl(data.updateAccountDetails.currentUser.avatarUrl)
          dispatch(successMessage("Photo Removed"))
        }
        else{
          console.log(data.updateAccountDetails.errors)
          dispatch(errorMessage("Can not remove photo"))
        }
      },
      error: ()=>{
        dispatch(errorMessage("Can not remove photo"))
      }
    })
  }

  const handlePhotoChange = (e)=>{
    const file = e.target.files[0]
    getFileMetadata(file).then((input) => {
      graphql(CREATE_DIRECT_UPLOAD, input, {
        success: (data)=>{
          const {signedBlobId, headers, url, serviceUrl} = data.createDirectUpload.directUpload
       
          directUpload(url, JSON.parse(headers), file).then(
            () => {
              updatePhoto(signedBlobId)
          });
        },
        error: (error)=>{
         console.log("error on signing blob", error)
        }
      })
    })
  }

  return (
    <React.Fragment>
      <Container spacing={1} maxWidth="lg" component="main" >
        <div className={classes.paper}>
          <h2>Your Details </h2>
          <form className={classes.form} noValidate onSubmit={handleSubmit}>
            <Grid container spacing={2}>
                <Grid item sm={6}>
                  <TextField
                    autoComplete="firstName"
                    name="firstName"
                    variant="outlined"
                    fullWidth
                    id="firstName"
                    label="First Name"
                    autoFocus
                    value={firstName}
                    onChange={(e)=> setFirstName(e.target.value)}
                  />
                </Grid>
                <Grid item sm={6}>
                  <TextField
                    autoComplete="lastName"
                    name="lastName"
                    variant="outlined"
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    autoFocus
                    value={lastName}
                    onChange={(e)=> setLastName(e.target.value)}
                  />
                </Grid>
              <Grid item xs={12}>
                <Grid item sm={6}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    id="email"
                    className="sm-6"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e)=> setEmail(e.target.value)}
                  />
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid item sm={6}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    name="currentPassword"
                    label="Current Password"
                    type="password"
                    id="currentPassword"
                    autoComplete="current-password"
                    value={password}
                    onChange={handleCurrentPasswordChange}
                  />
                </Grid>
              </Grid>  
            </Grid>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={classes.submit}
              disabled={isDisabled}
            >
              Save Changes
            </Button>
            <Button
              variant="contained"
              color="primary"
              className={classes.submit}
              style={{ marginLeft: 10}}
              onClick= {() => props.history.push(`/apps/${props.app.key}/account/change_password`)}
            >
              Change Password
            </Button>
          </form>
        </div>
        <Divider />
        <div className={classes.divWrapper}>
          Photo
          <Avatar
            className={classes.participantAvatar}
            src={avatarUrl}
          />
          <Button
            variant="contained"
            color="primary"
            className={[classes.submit, classes.fileUploadBtn]}
          >
            Upload New Photo
            <input
              type="file"
              onChange={handlePhotoChange}
              className={classes.fileupload}
            />
          </Button>
          <Button
            variant="contained"
            className={[classes.submit]}
            style={{ marginLeft: 10}}
            onClick={handleRemovePhoto}
          >
            Remove Photo
          </Button>
        </div>
      </Container>
    </React.Fragment>
  )
}


function mapStateToProps(state) {
  const { current_user, app } = state 
  return {
    current_user,
    app
  }
}


export default withRouter(connect(mapStateToProps)(Account))