import React from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import graphql from '../../graphql/client'
import icon_export from "../../icons/bxs-file-export.svg";
import {errorMessage, successMessage} from '../../actions/status_messages'
import { EXPORT_USERS } from '../../graphql/queries'

export default function ExportUsers(props) {
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

  const handleExport = () => {
    const usersId = selectedUsers.map((o) => {
      return o.id;
    });
    graphql(EXPORT_USERS, {
      appKey: app.key,
      usersId: usersId,
      allSelected: allSelected
    }, {
      success: (data)=>{
        dispatch(successMessage("Mail is sent for exported User"))
        setOpen(false)
      },
      error: (error)=>{
        console.log("ERRR Exporting Users", error)
      }
    })
  }
  return (
    <div>
      <a className={selectedUsers.length > 0 ? 'disable-btn' : 'disable-btn disabled'} onClick={handleClickOpen}>
            &nbsp;&nbsp;&nbsp;
            <img src={icon_export} style={{ height: "20px" }} />
            &nbsp;&nbsp;Export contracts&nbsp;&nbsp;&nbsp;
      </a>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
          Export {allSelected ? 'all' : `these ${selectedUsers.length}` } contracts
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <RadioGroup aria-label="exportColumns" name="exportColumns" value="allColumns">
              <FormControlLabel value="allColumns" control={<Radio />} label="Export With all columns" />
            </RadioGroup>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleExport} color="primary">
            Export {allSelected ? 'all' : `these ${selectedUsers.length}` } contracts
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
