import React, { Component } from "react";
import graphql from "../../graphql/client";
import { CREATE_CAMPAIGN, UPDATE_CAMPAIGN, DELIVER_CAMPAIGN, TEST_CAMPAIGN } from "../../graphql/mutations";


import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField';
import Typography from "@material-ui/core/Typography";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


import FieldRenderer from '../../shared/FormFields'
import {camelizeKeys} from '../../actions/conversation'
import {errorMessage, successMessage} from '../../actions/status_messages'
import serialize from 'form-serialize'
import {isEmpty} from 'lodash'
import {CampaignEditor} from './editor';


export function TestEmailDialog({handleClose, app, data, dispatch, mode}) {
  const [open, setOpen] = React.useState(true); 
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState([])
  const form = React.useRef(null);
  if(data.id == undefined){
    graphql(
      CREATE_CAMPAIGN,
      {
        appKey: app.key,
        mode: mode,
        operation: "create",
        campaignParams: data,
      },
      {
        success: (successData) => {
          data.id = successData.campaignCreate.campaign.id
          if(isEmpty(successData.campaignCreate.errors)){
              this.props.dispatch(successMessage("Email saved successfully."))
          }else{
            const errs = []
            Object.entries(successData.campaignCreate.errors).map((key) => {
              errs.push(key[0] + ' ' + key[1].join(', '))
            })
            this.props.dispatch(errorMessage(errs.join(', ')))
          }
        }
      },
    );
  }

 

  const handleSend = (e) => {
    setErrors([]);
    const serializedData = serialize(form.current, { 
      hash: true, empty: true 
    })
    const params = {
      appKey: app.key,
      id: data.id, 
      toEmails: serializedData.campaignTest.emailAddresses,
      template: data.template,
      includeUnsubscriptionLink: data.includeUnsubscriptionLink,
      footerAddress: data.footerAddress,
      helpEmail: data.helpEmail,
      helpContact: data.helpContact
    };

    graphql(TEST_CAMPAIGN, params, {
      success: (data) => { 
        const errors = data.campaignTest.errors
        
        if(!isEmpty(errors)) { 
          setErrors(errors);
          return;
        }
        else  
          dispatch(successMessage("Test email sent successfully!"));  
        handleClose(); 
      },
      error: (data) => {
        dispatch(errorMessage("Failed to send test email."))
      },
    });
  };

  return (
    <div> 
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Send a test email</DialogTitle>
        <DialogContent>
          <form ref={form}> 
            <FieldRenderer 
              namespace={'campaignTest'}
              data={camelizeKeys({
                label: 'To',
                name: 'emailAddresses',
                type: 'string',
                grid: { xs: 12 }
              })}
              props={{
                data: open
              }}
              errors={ errors }
            />

            <Typography color="primary">
              To send to multiple email addresses separate them by a comma or space.
            </Typography>
            <Typography color="secondary">
              Test email will include sample user data (Ruby Russell)
            </Typography>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSend} variant="contained" color="primary" disabled={loading}>
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}