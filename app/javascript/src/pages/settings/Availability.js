import React, {useState, useEffect} from 'react'
import langsOptions from '../../shared/langsOptions'
import serialize from 'form-serialize'

import { withRouter, Route } from 'react-router-dom'
import { connect } from 'react-redux'

import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import TextField from '@material-ui/core/TextField'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import Chip from '@material-ui/core/Chip'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import InputLabel from '@material-ui/core/InputLabel'
import Box from '@material-ui/core/Box'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Radio from '@material-ui/core/Radio'
import MuiLink from '@material-ui/core/Link'

import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import graphql from '../../graphql/client'
import {toSnakeCase} from '../../shared/caseConverter'
import FormDialog from '../../components/FormDialog'


//const options = I18n.t("settings.availability.reply_time.options")
/*[
  {value: "auto", label: "Automatic reply time. Currently El equipo responderá lo antes posible"}, 
  {value: "minutes", label: "El equipo suele responder en cuestión de minutos."},
  {value: "hours", label: "El equipo suele responder en cuestión de horas."},
  {value: "1 day", label: "El equipo suele responder en un día."},
]*/

import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    formControlLabel: {
        fontSize: 13
    },
    submitButton: {
        backgroundColor: '#FFD300',
        marginTop: 25,
        color: '#000000',
        width: 250,
        height: 50
    },
    radioIcon: {
        '& .MuiSvgIcon-root': {
            width: 15,
            height: 15
        }
    }
}));

export default function LanguageForm({settings, update, namespace, fields}){

    const classes = useStyles();

  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedOption, setSelectedOption] = React.useState(settings.replyTime)
  const [records, setRecords] = useState(settings.teamSchedule)

  let formRef = React.createRef();

  function handleChange(e){
    setSelectedOption(e.target.value)
  }

  function toggleDialog(){
    setIsOpen(!isOpen)
  }

  function handleSubmit(){
    /*const serializedData = serialize(formRef, { hash: true, empty: true })
    const data = toSnakeCase(serializedData)
    console.log(data)*/
    console.log(records)
    console.log(selectedOption)
    const data = {
      app:{
        team_schedule: records,
        reply_time: selectedOption
      }
    }
    update(data)
  }

  const formcontrolLabel = {
      fontSize: 13
  }

  return (

    <form ref={(ref)=> formRef = ref } style={{marginLeft: 30}}>

      <Box mb={2} style={{display: 'flex', marginTop: 35, marginBottom: 25}}>

        <Typography variant="h4" style={{fontSize: 18}}>
          {I18n.t("settings.availability.title")}
        </Typography>
        
        <Typography variant="subtitle1" gutterBottom style={{fontSize: 13, marginLeft: 20}}>
          {I18n.t("settings.availability.hint")}
        </Typography>

      </Box>
      <Divider style={{width: 'calc(100% + 260px)'}}/>

      <Box mb={2} style={{marginTop: 40}}>
        <Typography variant="h6" style={{fontSize: 18}}>
          {I18n.t("settings.availability.title2")}
        </Typography>
        
        <Typography variant="body1" gutterBottom style={{fontSize: 13}}>
          {I18n.t("settings.availability.hint2")}
        </Typography>

      </Box>

      <Box mb={2}>

        <Typography gutterBottom variant={"overline"} style={{fontSize: 13}}>
          {I18n.t("settings.availability.timezone", {tz: settings.timezone })}
        </Typography>

        <AvailabilitySchedule 
          records={records} 
          setRecords={setRecords} 
        />

      </Box>

      <Box mb={2} mt={2} style={{marginTop: 30}}>

        <Typography variant="h6" style={{fontSize: 18}}>
          {I18n.t("settings.availability.reply_time.title")}
        </Typography>

        <Typography variant="body1" gutterBottom style={{fontSize: 13}}>
          {I18n.t("settings.availability.reply_time.hint")}
        </Typography>


        <Box mt={2} mb={2}>
          <FormControl component="fieldset">
            
            <RadioGroup
              aria-label="reply time"
              name="reply_time"
              //className={classes.group}
              value={selectedOption}
              onChange={handleChange}
            >
              {
                I18n.t("settings.availability.reply_time.options")
                .map((o)=>(
                  <FormControlLabel 
                    key={o.value}
                    value={o.value}
                    variant={'outlined'}
                    control={<Radio classes={{root: classes.radioIcon}}/>}
                    label={o.label}
                    classes={{
                        label: classes.formControlLabel
                    }}
                  />
                ))
              }

            </RadioGroup>
          </FormControl>

        </Box>

      </Box>

      <Box mb={2}>

        <Typography variant="caption" gutterBottom>
          {I18n.t("settings.availability.reply_time.hint2")}
        </Typography>

      </Box>

      <Box>
        <Button onClick={handleSubmit} variant="contained" color="primary" classes={{root: classes.submitButton}}>
            Save Settings
        </Button>
      </Box>

    </form>
  )
}


