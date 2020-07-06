import React, {Component, useState, useEffect} from 'react'
import { withRouter, Switch } from 'react-router-dom'
import { connect } from 'react-redux'
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import styled from '@emotion/styled'
import TextEditor from '../../textEditor'

import graphql from '../../graphql/client'
import {BOT_TASK, BOT_TASKS, AGENTS, BOT_TASK_METRICS} from '../../graphql/queries'
import {UPDATE_BOT_TASK} from '../../graphql/mutations'
import ContentHeader from '../../components/ContentHeader'
import Content from '../../components/Content'
import FormDialog from '../../components/FormDialog'
import Segment from './segment'
import SettingsForm from './settings'
import BotTaskSetting from './taskSettings'
import ContextMenu from '../../components/ContextMenu'
import ListMenu from '../../components/ListMenu'
import {errorMessage, successMessage} from '../../actions/status_messages'

import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography' 
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import TextField from '@material-ui/core/TextField'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Divider from '@material-ui/core/Divider'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import MuiSwitch from '@material-ui/core/Switch'
import Fab from '@material-ui/core/Fab'

import AddIcon from '@material-ui/icons/Add'
import DragHandle from '@material-ui/icons/DragHandle'
import DeleteForever from '@material-ui/icons/DeleteForever'
import RemoveCircle from '@material-ui/icons/RemoveCircle'
import DeleteForeverRounded from '@material-ui/icons/DeleteForeverRounded'

import { makeStyles, createStyles } from '@material-ui/styles';
import {isEmpty} from 'lodash'
import Stats from '../../components/stats'
import { setCurrentSection, setCurrentPage } from '../../actions/navigation'

import Input from "../../components/forms/Input";

const useStyles = makeStyles((theme) => createStyles({
  root: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(1),
    background: theme.palette.common.white,
  },
  paper: {
    display: 'flex',
    flexDirection: 'column'
  },
  cardPaper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  textField:{
    boxShadow: 'none !important'
  },  
  stepContainer: {
    padding: '5px',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'flex-start'
  },
  pathStep:{
    'background':'#fff', 
    'width':'100%', 
    'text-align':'left', 
    'border':'0px',
    'border-radius': '5px',
    'padding': '5px',
    display: 'flex',
    'align-items': 'center'

  },
  pathSelectedStep:{
    'border':'2px solid #FFB601'
  }

}));

const ItemManagerContainer = styled.div`
  flex-grow: 4;
  margin-right: 19px;
`

const ItemButtons = styled.div` 
  display: 'flex'; 
  flex-direction: 'column';
  align-items: ${(props)=> props.first ? 'flex-start' : 'flex-end'};
`

const TextEditorConainer = styled.div`
  border: 1px solid #ccc;
  padding: 1em;
`

const ControlWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-flow: column;
`

const PathActionsContainer = styled.div`
  align-items: flex-end;
  border-radius: 0 0 8px 8px;
  box-sizing: border-box;
  box-shadow: 0 16px 32px -12px rgba(0,0,0,.1), 0 -24px 0 0 #fff, 16px 0 32px -12px rgba(0,0,0,.1), -16px 0 32px -12px rgba(0,0,0,.1);
  padding: 20px 20px 24px;
