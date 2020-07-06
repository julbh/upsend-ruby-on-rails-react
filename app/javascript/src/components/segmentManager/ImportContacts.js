 
import React, {
  useState, 
  useEffect, 
  useRef,
  Component
} from 'react'

import {
  camelizeKeys
} from '../../actions/conversation'

import { withStyles } from '@material-ui/core/styles';

import { withRouter } from "react-router-dom"; 
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem'; 
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField'; 
import FormControlLabel from '@material-ui/core/FormControlLabel'; 
import FormLabel from '@material-ui/core/FormLabel';

//Stepper
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel'; 

//Table
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell'; 
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow'; 
import { 
  IMPORT_USER_FIELDS
} from '../../graphql/queries'

import { 
  IMPORT_CONTACT
} from '../../graphql/mutations'


import graphql from '../../graphql/client'
import Grid from '@material-ui/core/Grid'

import FormDialog from '../FormDialog' 
import FieldRenderer from '../../shared/FormFields'
import serialize from 'form-serialize'


import {
  CREATE_DIRECT_UPLOAD,
} from '../../graphql/mutations'
import {getFileMetadata, directUpload, directUploadWithProgress, BlobUploadWithProgress} from '../../shared/fileUploader'



//import CSVReader from 'react-csv-reader'
import { CSVReader } from 'react-papaparse'
import icon_users from "../../../../assets/images/friends.svg";
import icon_downArrow from "../../../../assets/images/bxs-down-arrow.svg";
 

import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';   
import FormControl from '@material-ui/core/FormControl'; 

import LinearProgress from '@material-ui/core/LinearProgress';


import { BlobUpload } from "activestorage/src/blob_upload";
import { DirectUpload } from "@rails/activestorage"
 
import defaultFields from '../../shared/defaultFields'
import Divider from "@material-ui/core/Divider";
const diagStyle = makeStyles((theme) => ({
    row: {
        width: '100%',
    },
    dialogHeader: {
        padding: 60,
        maxWidth: 615,
        backgroundColor: '#FAF6F1'
    },
    dFlex: {
        display: 'flex'
    },
    headerTitle: {
        fontSize: 42, fontWeight: 'normal'
    },
    headerText: {
        fontSize: 46, marginTop: 70,
        fontWeight: 'bold'
    },
    headerSubText: {
        marginTop: 20, fontSize: 20
    }
}))

export default function ImportContacts({ isOpen, app, handleClose}) {
    const classes = diagStyle();
  const [scroll, setScroll] = React.useState('body');
  const [appUserFields, setAppUserFields] = React.useState([]);



  useEffect(()=>{ 
    fetchUserFields()
  }, [])


  function fetchUserFields(){

    let allFields = defaultFields.map((o)=>(o.name))
    if(app.customFields && app.customFields.length > 0){ 
      const customs = app.customFields.map((o)=>( o.name ))
      allFields = allFields.concat(customs) 
    }
   
    setAppUserFields(allFields)
  }



  const handleClickOpen = (scrollType) => () => {
    setOpen(true);
    setScroll(scrollType);
  };

  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  return (
    <div>
      <Dialog
        fullWidth={true}
        maxWidth={'xl'}
        open={isOpen}
        onClose={handleClose}
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <div className={classes.dFlex}>
            <div id="scroll-dialog-title" className={classes.dialogHeader}>
                <div className={classes.headerTitle}>
                    <span>Import Contracts</span>
                </div>
                <div className={classes.headerText}>
                    <span>
                        Upload a CSV file to import contact profiles
                    </span>
                </div>
                <div className={classes.headerSubText}>
                    <span>
                        You can upload a standard CSV file containing the full name and email of your contacts, to add them to your contact database on UpSend
                    </span>
                </div>
            </div>
            <div dividers={true} style={{width: '100%'}}>
                <ImportFileStepper app={app} appUserFields={appUserFields} />
            </div>
            {/*<DialogActions>*/}
            {/*    <Button autoFocus onClick={handleClose} variant="outlined" color="primary">*/}
            {/*        Close*/}
            {/*    </Button>*/}
            {/*</DialogActions>*/}
        </div>

      </Dialog>
    </div>
  );
}

