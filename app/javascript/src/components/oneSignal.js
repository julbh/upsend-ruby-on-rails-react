import React, { useEffect } from "react";

import { withRouter } from 'react-router-dom';
import { connect } from "react-redux";

function OneSignal(props) {
  const {
    current_user,
  } = props;

  const initializeOnesignal = () => {
    var OneSignal = window.OneSignal || [];
    if(OneSignal.initialized === false)
    {
      OneSignal.push(function() {
        OneSignal.init({
          appId: process.env.ONESIGNAL_APP_ID,
          notifyButton: {
            enable: true,
          },
          allowLocalhostAsSecureOrigin: true,
        }),
        OneSignal.on('subscriptionChange', function (isSubscribed) {
          if(isSubscribed === true){
            console.log("subcribed")
            OneSignal.setExternalUserId(`User-${current_user.email}`);  
          }
          else{
            console.log("unsubcribed")  
            OneSignal.removeExternalUserId()
          }
        })
      });
    }
  }

  return (
    <React.Fragment>
      {
        initializeOnesignal()
      }
    </React.Fragment>
  );
}

function mapStateToProps(state) {
  const { current_user } = state;

  return {
    current_user,
  };
}

export default withRouter(connect(mapStateToProps)(OneSignal));
