import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

const styles = {
    card: {
        maxWidth: 345,
    },
    media: {
        height: 140,
    },
    selected:{
        fill: '#041033'
    },
    unselected: {
        fill: '#041033'
    }
};

function Guide(props) {
    const {selected, name, onSelect, children} = props
    return (
        <>
            <div style={{width: '100%', height: 100, borderBottom: 'solid 1px rgba(0,0,0,0.1)', padding: 10, display: 'flex', alignItems: 'center' }}
                 onClick={onSelect}>
                <CheckCircleIcon style={{width: 19, height: 19, fill: selected ? '#65AB72': '#FFD3D8', margin: 8}}/>
                <div style={{margin: 10, flex: 1, display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{fontSize: 18}}>{name}</span>
                    {
                        selected ?
                            <ExpandMoreIcon />
                        :
                            <ChevronRightIcon/>
                    }
                </div>
            </div>
            {
                selected && (
                    <div style={{width: '100%',
                        borderBottom: 'solid 1px rgba(0,0,0,0.1)',
                        alignItems: 'center',
                        padding: '60px 52px'
                    }}
                         onClick={onSelect}>
                        {children}
                    </div>
                )
            }

        </>
    )
}


export default withStyles(styles)(Guide)