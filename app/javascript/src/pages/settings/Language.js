import React from 'react'
import langsOptions from '../../shared/langsOptions'
import serialize from 'form-serialize'

import { withRouter, Route } from 'react-router-dom'
import { connect } from 'react-redux'


import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import Chip from '@material-ui/core/Chip'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import Box from '@material-ui/core/Box'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import MuiLink from '@material-ui/core/Link'

import graphql from '../../graphql/client'
import {toSnakeCase} from '../../shared/caseConverter'
import FormDialog from '../../components/FormDialog'
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  root: {
    [theme.breakpoints.up('sm')]: {
      margin: theme.spacing(3),
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
    margin: '50px!important',
    marginTop: '35px!important'
  },
  submitButton: {
    backgroundColor: '#FFD300',
    color: '#000000',
    marginTop: 25,
    width: 200,
    height: 50
  },
  tableCellRoot: {
    paddingTop: 0,
    paddingBottom: 0,
    border: "unset"
  }
}));

export default function LanguageForm({settings, update, namespace, fields}){

  const classes = useStyles();

  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedLang, setSelectedLang] = React.useState(null)
  const formRef = React.createRef();

  function handleChange(value){
    const val = value.currentTarget.dataset.value
    const serializedData = serialize(formRef.current, { hash: true, empty: true })
    const data = toSnakeCase(serializedData)

    let next = {}

    fields.map((field)=>{
      next[`${field}_${val}`] = ""
    })

    // const newData = Object.assign({}, data.settings, next)
    const newData = Object.assign({}, {key: settings.key}, next)

    console.log(settings)
    console.log("UPDATEATE", newData)

    update({app: newData})
    toggleDialog()
  }

  function renderLangDialog(){
    return isOpen && (
      <FormDialog 
        open={isOpen}
        //contentText={"lipsum"}
        titleContent={"Save Assignment rule"}
        formComponent={
          //!loading ?
            <form>

              <Select
                value={selectedLang}
                onChange={handleChange}
                inputProps={{
                  name: 'age',
                  id: 'age-simple',
                }}>

                {
                  langsOptions.map((o)=>(
                    <MenuItem value={o.value}>
                      {o.label}
                    </MenuItem> 
                  ))
                }
                
                
              </Select>

            </form> 
            //: <CircularProgress/>
        }
        dialogButtons={
          <React.Fragment>
            <Button onClick={toggleDialog} color="secondary">
              Cancel
            </Button>

            <Button //onClick={this.submitAssignment } 
              color="primary"> 
              Update
            </Button>

          </React.Fragment>
        }
        //actions={actions} 
        //onClose={this.close} 
        //heading={this.props.title}
        >
      </FormDialog>
    )
  }

  function toggleDialog(){
    setIsOpen(!isOpen)
  }

  function handleSubmit(){
    const serializedData = serialize(formRef.current, { hash: true, empty: true })
    const data = toSnakeCase(serializedData)
    update(data)
  }

  return (

    <Paper
      elevation={0}
      classes={{
        root: classes.root
    }}>

      <form ref={formRef}>
        <Typography variant="h6" gutterBottom style={{margin: '30px auto', fontSize: 18}}>
          Translation
        </Typography>
        <Divider style={{marginLeft: -30, width: 'calc(100% + 260px)'}}/>

        <Button onClick={toggleDialog} variant={"contained"} color={"primary"} style={{marginTop: 30}}>
          Add language
        </Button>

        <Box mt={2} mb={2}>
          <Table>
            {/*<TableHead>*/}
            {/*  <TableRow>*/}
            {/*    <TableCell>Locale</TableCell>*/}

            {/*    {*/}
            {/*      fields.map((field)=>(*/}
            {/*        <TableCell align="left">{field}</TableCell>*/}
            {/*      ))*/}
            {/*    }*/}

            {/*  </TableRow>*/}
            {/*</TableHead>*/}
            <TableBody>
              {settings.translations.map(row => (
                <TableRow key={row.locale}>
                  <TableCell component="th" scope="row" classes={{root: classes.tableCellRoot}}>
                    {row.locale}
                  </TableCell>

                  {
                    fields.map((field)=>{
                      return <TableCell align="left" classes={{root: classes.tableCellRoot}}>
                              <TextField
                                //id="standard-name"
                                label={field}
                                variant={'outlined'}
                                defaultValue={row[field]}
                                name={`${namespace}[${field}_${row.locale}]`}
                                margin="normal"
                              />
                            </TableCell>
                    })
                  }

                  {
                    /*
                      <TableCell align="left">
                        <TextField
                          //id="standard-name"
                          label="Site Description"
                          defaultValue={row.site_description}
                          name={`settings[site_description_${row.locale}]`}
                          margin="normal"
                        />
                      </TableCell>
                    */
                  }


                </TableRow>
              ))}
            </TableBody>
          </Table>

        </Box>

        <Grid container alignContent={"flex-end"}>
          <Button onClick={handleSubmit} variant={"contained"} classes={{root: classes.submitButton}}>
            Submit
          </Button>
        </Grid>

      </form>

      {renderLangDialog()}

    </Paper>
  )
}