import React, {useState} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import InsertComment from '@material-ui/icons/InsertComment';
import {connect} from "react-redux";
import Avatar from "@material-ui/core/Avatar";

import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import OutlinedInput from "@material-ui/core/OutlinedInput";
import IconButton from "@material-ui/core/IconButton";
import SentimentSatisfiedIcon from '@material-ui/icons/SentimentSatisfied';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import AttachmentRoundedIcon from '@material-ui/icons/AttachmentRounded';
import SendIcon from '@material-ui/icons/Send';


const styles = theme => ({
    fab: {
        margin: theme.spacing.unit,
    },
    extendedIcon: {
        marginRight: theme.spacing.unit,
    },
});

function LiveChat(props) {
    const { classes, app } = props;
    const [showChat, setShowChat] = useState(false);
    const [message, setMessage] = useState('')
    const handleOnChange = event => {
        setMessage(event.target.value);
    }
    return (
        <>
            {
                showChat && (
                    <div style={{position: 'fixed', right: 20, bottom: 80,maxHeight: 740, width: 400, backgroundColor: 'rgb(250, 246, 241)',
                        marginBottom: 10, zIndex: 1000, borderRadius: 5, height: 'calc(80vh - 50px)', border: 'solid 1px'}}>
                        <div style={{width: '100%', height: 250, backgroundColor: '#000000', padding: 35, color: 'white'}}>
                            <div style={{marginLeft: 20}}>
                                <div><span style={{fontSize: 30}}><b>Upsend</b></span></div>
                                <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 10, marginBottom: 10}}>
                                    <Avatar
                                        style={{width: 80, height: 80}}
                                        src="../../../assets/user1.jpg"
                                    />
                                    <Avatar
                                        style={{width: 80, height: 80}}
                                        src="../../../assets/user2.jpg"
                                    />
                                    <Avatar
                                        style={{width: 80, height: 80}}
                                        src="../../../assets/user3.jpg"
                                    />
                                </div>
                                <div>
                                    The team typically replies in one business day
                                </div>
                            </div>
                        </div>
                        <div style={{position: 'fixed', bottom: 90}}>
                            <OutlinedInput
                                id="outlined-adornment-password"
                                style={{width: 398}}
                                type='text'
                                value={message}
                                onChange={handleOnChange}
                                endAdornment={
                                    (message.length === 0) ?
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            edge="end"
                                        >
                                            <AttachmentRoundedIcon />
                                        </IconButton>
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            edge="end"
                                        >
                                            <SentimentSatisfiedIcon />
                                        </IconButton>
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            edge="end"
                                        >
                                            <InsertDriveFileIcon />
                                        </IconButton>
                                    </InputAdornment>
                                        :
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            edge="end"
                                        >
                                            <SentimentSatisfiedIcon />
                                        </IconButton>
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            edge="end"
                                        >
                                            <SendIcon />
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                        </div>

                    </div>
                )
            }
            <div style={{position: 'fixed', bottom: 20, right: 20}}>
                <Fab
                    size="medium"
                    color="secondary"
                    aria-label="Add"
                    style={{backgroundColor: '#1a1aa6', paddingLeft: 7, paddingTop: 4}}
                    onClick={() => {setShowChat(!showChat)}}
                >
                    <InsertComment className={classes.extendedIcon} />
                </Fab>
            </div>
        </>
    );
}

LiveChat.propTypes = {
    classes: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const { auth, app, conversations, conversation, app_user } = state;
    const { loading, isAuthenticated } = auth;

    return {
        conversations,
        conversation,
        app_user,
        app,
        isAuthenticated,
    };
}

export default withStyles(styles)(connect(mapStateToProps)(LiveChat));