const IOSSwitch = withStyles((theme) => ({
  root: {
    width: 42,
    height: 26,
    padding: 0,
    margin: theme.spacing(1),
  },
  switchBase: {
    padding: 1,
    '&$checked': {
      transform: 'translateX(16px)',
      color: theme.palette.common.white,
      '& + $track': {
        backgroundColor: '#52d869',
        opacity: 1,
        border: 'none',
      },
    },
    '&$focusVisible $thumb': {
      color: '#52d869',
      border: '6px solid #fff',
    },
  },
  thumb: {
    width: 24,
    height: 24,
  },
  track: {
    borderRadius: 26 / 2,
    border: `1px solid ${theme.palette.grey[400]}`,
    backgroundColor: theme.palette.grey[50],
    opacity: 1,
    transition: theme.transitions.create(['background-color', 'border']),
  },
  checked: {},
  focusVisible: {},
}))(({ classes, ...props }) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});


const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  iconRoot: {
    borderRadius: 4,
    backgroundColor: '#9e9e9e',
    fill: '#9e9e9e',
    color: '#9e9e9e'
  },
  button: {
      width: 'fit-content',
      height: 60,
      backgroundColor: '#FFD300',
      marginTop: 50,
      color: '#000000',
      marginRight: 0,
      whiteSpace: 'nowrap',
      '&:hover': {
          backgroundColor: '#c4a81d'
      }
  },
  buttonDisabled: {
      backgroundColor: 'rgba(255,211,0,0.26)!important'
  },
  formButton: {
      padding: '10px 30px',
      backgroundColor: '#FFD300',
      '&:hover': {
          backgroundColor: '#c4a81d'
      }
  },
  buttonText: {
      backgroundColor: 'transparent',
      padding: '10px 30px'
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  loaderContainer: {
    width: '75%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
  active: {
      fill: '#FFB600',
      backgroundColor: '#FFB600',
      borderRadius: 4,
      color: '#FFFFFFF'
  },
  text: {
      fill: '#000000'
  },
  completed: {
    fill: '#FFB600',
    backgroundColor: '#FFB600',
    borderRadius: 4,
    color: '#FFFFFFF'
  },
    stepperLabel: {
      color: '#777777'
    },
    stepperActiveLabel: {
      color: '#FFFFFF!important'
    },
    stepperRoot: {
      backgroundColor: '#000000'
    },
    input: {
       padding: '6px 10px'
    },
    textField: {
        width: '90%',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingBottom: 0,
        marginTop: 0,
        fontWeight: 500
    },
    formLabel2: {
      fontSize: 15,
      marginRight: 50
    },
    formLabel1: {
        fontSize: 15,
        marginRight: 10
    },
    formHeaderLabel: {
      fontSize: 18,
        textAlign: 'left'
    },
    formHeaderDisplay: {
      display: 'flex',
      marginTop: 15,
      marginBottom: 15
    },
    formBoxDisplay: {
      display: 'flex'
    },
    newSetTypeDialog: {
      width: 600,
      padding: 30
    },
    subFormHeader: {
      fontSize: 15,
      fontWeight: 'normal'
    },
    subFormContent: {
      padding: 0,
      overflowY: 'unset'
    }
}));

