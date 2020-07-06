 
import React, { useState } from 'react'


import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'

export default function NewUser({ isOpen, handleSubmit, handleClose }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  
  return (
    <div>   
      <Dialog
        open={isOpen}
        onClose={handleClose}
        aria-labelledby="scroll-dialog-title"
      >
        <DialogTitle id="scroll-dialog-title">Create New User</DialogTitle>
        <DialogContent dividers={true}>
          <Grid>
            <Grid item xs={12}>
              <TextField
                label="Name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                margin="normal"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} variant="outlined" color="primary">
            Cancel
          </Button>
          <Button autoFocus onClick={() => handleSubmit(name, email)} variant="outlined" color="primary">
            Create User
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}