function AvailabilitySchedule({records, setRecords}){

  function addRecord(){
    const newRecords = records.concat({
      day: null,
      from: null,
      to: null
    })

    setRecords(newRecords)
  }

  function update(item, index){
    const newRecords = records.map((o, i)=>{
      return i === index ? item : o 
    })
    setRecords(newRecords)
  }

  function removeItem(index){
    const newRecords = records.filter((o, i)=> i != index)
    setRecords(newRecords)
  }

  return (

    <Box mt={2}>
        <Grid container gutterBottom justify={"flex-start"}>
            <Box mt={2} mb={2}>
                <Button onClick={addRecord} color={"primary"} variant={"contained"}>
                    <AddIcon/> add availability
                </Button>
            </Box>
        </Grid>
      {
        records.map((o, index)=>(
          <AvailabilityRecord 
            key={index} 
            record={o} 
            update={update}
            index={index}
            removeItem={removeItem}
          />
        ))
      }
      



        
    </Box>

  )
}

function AvailabilityRecord({record, update, index, removeItem}){

  const [item, setRecord] = useState(record)

  function handleChange(data){
    setRecord(
      Object.assign({}, item, data)
    )
  }

  function genHours(t1, t2){
    return Array(24 * 4).fill(0).map((_, i) => { return ('0' + ~~(i / 4) + ':0' + 60  * (i / 4 % 1)).replace(/\d(\d\d)/g, '$1') });

  }

  useEffect(()=>{
    update(item, index)
  }, [item])


  function deleteItem(){
    removeItem(index)
  }

  return (
    <Grid container 
    direction="row" 
    justify="flex-start"
    alignItems="center"
    gutterBottom>
 
      <Grid item style={{minWidth: 150, marginRight: 30}}>
        <FormControl component="fieldset"  variant="outlined" style={{width: '100%'}}>

          <InputLabel variant='outlined' htmlFor="day">day</InputLabel>

          <Select
            value={item.day}
            variant='outlined'
            onChange={(e)=>handleChange({day: e.target.value})}
            inputProps={{
              name: 'day',
            }}
          >
            {
              I18n.translations.en.date.abbr_day_names.map((o, i)=>(
                <MenuItem value={o.toLocaleLowerCase()}>{
                  I18n.translations.en.date.day_names[i]
                }</MenuItem>  
              ))
            }
          </Select>
        
        </FormControl>
      </Grid>

      <Grid item style={{minWidth: 150, marginRight: 30}}>
        <FormControl component="fieldset" variant="outlined" style={{width: '100%'}}>

          <InputLabel variant='outlined' htmlFor="from">from</InputLabel>

          <Select
            value={item.from}
            onChange={(e)=>handleChange({from: e.target.value})}
            variant='outlined'
            inputProps={{
              name: 'from',
            }}
          >
            {
              genHours("00:00", "23:30").map((o)=>(
                <MenuItem 
                  key={`from-${o}`} 
                  value={o}>
                  {o}
                </MenuItem>
              ))
            }
          </Select>
      
        </FormControl>
      </Grid>

      <Grid item style={{minWidth: 150, marginRight: 30}}>
        <FormControl component="fieldset" variant="outlined" style={{width: '100%'}}>

          <InputLabel variant='outlined' htmlFor="to">to</InputLabel>
          <Select
            value={item.to}
            onChange={(e)=>handleChange({to: e.target.value})}
            variant='outlined'
            inputProps={{
              name: 'to',
            }}
          >
            {
              genHours("00:00", "23:30").map((o)=>(
                <MenuItem key={`to-${o}`} value={o}>
                  {o}
                </MenuItem>
              ))
            }
          </Select>
      
        </FormControl>
      </Grid>

      <Grid item>
         <IconButton onClick={deleteItem}>
          <DeleteIcon></DeleteIcon>
         </IconButton>
      </Grid>

    </Grid>
  )
}