`

function create_UUID(){
  var dt = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (dt + Math.random()*16)%16 | 0;
      dt = Math.floor(dt/16);
      return (c=='x' ? r :(r&0x3|0x8)).toString(16);
  });
  return uuid;
}

const configFields =  [
  {name: "name", type: 'string', grid: {xs: 12, sm: 12 } } ,
  {name: "description", type: 'text', grid: {xs: 12, sm: 12 } },
]


const PathDialog = ({open, close, isOpen, submit})=>{

  let titleRef = React.createRef();
  //const titleRef = null

  const handleSubmit = ()=>{
    submit({
      id: create_UUID(),
      title: titleRef.value,
      steps: []
    })
  }

  return (
    isOpen && (
      <FormDialog 
        open={isOpen}
        //contentText={"lipsum"}
        titleContent={"Create Path"}
        formComponent={
            <form >
             
              <TextField
                label="None"
                id="title"
                inputRef={ref => titleRef = ref }
                placeholder={'write path title'}
                //defaultValue="Default Value"
                //className={classes.textField}
                helperText="Some important text"
                style={{boxShadow: 'none'}}
              />

            </form>

        }
        dialogButtons={
          <React.Fragment>
            <Button onClick={close} color="secondary">
              Cancel
            </Button>

            <Button onClick={handleSubmit} color="primary">
              Create
            </Button>
          </React.Fragment>
        }
        //actions={actions} 
        //onClose={this.close} 
        //heading={this.props.title}
        >
      </FormDialog>
    )
  )
}


const newPathData = () => {
  return {
      id: create_UUID(),
      title: "New Path",
      steps: []
    }
  }

const BotEditor = ({match, app, dispatch, mode, actions})=>{
  const [botTask, setBotTask] = useState({})
  const [errors, setErrors] = useState({})
  const [paths, setPaths] = useState([])
  const [selectedPath, setSelectedPath] = useState(null)
  const [isOpen, setOpen] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [changed, setChanged] = useState(null)

  const classes = useStyles();


  const handleSelection = (item)=>{
    console.log("item",item)
    setSelectedPath(item)
  }

  useEffect(() => {
    graphql(BOT_TASK, {appKey: app.key, id: match.params.id}, {
      success: (data)=>{
        let paths = data.app.botTask.paths;
        console.log(paths);
        if(paths.length == 0){
          paths = [newPathData()]
        }
        setBotTask(data.app.botTask)
        setPaths(paths)
        setSelectedPath(paths[0])
        
      },
      error: (err)=>{
        debugger
      }
    })

    dispatch(setCurrentSection("Bot"))
    dispatch(setCurrentPage(`bot${mode}`))


  }, []);

  const saveData = ()=>{

    graphql(UPDATE_BOT_TASK, {
      appKey: app.key, 
      id: match.params.id, 
      params: {
        paths: paths,
        segments: botTask.segments,
        title: botTask.title,
        scheduling: botTask.scheduling,
        state: botTask.state,
        urls: botTask.urls
      }
    }, {
      success: (data)=>{
        setPaths(data.updateBotTask.botTask.paths)
        setErrors(data.updateBotTask.botTask.errors)
        setSelectedPath(data.updateBotTask.botTask.paths[0])
        dispatch(successMessage("bot updated"))
      },
      error: (err)=>{
        dispatch(errorMessage("bot not updated"))
      }
    })

  }

  const addSectionMessage = (path)=>{

    const dummy = {
      step_uid: create_UUID(),
      type: "messages",
      messages: [{
        app_user: {
          display_name: "bot",
          email: "bot@chasqik.com",
          id: 1,
          kind: "agent" 
        },
        serialized_content: '{"blocks":[{"key":"9oe8n","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',
        html_content: "--***--", 
      }]
    }

    const newSteps = path.steps.concat(dummy)
    let newPath = null
    
    const newPaths = paths.map((o)=>{
      if(o.id === path.id){
        newPath = Object.assign({}, path, {steps: newSteps })
        return newPath
      } else {
        return o
      }
    })
    console.log(newPaths)
    setPaths(newPaths)
    setSelectedPath(newPath) // redundant
  }



  const addSectionControl = (path) => {
    const id = create_UUID();
    const dummy = {
      step_uid: id,
      type: "messages",
      messages: [],
      controls: {
        type: "ask_option",
        schema: [
          {
            id: create_UUID(),
            element: "button",
            label: "Reply button",
            next_step_uuid: null,
          },
          //{element: "button", label: "quiero contratar el producto", next_step_uuid: 3},
          //{element: "button", label: "estoy solo mirando", next_step_uuid: 4}
        ],
      },
    };

    const newSteps = path.steps.concat(dummy);
    let newPath = null;

    const newPaths = paths.map((o) => {
      if (o.id === path.id) {
        newPath = Object.assign({}, path, { steps: newSteps });
        return newPath;
      } else {
        return o;
      }
    });

    setPaths(newPaths);
    setSelectedPath(newPath); // redundant
  }; 


  const addDataControl = (path)=>{
    const id = create_UUID()
    const dummy = { 
      step_uid: id,
      messages: [],
      controls: {
        type: "data_retrieval",
        schema: [
          {
            id: create_UUID(),
            element: "input", 
            type:"text", 
            placeholder: "enter info", 
            name: "email", 
            label: "enter your info",
          },
        ]
      }
    }

    const newSteps = path.steps.concat(dummy)
    let newPath = null

    const newPaths = paths.map((o)=>{
      if(o.id === path.id){
        newPath = Object.assign({}, path, {steps: newSteps })
        return newPath
      } else {
        return o
      }
    })
 
    setPaths(newPaths)
    setSelectedPath(newPath) // redundant
  }

  const addPath = (path)=>{
    const newPaths = paths.concat(path)
    setPaths(newPaths)
  }

  const addEmptyPath = (data)=>{
    addPath(data)
    close()
  }

  const updatePath = (path)=>{
    const newPaths = paths.map((o)=> o.id === path.id ? path : o )
    setPaths(newPaths)
    setSelectedPath(newPaths.find((o)=> o.id === path.id )) // redundant
  }

  const open  = () => setOpen(true);
  const close = () => setOpen(false);

  const showPathDialog = ()=>{
    setOpen(true)
  }

  const handleTabChange = (e, i)=>{
    setTabValue(i)
  }

  const tabsContent = ()=>{
    return <Tabs value={tabValue} 
              onChange={handleTabChange}
              textColor="inherit">
              <Tab textColor="inherit" label="Create your bot" />
              <Tab textColor="inherit" label="Choose your audience" />
              <Tab textColor="inherit" label="Schedule your bot" />
              <Tab textColor="inherit" label="Stats" />
            </Tabs>
  }

  const getStats = (params, cb)=>{
    graphql(BOT_TASK_METRICS, params, {
      
      success: (data)=>{
        const d = data.app.botTask
        cb(d)
      },
      error: (error)=>{

      }
    })
  }

  const renderTabcontent = ()=>{
    switch (tabValue){
      case 0:
        return renderEditor()
      case 1:
        return <Segment 
          app={app} 
          data={botTask}
          updateData={(task)=>{ 
            setBotTask(task);
          }}
          handleSave={(segments)=>{
            setBotTask(Object.assign({}, botTask, {segments: segments}))
            saveData()
          }}
          />
      case 2:
        return <BotTaskSetting 
                app={app} 
                data={botTask}
                updateData={setBotTask}
                saveData={saveData}
                errors={errors}
              />
      case 3:
        return !isEmpty(botTask) && <Stats  match={match}
                                            app={app} 
                                            data={botTask}
                                            getStats={getStats}
                                            actions={actions}
                                            mode={'counter_blocks'}
                                            />
    }
  }


 const addNewPath = ()=>{
    const newpath = {
      id: create_UUID(),
      title: "New Path",
      steps: []
    }
    addEmptyPath(newpath)
    setSelectedPath(newpath); 
  }
 

  const renderEditor = ()=>{ 
    return <Grid container 
            alignContent={'space-around'} 
            justify={'space-around'}>
      
    {
      isOpen && <PathDialog 
        isOpen={isOpen} 
        open={open} 
        close={close}
        submit={addEmptyPath}
      />
    }
    <Grid item xs={12}  style={{border: "1px solid lightgray", display: "flex", justifyContent: "space-between"}}>   
        <Box m={2}>
        <Typography >
          Create your bot
        </Typography>
        </Box>
        <Box m={2} align={"right"}>
          <Button                     
            variant="contained" 
            color="primary" 
            size="large" 
            onClick={saveData}> 
            Save 
          </Button> 
        </Box> 

    </Grid>

    <Grid item xs={12} sm={3} style={{border: "1px solid lightgray", padding: "10px", background: "#FAF7F2"}} align="center">
{/*      <List component="nav" aria-label="path list">
        {
          paths.map((o, i)=>( <PathList
            key={`path-list-${o.id}-${i}`}
            path={o}
            index={i}
            handleSelection={handleSelection} 
            selectedPath={selectedPath}
            /> ))
        }
      </List>*/}

      <SortablePaths paths={paths} handleSelection={handleSelection} selectedPath={selectedPath} classes={classes} update={setPaths} 
       setPaths={setPaths} setSelectedPath={setSelectedPath} />

      <br/>
      <Button  
        variant={"contained"} 
        onClick={addNewPath}
        color="primary">
        <AddIcon />
        Add new path
      </Button>
    </Grid>

    <Grid item xs={12} sm={9}>

      <Paper className={classes.paper}>

        {
          selectedPath && <Path
            app={app}
            path={selectedPath}
            paths={paths}
            addSectionMessage={addSectionMessage}
            addSectionControl={addSectionControl}
            addDataControl={addDataControl}
            updatePath={updatePath}
            saveData={saveData}
            setPaths={setPaths}
            setSelectedPath={setSelectedPath}
            />
        } 
      </Paper>

    </Grid>

  
  </Grid>
  }

  const toggleState = ()=>{

  }

  return (
    <div>
      <ContentHeader 
        title={ botTask.title }
        items={ []
          /*[
          <MuiSwitch
            color={"default"}
            checked={botTask.state === "enabled"}
            onChange={toggleState}
            value={botTask.state}
            inputProps={{ 'aria-label': 'enable state checkbox' }}
          />,
          <Grid item>
            <Button                     
              variant="outlined" 
              color="inherit" 
              size="small" 
              onClick={saveData}> 
              save data 
            </Button>
          </Grid> , 
          <Grid item>
            <Button 
              variant="outlined" 
              color="inherit" 
              size="small">
              set live
            </Button>
          </Grid>
        ]*/
        }
        tabsContent={tabsContent()}
      />

      <Content>
        {renderTabcontent()}
      </Content>
    
    </div>
  )
}

function FollowActionsSelect({app, path, updatePath}){
  const options = [
    {key: "close", name: "Close conversation", value: null },
    {key: "assign", name: "Assign Agent", value: null },
    //{action_name: "tag", value: null },
    //{action_name: "app_content", value: null },
  ]

  //console.log("PATH FOLLOW ACTIONS", path.followActions, path)

  const [selectMode, setSelectMode] = useState(null)
  const [actions, setActions] = useState(path.followActions || [])

  useEffect(()=>{
    updateData()
  }, [actions])

  useEffect(()=>{
    setActions(path.followActions || [])
  }, [path.id])

  function updateData(){
    if(!path) return 
    const newPath = Object.assign({}, path, {
      follow_actions: actions, 
      followActions: actions 
    })
    updatePath(newPath)
  }

  function renderAddButton(){
    return <Button 
            variant="outlined"
            onClick={()=>{setSelectMode(true)}}>
            add option
           </Button>
  }

  function handleClick(a){
    setActions(actions.concat(a))
  }

  function renderActions(){
    return actions.map((o, i)=> renderActionType(o, i))
  }

  function availableOptions(){
    if(actions.length === 0) return options
    return options.filter((o)=> !actions.find((a)=> a.key === o.key ))
  }

  function updateAction(action, index){
    const newActions = actions.map((o,i)=> i === index ? action : o )
    setActions(newActions)
  }

  function removeAction(index){
    const newActions = actions.filter((o,i)=> i != index )
    setActions(newActions)
  }

  function renderActionType(action, i){
    switch (action.key) {
      case "assign":
        return <AgentSelector app={app} 
                              index={i}
                              action={action}
                              updateAction={updateAction}
                              removeAction={removeAction}
                              key={action.key}>
                  {action.name}
                </AgentSelector>
    
      default: 
        return <Grid style={{display: 'flex'}} 
                     key={action.key} 
                     item 
                     alignItems={"center"}>
                <Typography >
                  {action.name}
                </Typography>
                <IconButton 
                  color={"secondary"}
                  onClick={()=> removeAction(i)}>
                  <DeleteForeverRounded/>
                </IconButton> 
               </Grid>
    }
  }


  const menuOptions = availableOptions()

  return(
   
    <div>
      {renderActions()}

      {
        menuOptions.length > 0 &&
          <ContextMenu
            label={"Add Follow Action"} 
            handleClick={handleClick} 
            actions={actions}
            options={menuOptions}
          /> 
      }

      {/*
        selectMode  ?
        
        :  
        renderAddButton()
      */}

      
    </div>
  )
}

function AgentSelector({ app, updateAction, removeAction, action, index }) {
  const [selected, setSelected] = React.useState(action.value);
  const [agents, setAgents] = React.useState([]);
  const [mode, setMode] = React.useState("button");

  function getAgents() {
    graphql(
      AGENTS,
      { appKey: app.key },
      {
        success: (data) => {
          setAgents(data.app.agents);
        },
        error: (error) => {},
      }
    );
  }

  useEffect(() => {
    getAgents();
  }, []);

  useEffect(() => {
    const agent = agents.find((o) => selected === o.id);
    updateAction(
      Object.assign({}, action, { value: agent && agent.id }),
      index
    );
  }, [selected]);

  function handleChange(e) {
    setSelected(e.value);
    setMode("button");
  }

  function selectedAgent() {
    const agent = agents.find((o) => selected === o.id);
    if (!agent) return "";
    return {label: agent.name || agent.email, value: selected};
  }

  return ( 
    <Grid style={{display: 'flex'}} 
         key={action.key} 
         item  
         alignItems={"center"}>
      <Grid item xs={10}>
        <Input
          type="select"
          value={ selectedAgent() }
          onChange={handleChange}
          defaultValue={selectedAgent()}
          name={'agent'}
          id={'agent'}
          label={"Assignee Agent"}
          data={{}}
          options={
            agents.map((o) => ({ label: o.email, value: o.id }))
          }>
        </Input>
      </Grid>
      <Grid item xs={2}>
        <Button 
          variant={"icon"} 
          onClick={() => removeAction(index)}>
          <DeleteForeverRounded />
        </Button>
      </Grid>

    </Grid> 
  );
}


const getAlphabet = (index) => {
  //alphabets 65 to 90
  const num = 65+index; 
  return (num >= 65 && num <= 90) ? String.fromCharCode(num) : num;
}

const PathList = ({selectedPath, path, handleSelection, index})=>{
  console.log("selectedPath",selectedPath);
  console.log("path",path);


  const classes = useStyles();

  return <ListItem button 
                   onClick={(e)=> handleSelection(path)} 
                   variant={"outlined"}>
          <span>{getAlphabet(index)}.&nbsp;</span>
          <Button variant="outlined"
              color="primary" classes={ (selectedPath && selectedPath.id == path.id) ? `${classes.pathStep} ${classes.pathSelectedStep}` : classes.pathStep }>

            {path.title}
          </Button> 
        </ListItem>
}

const Path = ({
    paths, 
    path, 
    addSectionMessage, 
    addSectionControl, 
    addDataControl, 
    updatePath,
    setPaths,
    saveData,
    setSelectedPath,
    app })=>{


  const [showActions, setShowActions] = React.useState(false)

  const addStepMessage = (path)=>{
    addSectionMessage(path)
  } 

  const deleteItem = (path, step)=>{
    const newSteps = path.steps.filter((o, i)=> o.step_uid != step.step_uid  )
    const newPath = Object.assign({}, path, {steps: newSteps})
    updatePath(newPath)
  }

  const deletePath = (path)=>{
    const newPaths = paths.filter((o)=> o.id != path.id)
    console.log(newPaths)
    setPaths(newPaths)
    setSelectedPath(null)
  }

  const onDragEnd = (path, result)=> {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    let newSteps = reorder(
      path.steps.filter((o)=> !o.controls || o.controls.type !== "ask_option" ),
      result.source.index,
      result.destination.index
    );

    const controlStep = path.steps.find((o)=> o.controls && o.controls.type === "ask_option" ) 

    if(controlStep) 
      newSteps = newSteps.concat(controlStep)

    const newPath = { ...path, steps: newSteps }
    updatePath(newPath)

  }

  const updateControlPathSelector = (controls, step) => {
    updateControls(controls, step);
  };

  const appendItemControl = (step) => {
    const item = {
      id: create_UUID(),
      label: "example",
      element: "button",
      next_step_uuid: null,
    };
    const newControls = Object.assign({}, step.controls, {
      schema: step.controls.schema.concat(item, step),
      wait_for_input: true,
    });
    updateControls(newControls, step);
  };

  const updateControls = (newControls, step) => {
    const newStep = Object.assign({}, step, { controls: newControls });

    const newSteps = path.steps.map((o) => {
      return o.step_uid === newStep.step_uid ? newStep : o;
    });

    const newPath = Object.assign({}, path, { steps: newSteps });
    updatePath(newPath);
  };

  const handleTitleChange = (e)=>{
    const value = e.target.value
    const newPath = Object.assign({}, path, {title: value})
    updatePath(newPath)
  }

  const options = [
      {name: "Add Message Bubble", key: "add-message", onClick: ()=>{ addStepMessage(path) }},
      // {name: "Add path chooser", key: "add-path-choooser", onClick: ()=>{ addSectionControl(path) }},
      {name: "Ask data input",key: "ask-data-input", onClick: ()=>{ addDataControl(path) }}
  ]

  const findControlItemStep = ()=>(
    path.steps.find((o)=> o.controls && o.controls.type === "ask_option" )
  )


  const controlStep = findControlItemStep()

  const stepOptions = paths.map((o) => ({
    value: o.steps[0] && o.steps[0].step_uid,
    label: o.title,
  }));

  const classes = useStyles();


  return (
    <Box p={4}> 
        <Grid container spacing={3}>

          <Grid item xs={12}> 
            <TextField 
              value={path.title}
              onChange={handleTitleChange}
              fullWidth={false}
              helperText={" "} 
              style={{boxShadow: 'none !important'}}
            /> 
          </Grid> 

          <Grid item xs={7} style={{border: '1px solid lightgray', borderRadius: "5px"}}>

          <Grid container>
            <Grid item xs={12}> 
              <SortableSteps 
                steps={path.steps}
                path={path}
                paths={paths}
                addSectionMessage={addSectionMessage}
                addSectionControl={addSectionControl}
                updatePath={updatePath}
                deleteItem={deleteItem}
                onDragEnd={onDragEnd}
                updateControlPathSelector={updateControlPathSelector}
              />
            </Grid>
            <Grid item xs={12} align={"right"}> 
              <ListMenu 
                options={options}
                button={
                  <Button variant="outlined" color="primary" size={"small"}
                    aria-label="add">
                    <AddIcon /> Add
                  </Button> 

                }
              />
            </Grid>
            <Grid item xs={12}>
              <hr style={{marginTop: "2em", marginBottom: "2em"}} />
            </Grid>
            <Grid item xs={12}>


              <Grid container spacing={3}> 
                <Grid item xs={6} align={"right"}>
                  {
                    !controlStep && !showActions && (!path.followActions || path.followActions.length === 0) &&
                      <div className="flex items-center mr-4">
                        Continue bot with&nbsp;
                        <Button variant="outlined" 
                          className="ml-2"
                          onClick={()=> addSectionControl(path)}>
                          reply button
                        </Button>
                      </div>
                  } 
                </Grid>
                <Grid item xs={6} align={"left"}> 
                  {
                    !controlStep && !showActions && (!path.followActions || path.followActions.length < 1) &&
                      <div className="flex items-center">
                        End bot with&nbsp;
                        <Button variant="outlined" 
                          className="ml-2"
                          onClick={()=> setShowActions(true)}>
                          follow actions
                        </Button>
                      </div>
                  }                 
                </Grid>
              </Grid>


              {controlStep && 
                <PathActionsContainer className="w-3/4 mt-8">

                  <Grid container spacing={3}> 
                    <Grid item xs={6}>
                      <p>
                        <strong>Continue bot with reply button</strong>
                      </p>
                    </Grid>
                    <Grid item xs={6} align={"right"}> 
                        <ItemButtons className="self-end">
                        <Button
                          variant={"icon"}
                          onClick={() => deleteItem(path, controlStep)}
                        >
                          <DeleteForever />
                        </Button>
                      </ItemButtons> 
                    </Grid>
                  </Grid>


                  <div className="flex flex-col">
                    <div className="w-full">
                      <ControlWrapper>
                        {controlStep.controls && (
                          <AppPackageBlocks
                            controls={controlStep.controls}
                            path={path}
                            step={controlStep}
                            options={stepOptions}
                            update={(opts) =>
                              updateControlPathSelector(opts, controlStep)
                            }
                          />
                        )}
                      </ControlWrapper>

                    </div>

                    {controlStep.controls &&
                      controlStep.controls.type === "ask_option" && (
                        <div
                          style={{textAlign: "right", marginTop: "10px"}}
                          onClick={() => appendItemControl(controlStep)}
                        >
                          <Button
                            color={"primary"}
                            variant={"outlined"}
                            size="small"
                            align={"right"}
                          >
                            + Add
                          </Button>
                        </div>
                      )}
                  </div>

                </PathActionsContainer> 
              }

              {
                (showActions || (!controlStep && path.followActions && path.followActions.length > 0)) &&
                <div className="flex align-start flex-col w-3/4">  
                  <Grid container spacing={3}> 
                    <Grid item xs={10}>
                      <p>
                        <strong>End bot with follow actions</strong>
                      </p>
                    </Grid>
                    <Grid item xs={2} align={"right"}> 
                      <Button
                        variant="icon"
                        color="secondary"
                        onClick={() => {
                          updatePath({...path, followActions: [] })
                          setShowActions(false)
                        }}
                      >
                        <DeleteForever />
                      </Button>
                    </Grid>
                  </Grid> 
                  <FollowActionsSelect app={app} updatePath={updatePath} path={path} />
             
                </div>
              }


            </Grid>

          </Grid>


          </Grid>

        </Grid> 
    </Box>

  )
}

const PathEditor = ({step, message, path, updatePath })=>{

  const classes = useStyles();
  const [readOnly, setReadOnly] = useState(false)

  const saveHandler = (html, serialized)=>{
    console.log("savr handler", serialized)
  }

  const saveContent = ({html, serialized})=>{
    const newMessage = Object.assign({}, message, {
      serialized_content: serialized
    })

    const newSteps = path.steps.map((o)=>{ 
      return o.step_uid === step.step_uid ? 
      Object.assign({}, o, {messages: [newMessage]}) : o
    })

    const newPath = Object.assign({}, path, {steps: newSteps})
    updatePath(newPath)
  }

  const uploadHandler = ({serviceUrl, imageBlock})=>{
    imageBlock.uploadCompleted(serviceUrl)
  }

  return (
    <Paper
      elevation={1} 
      square={true} 
      classes={{root: classes.root}}
      style={{border: "1px solid #c4c4c4", backgroundColor: "#fff", padding: "10px"}}>
      <TextEditor 
          botConfigLayout={true}
          uploadHandler={uploadHandler}
          serializedContent={message.serialized_content}
          read_only={readOnly}
          toggleEditable={()=>{
            setReadOnly(!readOnly)
          }}
          data={
            {
              serialized_content: message.serialized_content
            }
          }
          styles={
            {
              lineHeight: '1.2em',
              fontSize: '1em'
            }
          }
          saveHandler={saveHandler} 
          updateState={({status, statusButton, content})=> {
            console.log("get content", content)
            saveContent(content )
          }

        }
      />
    </Paper>
  )
}

// APp Package Preview
const AppPackageBlocks = ({options, controls, path, step, update})=>{
  const {schema, type} = controls


  const updateOption = (value, option)=>{
    const newOption = Object.assign({}, option, {next_step_uuid: value})
    const newOptions = controls.schema.map((o)=> o.id === newOption.id ? newOption : o)
    const newControls = Object.assign({}, controls, {schema: newOptions})
    update(newControls)
  }

  const removeOption = (index)=>{
    const newOptions = controls.schema.filter( (o, i )=> i != index )
    const newControls = Object.assign({}, controls, {schema: newOptions})
    update(newControls)
  }

  const handleInputChange = (value, option, index)=>{
    const newOption = Object.assign({}, option, {label: value})
    const newOptions = controls.schema.map((o, i)=> i === index ? newOption : o)
    const newControls = Object.assign({}, controls, {schema: newOptions})
    update(newControls)
  }

  const renderElement = (item, index)=>{
    const element = item.element

    switch(item.element){
    case "separator":
      return <hr key={index}/>
    case "input":
      return <div className={"form-group"} key={index}>
              {/*item.label ? <label>{item.label}</label> : null */}
              {/*<TextField 
                type={item.type} 
                name={item.name}
                placeholder={item.placeholder}
              />*/}
              <DataInputSelect 
                controls={controls}
                path={path}
                step={step}
                update={update}
                item={item}
                options={[
                  {value: "email", label: "email"},
                  {value: "name", label: "name"},
                  {value: "phone", label: "phone"},
                ]}/>

             </div>

    case "submit":
      return <button key={index} 
                     style={{alignSelf: 'flex-end'}} 
                     type={"submit"}>
                {item.label}
              </button>
    case "button":
      return <Grid container 
                spacing={2} 
                alignItems={"center"}>

                <Grid item xs={1}>
                  <IconButton onClick={()=> removeOption(index)}>
                    <RemoveCircle/>
                  </IconButton>
                </Grid>

                <Grid item xs={10} align={"right"}>
                
                  <TextField value={item.label} 
                    fullWidth={false}
                    onChange={(e)=> handleInputChange(e.target.value, item, index)} 
                    variant="outlined"
                  />

                </Grid> 
                <Grid item xs={1} style={{display: "flex", flexDirection: "row", alignItems: "center", padding: "0px"}}>
                  <hr style={{minWidth: "100px"}} />
                  <Box style={{position: "relative"}}>
                    <div style={{minWidth: "250px"}}>                 
                      {
                        controls && controls.type === "ask_option" ?
                        
                        <PathSelect 
                          option={item} 
                          options={options} 
                          update={updateOption}
                        /> : null 
                      }
                    </div>
                  </Box>
                </Grid>

                


            </Grid>
    default:
      return null
    }
  }

  const renderElements = ()=>{
    return schema.map((o, i)=>
      renderElement(o, i)
    )
  }

  return (renderElements())
}

// SORTABLE

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: "5px",
  margin: `0 0 ${grid}px 0`,
  display: 'flex',
  justifyContent: 'flex-start',
  // change background colour if dragging
  background: isDragging ? "lightgreen" : "transparent",
  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? "lightblue" : "transparent",
  padding: grid,
  //width: 250
});


const reorderPaths = (list, startIndex, endIndex) => {
  console.log("list",list);
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

class SortablePaths extends Component {
  constructor(props) {
    super(props); 
    this.onDragEnd = this.onDragEnd.bind(this);
  }


  deletePath(path) {
    const newPaths = this.props.paths.filter((o)=> o.id != path.id)
     
    this.props.setPaths(newPaths)
    this.props.setSelectedPath(null)
  }


  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorderPaths(
      this.props.paths,
      result.source.index,
      result.destination.index
    );
    console.log("new list", items);
    this.props.update(items);
    // this.setState({
    //   items
    // });
  }

  // Normally you would want to split things out into separate components.
  // But in this example everything is just done in one place for simplicity
  render() {
    const { paths, handleSelection, selectedPath  } = this.props;

                const { classes } = this.props;
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
            > 

              {paths.map((path, index) => (
                <Draggable key={path.id} draggableId={path.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}
                    >
                    <Grid container className={classes.stepContainer}>
                      <Grid item xs={1}>
                        <div>{getAlphabet(index)}.&nbsp;</div>
                      </Grid>
                      <Grid item xs={10} onClick={(e)=> handleSelection(path)} className={ (selectedPath && selectedPath.id == path.id) ? `${classes.pathStep} ${classes.pathSelectedStep}` : classes.pathStep }>
                        <DragHandle/>
                        <span>{path.title} </span>
                      </Grid>
                      <Grid item xs={1}>
                        <Button  
                          onClick={()=> this.deletePath(path)} >
                          <DeleteForeverRounded style={{fontSize: "18px"}}/>
                        </Button>
                      </Grid>
                    </Grid>

                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}






class SortableSteps extends Component {
  constructor(props) {
    super(props);
  }

  onDragEnd =(result)=> {
    this.props.onDragEnd(this.props.path, result)
  }

  updateControlPathSelector = (controls, step)=>{
    this.updateControls(controls, step)
  }

  // appendItemControl = (step)=>{
  //   const item = {
  //     id: create_UUID(), 
  //     label: "example", 
  //     element: "button", 
  //     next_step_uuid: null
  //   }
  //   const newControls = Object.assign({}, 
  //     step.controls, 
  //     { 
  //       schema: step.controls.schema.concat( item , step),
  //       wait_for_input: true
  //     }
  //   )

  //   this.updateControls(newControls, step)
  // }

  updateControls = (newControls, step)=>{
    const {path, updatePath} = this.props

    const newStep = Object.assign({}, step, {controls: newControls})

    const newSteps = path.steps.map((o)=>{ 
      return o.step_uid === newStep.step_uid ? newStep : o
    })

    const newPath = Object.assign({}, path, {steps: newSteps})

    updatePath(newPath)
  }

  render() {
    const {steps, path, paths, deleteItem, updatePath} = this.props
    const options = paths.map((o)=> ({
        value: o.steps[0] && o.steps[0].step_uid, 
        label: o.title
      })
    )

    const stepsWithoutcontrols = steps.filter((o)=> !o.controls || o.controls.type !== "ask_option" )
    
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              {stepsWithoutcontrols.map((item, index) => (
                <Draggable key={item.step_uid} 
                  draggableId={item.step_uid} 
                  index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}>

                      
                      <ItemManagerContainer >
                      
                        {
                          item.messages.map(
                            (message)=>
                              <PathEditor 
                                path={path}
                                step={item} 
                                message={message}
                                updatePath={updatePath}
                              />
                          )
                        }
                        
                        <Grid container>

                          <Grid item xs={12} >
                            <ControlWrapper>
                              { item.controls && 
                                <AppPackageBlocks 
                                  controls={item.controls} 
                                  path={path}
                                  step={item}
                                  options={options}
                                  update={(opts)=> this.updateControlPathSelector(opts, item)}
                                /> 
                              }
                            </ControlWrapper>
                          </Grid>

                          {
                            item.controls && item.controls.type === "ask_option" &&
                          
                              <Grid 
                                item xs={12} 
                                onClick={()=> this.appendItemControl(item)}>
                                <Button 
                                  color={"primary"}
                                  variant={'outlined'} 
                                  size="small">
                                  + add data option
                                </Button>
                              </Grid> 
                          }

                        </Grid>

                      </ItemManagerContainer>


                      


                      <ItemButtons first={true} {...provided.dragHandleProps}>
                        <DragHandle/> 
                        <div onClick={()=> deleteItem(path, item) }>
                          <DeleteForever/>
                        </div>
                      </ItemButtons>

                    </div>


                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}


const PathSelect = ({ option, options, update }) => {
  const handleChange = (e) => {
    update(e.value, option);
  };
  const selectedOption = options.find((o) => option.next_step_uuid === o.value);

  console.log(JSON.stringify(selectedOption));
  return ( 
    <Input
      type="select"
      data={{}}
      value={selectedOption}
      defaultValue={selectedOption}
      onChange={handleChange}
      fullWidth={true}
      options={options}
    >
    </Input> 
  );
};


// const PathSelect = ({ option, options, update})=>{
//   const handleChange = (e)=>{
//     update(e.target.value, option)
//   }
//   const selectedOption = options.find((o)=> option.next_step_uuid === o.value )

//   return (
//     <Select
//       value={ selectedOption ? selectedOption.value : '' }
//       onChange={handleChange}
//       fullWidth={true}
//       inputProps={{
//         name: 'age',
//         id: 'age-simple',
//       }}
//     >
//       {
//         options.map((option)=> <MenuItem 
//                                 key={`path-select-${option.value}`}
//                                 value={option.value}>
//                                 {option.label}
//                               </MenuItem> 
//                     )
//       }
//     </Select>
//   )

// }


const DataInputSelect = ({ item, options, update, controls, path, step }) => {
  const handleChange = (e) => {
    const newOption = Object.assign({}, item, { name: e.value });
    //const newOptions = //controls.schema.map((o)=> o.name === newOption.name ? newOption : o)
    const newControls = Object.assign({}, controls, { schema: [newOption] });

    update(newControls);
  };

  const selectedItem = options.find((o) => o.value === item.name);

  return (
    <div>
      <Input
        type="select"
        value={selectedItem}
        defaultValue={selectedItem}
        onChange={handleChange}
        fullWidth={true}
        label={item.label}
        //helperText={"oeoeoe"}
        options={options}
      >
      </Input>
    </div>
  );
};


// const DataInputSelect = ({item, options, update, controls, path, step})=>{
  
//   const handleChange = (e)=>{
//     const newOption = Object.assign({}, item, {name: e.target.value})
//     //const newOptions = //controls.schema.map((o)=> o.name === newOption.name ? newOption : o)
//     const newControls = Object.assign({}, controls, {schema: [newOption]})
    
//     update(newControls)
//   }

//   return (
//     <Select
//       value={ item.name }
//       onChange={handleChange}
//       fullWidth={true}
//       label={item.label}
//       helperText={"oeoeoe"}
//     >
//       {
//         options.map((option)=> <MenuItem 
//                                 value={option.value}>
//                                 {option.label}
//                               </MenuItem> 
//                     )
//       }
//     </Select>
//   )
// }

function mapStateToProps(state) {

  const { auth, app, segment, app_user, current_user, drawer } = state
  const { loading, isAuthenticated } = auth
  return {
    current_user,
    app_user,
    segment,
    app,
    loading,
    isAuthenticated,
    drawer
  }
}

export default withRouter(connect(mapStateToProps)(BotEditor))