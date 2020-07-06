import React from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AddIcon from '@material-ui/icons/Add';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import PeopleIcon from '@material-ui/icons/People';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

import NewUser from './newUser';
import NewLead from './newLead';
import ImportContacts from './ImportContacts';

export default function NewUserOrLead({
  app,
  openNewLead,
  openNewUser,
  openImportContact,
  handleUserSubmit,
  handleLeadSubmit,
  handleCloseNewUserOpen,
  handleCloseNewLeadOpen,
  handleCloseImportContact,
  handleNewUserOpen,
  handleNewLeadOpen,
  handleImportContact
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        aria-controls="customized-menu"
        aria-haspopup="true"
        variant="contained"
        className="buttonPosi"
        onClick={handleClick}
      >
        <PeopleIcon fontSize="small" />
        &nbsp;&nbsp;&nbsp;New User or Lead
        <ArrowDropDownIcon fontSize="small" />
      </Button>
      <Menu
        id="customized-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleNewUserOpen} >
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Create New User" />
        </MenuItem>
        <MenuItem onClick={handleNewLeadOpen}>
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Create New Lead" />
        </MenuItem>
        <MenuItem onClick={handleImportContact}>
          <ListItemIcon>
            <CloudUploadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Import People" />
        </MenuItem>
      </Menu>

      <NewUser isOpen={openNewUser} handleSubmit={handleUserSubmit} handleClose={handleCloseNewUserOpen} />
      <NewLead isOpen={openNewLead} handleSubmit={handleLeadSubmit} handleClose={handleCloseNewLeadOpen}/>
      <ImportContacts isOpen={openImportContact} app={app} handleClose={handleCloseImportContact} />
    </div>
  );
}
