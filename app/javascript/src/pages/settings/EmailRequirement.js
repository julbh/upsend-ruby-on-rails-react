import React , {useState} from 'react'

import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import FormGroup from '@material-ui/core/FormGroup'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import RadioGroup from '@material-ui/core/RadioGroup'
import Radio from '@material-ui/core/Radio'
import Button from '@material-ui/core/Button'
import Paper from "@material-ui/core/Paper";
import {makeStyles} from "@material-ui/core/styles";


const useStyles = makeStyles(theme => ({
    root: {
        margin: '50px!important',
        marginTop: '35px!important'
    },
    checkLabel: {
        fontSize: 15
    },
    radioIcon: {
        '& .MuiSvgIcon-root': {
            width: 20,
            height: 20,
        }
    },submitButton: {
        backgroundColor: '#FFD300',
        marginTop: 25,
        color: '#000000',
        width: 250,
        height: 50
    },
}));

export default function EmailRequirement({settings, update}){

  const classes = useStyles();
  const [value, setValue] = useState(settings.emailRequirement)

  function handleChange(e){
    setValue(e.target.value)
  }

  function handleSubmit(){
    const data = {
      app: {
        email_requirement: value
      }
    } 
    update(data)
  }

  return (
      <Paper
          elevation={0}
          classes={{
              root: classes.root
          }}>
          <Typography variant="h6" gutterBottom style={{margin: '30px auto', fontSize: 18}}>
              Email Requirements
          </Typography>
          <Divider style={{marginLeft: -30, width: 'calc(100% + 260px)'}}/>

          <Box mb={2}>
            <Typography variant={"h6"} style={{fontSize: 18, marginTop: 30}}>
              {I18n.t("settings.email_requirement.title")}
            </Typography>

            <Typography variant={"body1"} style={{fontSize: 13, marginTop: 5}}>
              {I18n.t("settings.email_requirement.hint")}
            </Typography>

            <Box mt={2}>
            <FormLabel component="legend" style={{fontSize: 13, marginTop: -10}}>
              {I18n.t("settings.email_requirement.ask")}
            </FormLabel>

          </Box>

          <Box mt={2} mb={2}>

            <RadioGroup
              aria-label="email_requirement"
              name="email_requirement"
              //className={classes.group}
              value={value}
              onChange={handleChange}
            >

            {
              I18n.t("settings.email_requirement.options").map((o, i)=>{
                return <React.Fragment key={`email_requirement_options-${i}`}>
                        <FormControlLabel
                          value={o.value}
                          control={<Radio classes={{root: classes.radioIcon}}/>}
                          label={o.label}
                          classes={{
                              label: classes.checkLabel
                          }}
                        />
                        <Typography variant={"overline"} style={{fontSize: 13}}>
                          {o.hint}
                        </Typography>
                      </React.Fragment>
              })
            }


            </RadioGroup>

          </Box>

          <Button onClick={handleSubmit}
            variant={"contained"} color={"primary"}
                  classes={{root: classes.submitButton}}
          >
              Save Settings
          </Button>


        </Box>
      </Paper>

  )
}