function getSteps() {
  return ['Select File', 'Configure Import', 'Proceed Import'];
}

 

 
function ImportFileStepper({app, appUserFields}) {
  const classes = useStyles();
  const diagClasses = diagStyle();
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [csvRecords, setCsvRecords] = React.useState([]);
  const [mappingSelect, setMappingSelect] = React.useState([]);
  const [skipHeader, setSkipHeader] = React.useState(true);
  const [openNewForm, setOpenNewForm] = React.useState(false); 
  const [columnSeparator, setColumnSeparator] = React.useState('');
  const [errors, setErrors] = useState([])
  const [userFields, setUserFields] = React.useState(appUserFields);  
  const [requestMessage, setRequestMessage] = React.useState("Uploading file. Please wait...");  
  const steps = getSteps();
  const form = useRef(null);
  const [completed, setCompleted] = React.useState(0);

  const isStepOptional = (step) => {
    return step === 4;
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };


  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };



  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  // const addItem = () => {
  //     setMappingSelect([
  //               ...mappingSelect, // previous items
  //               { value: ""} // plus the new one
  //           ]
  //     );
  // };

  const skipHeaderChange = () => {
    setSkipHeader(!skipHeader);
  };

 const columnSeparatorChange = (event) => {
    setColumnSeparator(event.target.value);
  };


  const closeNewForm = () => {
    setOpenNewForm(false)
  }

  const submitNewForm = () => {
    const serializedData = serialize(form.current, { 
      hash: true, empty: true 
    })

    const key = serializedData.key.name;
 

       setUserFields([
                ...userFields, // previous items
                key // plus the new one
            ]
      ); 

    setOpenNewForm(false)
  }

  const addNewField = () => { 
    setOpenNewForm(true)
  }

  const definitions = () => { 
    return [
      {
        name: 'name',
        type: 'string',
        grid: { xs: 8, sm: 8 }
      },
      {
        name: 'Filled SetType',
        type: 'select',
        options: ["dark", "light"],
        grid: { xs: 4, sm: 4 }
      }
    ]
  } 



  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
    if(activeStep == 2){ 
      upload();
    }
  };

  const handleMappings = () => {
    if(validateMappings())
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    else
      alert('Please map email to proceed');
  };


  const validateMappings = () => {     
    var hasEmail = false;
    mappingSelect && mappingSelect.some((field) => { 
     if(field.value == "email"){ 
       hasEmail = true; 
     } 
    });
    return hasEmail; 
  };


  const createImportContactRequest = (signedBlobId)=>{
    graphql(IMPORT_CONTACT, {
      appKey: app.key, 
      params: {
        avatar: signedBlobId,
        skip_header: skipHeader,
        column_separator: columnSeparator,
        mapping_fields: mappingSelect,
        mapping_model: contactType
      }
    }, {
      success: (data)=>{
        console.log(data); 
        setRequestMessage("Your file is submitted successfully. We are processing your CSV file. You will receive email once the file has completed processing.")
        //this.setState({editName: false})
        //this.getAgent()
      },
      error: (data)=>{ 
        setRequestMessage("Something went wrong. Please contact support.");
        console.log(data);
      }
    })
  }

  const upload = () => {  
    const file = selectedFile;
    console.log("uploading file",file);
    getFileMetadata(file).then((input) => {
      graphql(CREATE_DIRECT_UPLOAD, input, {
        success: (data)=>{
          const {signedBlobId, headers, url, serviceUrl} = data.createDirectUpload.directUpload
          const progressCallback = (event) => {
           if (event.lengthComputable) {
                var percentComplete = event.loaded / event.total; 
                console.log("Progress...", percentComplete)
                setCompleted(parseInt(percentComplete*100))
           } 
          }
          directUploadWithProgress(url, JSON.parse(headers), file, progressCallback).then(
            () => {
              let params = {}
              params['signed_blob_id'] = signedBlobId 
              createImportContactRequest(signedBlobId)
          });
        },
        error: (error)=>{
         console.log("error on signing blob", error)
        }
      })
    });
  }


  const handleOnFileLoad = (data) => {  
    processSelection(data);
  }
 

  const handleOnError = (err, file, inputElem, reason) => {
    console.log(err)
  }

  const handleOnRemoveFile = (data) => { 
    setSelectedFile(null);
  }
 
  const handleOnDrop = (data, fileInfo ) => { 
    if(data && data[0].meta){
      setColumnSeparator(data[0].meta.delimiter);
    }
    setSelectedFile(fileInfo);
    processSelection(data,fileInfo); 
  }

  const processSelection =  (data, fileInfo  ) => {
    setSelectedFile(fileInfo);
    console.log('fileInfo',fileInfo);
    console.log('data',data);
    setCsvRecords(data);
    const firstRow = data[0].data;
    let card = [];

    firstRow && _.times(firstRow.length, () => {
      card.push( { value: ""});
    });
    console.log(card);
    setMappingSelect(card);
  }


  const [contactType, setContactType] = React.useState('visitor');

  const handleContactType = (event) => {
    setContactType(event.target.value);
  };


  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <div style={{minHeight: "230px"}}>
            <CSVReader
              onDrop={handleOnDrop}
              onError={handleOnError}
              style={{minHeight: 230, width: 440}}
              config={{}}
              addRemoveButton
              onRemoveFile={handleOnRemoveFile}
            >
              <span>Drop CSV file here or click to upload.</span>
            </CSVReader>
          </div>
      case 1:
        const headRow = csvRecords[0].data;

        return (
          <Grid container style={{justifyContent: 'center'}}>
              <Grid item={true} style={{padding: '5px 40px'}}>
                  <div style={{border: 'solid 1px #faf6f1', borderRadius: 4}}>
                      <FormDialog
                          open={openNewForm}
                          titleContent={'Create Custom Key'}
                          classes={{
                              paper: classes.newSetTypeDialog
                          }}
                          headerClasses={{
                              root: classes.subFormHeader
                          }}
                          contentClasses={{root: classes.subFormContent}}
                          buttonClasses={{root: classes.subFormHeader}}
                          formComponent={
                              <form ref={form}>
                                  <Grid container spacing={3}>
                                      {
                                          definitions().map((field) => {
                                              return <Grid
                                                  item
                                                  key={field.name}
                                                  xs={field.grid.xs}
                                                  sm={field.grid.sm}>
                                                  <FieldRenderer
                                                      namespace={'key'}
                                                      data={camelizeKeys(field)}
                                                      props={{
                                                          data: open
                                                      }}
                                                      errors={ errors }
                                                  />
                                              </Grid>
                                          })
                                      }
                                  </Grid>

                              </form>
                          }
                          dialogButtons={
                              <React.Fragment>
                                  <Button
                                      variant={"outlined"}
                                      onClick={closeNewForm}
                                      classes={{
                                          root: classes.buttonText
                                      }}
                                      color="secondary">
                                      Cancel
                                  </Button>

                                  <Button onClick={ submitNewForm }
                                          classes={{
                                              disabled: classes.buttonDisabled,
                                              root: classes.formButton
                                          }}
                                          color="primary">
                                      + Create Custom key
                                  </Button>

                              </React.Fragment>
                          }
                      >
                      </FormDialog>


                      <div>
                          <Box fontStyle="normal" m={1} className={classes.formHeaderDisplay}>
                              <FormControlLabel
                                  control={ <FormLabel ></FormLabel>}
                                  label="Parsing Options"
                                  labelPlacement="start"
                                  InputProps={{
                                      classes: {
                                          input: classes.input
                                      }
                                  }}
                              />

                          </Box>
                          <Divider/>
                          <div style={{margin: '20px auto'}}>
                              <Box fontStyle="normal" m={1} className={diagClasses.dFlex}>
                                  <FormControlLabel
                                      control={<TextField id="outlined-basic"  variant="outlined" size="small" value={columnSeparator}
                                                          InputProps={{
                                                              classes: {
                                                                  input: classes.input
                                                              }
                                                          }}
                                                          className={classes.textField}
                                                          onChange={columnSeparatorChange}  style={{maxWidth: '75px', paddingLeft: '5px', paddingRight: 15 }}/>}
                                      label="Column separator"
                                      labelPlacement="start"
                                      classes={{
                                          label: classes.formLabel1
                                      }}
                                  />

                              </Box>
                              <Box fontStyle="normal" m={1} className={diagClasses.dFlex}>
                                  <FormControlLabel
                                      control={<IOSSwitch checked={skipHeader} onChange={skipHeaderChange} name="checkedB" />}
                                      label="Skip header"
                                      labelPlacement="start"
                                      classes={{
                                          label: classes.formLabel2
                                      }}
                                  />

                              </Box>
                              <Box style={{margin: 20}}>
                                  <Button
                                      variant={"outlined"}
                                      color={'primary'}
                                      onClick={addNewField}
                                  >
                                      + Create Custom Key
                                  </Button>
                              </Box>
                          </div>
                      </div>
                  </div>


               </Grid>
               <Grid item={true} style={{width: 'calc(100% - 320px)', minWidth: 500}}>
                  <div style={{overflow: 'auto', height: '300px', marginTop: 5, borderTop: 'solid 1px #faf6f1', borderLeft: 'solid 1px #faf6f1' }}>
                    <Table className={classes.table} aria-label="simple table" style={{tableLayout: 'fixed' }}>
                      <TableBody >
                        {headRow && headRow.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell component="th" scope="row" styl={{whiteSpace: 'nowrap', padding: 5}}>
                              Column {index}
                            </TableCell>
                            <TableCell align="right" style={{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', padding: 5}}>{row}</TableCell>
                            <TableCell align="right" style={{ padding: 5}}>Maps to..</TableCell>
                            <TableCell align="right" style={{ padding: 5}}>
                              <Select
                                id="demo-simple-select"
                                value={mappingSelect.length > 0 ? mappingSelect[index].value : ''}
                                onChange={event => {
                                  console.log("mappingSelect",mappingSelect);
                                  setMappingSelect(
                                      mappingSelect.map((item, idx) =>
                                        idx === index ? {...item, value: event.target.value} : item
                                      )
                                  );
                                }}
                              >
                                <MenuItem value="">
                                  <em>Skip this field</em>
                                </MenuItem>
                                
                                {userFields && userFields.map((fieldName, index) => (
                                  <MenuItem key={`row-${index}-uf`} value={fieldName}>{fieldName}</MenuItem> 
                                ))}
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
               </Grid>
          </Grid>
        )
      case 2:
        return (
            <FormControl component="fieldset" style={{minHeight: "250px", border: 'solid 1px rgba(0,0,0,0.26)', borderRadius: 4}}>
                <FormLabel component="h4">Import Type</FormLabel>
                <Divider style={{width: 'calc(100% + 260px)'}}/>
                <div style={{padding: 30}}>
                    <RadioGroup aria-label="gender" name="gender1" value={contactType} onChange={handleContactType}>
                        <FormControlLabel value="visitor" control={<Radio />} label="Import Leads" />
                        <FormControlLabel value="appuser" control={<Radio />} label="Import Users" />
                    </RadioGroup>
                </div>
            </FormControl>
        )

      default:
        return 'Unknown step';
    }
  };

  return (
    <div className={classes.root}>
      <div style={{width: '100%', padding: '50px 100px', backgroundColor: '#000000'}}>
        <Stepper activeStep={activeStep} classes={{root: classes.stepperRoot}}>
            {steps.map((label, index) => {
                const stepProps = {};
                const labelProps = {};
                if (isStepOptional(index)) {
                    labelProps.optional = <Typography variant="caption">Optional</Typography>;
                }
                if (isStepSkipped(index)) {
                    stepProps.completed = false;
                }
                return (
                    <Step key={label} {...stepProps}>
                        <StepLabel
                            {...labelProps}
                            classes ={{
                                label: classes.stepperLabel,
                                active: classes.stepperActiveLabel,
                                completed: classes.stepperActiveLabel
                            }}
                            StepIconProps={{
                                classes: {
                                    active: classes.active,
                                    text: classes.text,
                                    root: classes.iconRoot,
                                    completed: classes.completed
                                }
                            }}>{label}</StepLabel>
                    </Step>
                );
            })}
        </Stepper>
      </div>

      <div>
        {activeStep === steps.length ? (
           <Box align={'center'}  style={{minHeight: 250}}>

            <Typography className={classes.instructions}>
              {requestMessage}
            </Typography>
            <div className={classes.loaderContainer}> 
              <LinearProgress variant="determinate" value={completed} color="primary" />
            </div>
            <Typography className={classes.instructions}>
              {completed} %
            </Typography>

             
          </Box>
        ) : (
          <Box align={'center'} style={{padding: 70}}>
            <div>{getStepContent(activeStep)}</div>
            <div> 

              { 
                  (activeStep == 0) && <Button
                  disabled={selectedFile ? false : true}
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  classes={{
                    contained: classes.button,
                    disabled: classes.buttonDisabled
                  }}
                >Start CSV Import  </Button>
              }

              { 
                  ( activeStep == 1) && <Button
                  disabled={mappingSelect.length > 1 ? false : true}
                  variant="contained"
                  color="primary"
                  onClick={handleMappings}
                  className={classes.button}
                >Proceed to select import type >></Button>
              }

              { 
                  ( activeStep == 2) && <Button
                  disabled={mappingSelect.length > 1 ? false : true}
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  className={classes.button}
                >Proceed Import With This Configuration >></Button>
              }
            </div>
          </Box>
        )}
      </div>
    </div>
  );
}


 
