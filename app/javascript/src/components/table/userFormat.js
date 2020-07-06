import React from 'react'
import Moment from 'react-moment';
import Badge from '@material-ui/core/Badge';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import styled from '@emotion/styled'
import MuiChip from '@material-ui/core/Chip';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import 'moment-timezone';

const NameWrapper = styled.span`
  display: flex;
  align-items: center;
`;

const AvatarWrapper = styled.div`
  margin-right: 8px;
`;

const useStyles = makeStyles(theme => ({
  root: {
    //border: '1px solid rgba(0, 0, 0, .125)',
    borderRadius: '3px',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
  },
  colorPrimary: {
    backgroundColor: '#12af12'
  },
  'colorSecondary': {
    color: theme.palette.primary.dark,
    backgroundColor: '#f5f5d5'
  },

  //online: {colorSecondary: theme.palette.common.green},
  //offline: {background: theme.palette.common.offline}
  
}));

function Chip(props) {
  const classes = useStyles();

  return (
    <MuiChip {...props} 
      classes={classes}>
      Theming
    </MuiChip>
  );
}

function UserBadge(props) {
  const classes = useStyles();
  const {row} = props
  return (
    <Badge 
      classes={{badge: row.online ? classes.online : classes.offline} } 
      color={row.online ? "primary" : 'secondary' }
      variant="dot">
      <Avatar
        name={row.email}
        size="medium"
        src={row.avatarUrl}
      />
    </Badge>
  );
}

const isHidden = (field, config, defaultValue) => {
  try {
    if(!config)
      return defaultValue

    var result = config.find(obj => {
      return (field === "email" ? (obj.field === field && obj.title === field) : obj.field === field)
    })
    const state = result && result.hasOwnProperty('hidden') ? result.hidden : defaultValue 
    return state; 
  } catch (err) {
    return defaultValue 
  } 
}

const userFormat = function(showUserDrawer, app, columnConfig = []){
  let opts = [
    //{field: 'id', title: 'id' }, 
    {field: 'email', title: 'Name', 
      render: (row) => {
        return row && 

        <NameWrapper 
          onClick={(e)=>(showUserDrawer && showUserDrawer(row))}>
          <AvatarWrapper>
            <UserBadge row={row}/>
          </AvatarWrapper>

          <Grid container direction={"column"}>

            <Typography variant="overline" display="block">
              {row.displayName}
            </Typography>

            <Typography variant={"caption"}>
              {row.email}
            </Typography>

          </Grid>
        
        </NameWrapper>
      },
      hidden: isHidden('email+name', columnConfig, false)
    },
    {field: 'email', title:  'email', hidden: isHidden('email', columnConfig, true)}, 
    {field: 'state', title: 'state', render: (row)=>{
      return <Chip
              color={row.state === "subscribed" ? 'primary' : 'secondary'}
              label={row.state} 
              clickable={false}
             />
    }, hidden: isHidden('state', columnConfig, false) },
    {field: 'online', title:  'online', hidden: isHidden('online',  columnConfig, false)}, 
    {field: 'lat', title: 'lat', hidden: isHidden('lat', columnConfig, true)}, 
    {field: 'lng', title:  'lng', hidden: isHidden('lng', columnConfig, true)},  
    {field: 'postal', title:'postal', hidden: isHidden('postal', columnConfig, true)}, 
    {field: 'browserLanguage', title:'browser Language', hidden: isHidden('browserLanguage',  columnConfig, true)}, 
    {field: 'referrer', title:'referrer', hidden: isHidden('referrer', columnConfig, true)}, 
    {field: 'os', title:'os', hidden: isHidden('os', columnConfig, true)}, 
    {field: 'osVersion', title:'os Version', hidden: isHidden('osVersion',  columnConfig, true)}, 
    {field: 'lang', title:'lang', hidden: isHidden('lang', columnConfig, true)}, 
    {field: 'webSessions', title:'Web sessions', hidden: isHidden('webSessions', columnConfig, true)}, 
    {field: 'LastSeen', title:'Last seen', hidden: isHidden('LastSeen', columnConfig, true)},
    {field: 'city', title:'City', hidden: isHidden('city', columnConfig, false)},
    {field: 'country', title:'Country', hidden: isHidden('country', columnConfig, false)},
    {field: 'FirstSeen', title:'First seen', hidden: isHidden('FirstSeen', columnConfig, true)},
    {
      field: "createdAt",
      title: "Created at",
      render: (row) =>
        (row && row.createdAt) ? <Moment utc fromNow>{row.createdAt}</Moment> : undefined,
      hidden: isHidden('createdAt', columnConfig, true)
    },

    {field: 'lastVisitedAt', 
      title: 'last visited at',
      render: row => ((row && row.lastVisitedAt)  ? <Moment utc fromNow>
                                    {row.lastVisitedAt}
                                  </Moment> : undefined),
      hidden: isHidden('lastVisitedAt', columnConfig, true)
    }]

    
    if(app.customFields && app.customFields.length > 0){
      const other = app.customFields.map((o)=>( 
        {
          hidden: true,
          field: o.name , 
          title: o.name, 
          render: row => row && row.properties[o.name]
        }
      ))
      opts = opts.concat(other)
    }

    

    return opts

}

export default userFormat

//function mapStateToProps(state) {
//  const { app } = state
//  return {
//    app
//  }
//}
//
//export default connect(mapStateToProps)(userFormat)
