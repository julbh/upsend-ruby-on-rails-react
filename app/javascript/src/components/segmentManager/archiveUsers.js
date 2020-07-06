import React from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {isEmpty} from 'lodash'

import graphql from '../../graphql/client'
import icon_delete from "../../icons/bxs-trash.svg";
import {errorMessage, successMessage} from '../../actions/status_messages'
import { ARCHIVED_USERS } from '../../graphql/mutations'

export default function ArchiveUsers(props) {
  const { selectedUsers, app, dispatch, allSelected } = props
  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    if(selectedUsers.length > 0){
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleArchive = () =>  {
    const usersId = selectedUsers.map((o) => {
      return o.id;
    });
    graphql(ARCHIVED_USERS, {
      appKey: app.key, 
      usersId: usersId,
      allSelected: allSelected
    }, {
      success: (data)=>{
        if(isEmpty(data.archivedUsers.errors)){
          dispatch(successMessage("Users Successfully Archived"))
        }
        else{
          dispatch(errorMessage(data.archivedUsers.errors[0]))
        }
      },
      error: (error)=>{
        console.log("ERRR Updating Users", error)
      }
    })
    window.location.reload();
  }

  return (
    <div>
      <a className={selectedUsers.length > 0 ? 'disable-btn' : 'disable-btn disabled'} onClick={handleClickOpen}>
            &nbsp;&nbsp;&nbsp;
            <img src={icon_delete} style={{ height: "20px" }} />
            &nbsp;&nbsp;Archive contracts&nbsp;&nbsp;&nbsp;
      </a>
      <Dialog 
        open={open}
        onClose={handleClose}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
          Archive these contracts?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {allSelected ? 'All' : selectedUsers.length} contracts will be archived.
            Please make sure you close any ongoing conversations with the selected contracts as they will not be accessible once archived.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleArchive} color="primary">
            Archive contracts
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
