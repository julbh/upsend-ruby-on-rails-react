import React, {useState} from 'react'
import { connect } from 'react-redux'

import { omniauthAuthenticate } from '../actions/auth'

import {getCurrentUser} from '../actions/current_user'
import LoadingView from '../components/loadingView'
class AuthLogin extends React.Component {
  constructor(props) {
    super(props)
  }
  
  componentDidMount = () =>{
    this.props.dispatch(omniauthAuthenticate(()=>{
      this.getCurrentUser()
      this.props.history.push("/")
    }))
  }  

  getCurrentUser = () =>{
    this.props.dispatch(getCurrentUser())
  }
  
  render() {
    return (
      <React.Fragment>
        <GetUserDataButton onClick={this.getCurrentUser}/>
      </React.Fragment>
    )
  }
}

function GetUserDataButton(props){
  return <LoadingView onClick={() => props.onClick}/>
}

function mapStateToProps(state) {
  const { auth, current_user, theme } = state
  const { loading, isAuthenticated } = auth

  return {
    current_user,
    loading,
    isAuthenticated,
    theme
  }
}

export default connect(mapStateToProps)(AuthLogin)