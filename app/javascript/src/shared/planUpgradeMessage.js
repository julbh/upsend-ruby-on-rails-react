import React, { useState } from "react"; 
import Box from '@material-ui/core/Box';
import {Link} from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

function renderMessage(context) {
  switch(context) {
    case 'addTeamMember':
      return 'Please upgrade your plan to add more team members.';
    default:
      return 'Please upgrade your plan to access this feature';
  }
}

function PlanUpgradeMessage(props) { 
  return (
    <Box component="div" m={5} align='center' style={{border: '1px dashed', background: '#FFF9DE'}}>
      <p>{renderMessage(props.messageContext)}</p>
    </Box>
    
  );
}

export default PlanUpgradeMessage;


export function UpgradeDialog({messageContext, isOpen, handleClose, app}) {
  // const [open, setOpen] = React.useState(false);

  // const handleClickOpen = () => {
  //   setOpen(true);
  // };
  console.log(app);
 
  return (
    <div>
      
      <Dialog
        open={isOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
        	Upgrade Plan
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {renderMessage(messageContext)}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          
          <Link class="MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textPrimary" to={`${window.location.pathname.split("/",3).join("/")}/pricing`} >Upgrade Now</Link>
        </DialogActions>
      </Dialog>
    </div>
  );
}

