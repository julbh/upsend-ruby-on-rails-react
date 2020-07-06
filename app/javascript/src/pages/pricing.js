import React, {
  useState, 
  useEffect, 
  useRef
} from 'react'

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import StarIcon from '@material-ui/icons/StarBorder';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography'; 
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box'; 
import Slider from '@material-ui/core/Slider'; 
import ButtonBase from '@material-ui/core/ButtonBase';
import { withStyles } from '@material-ui/core/styles'; 
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';


import Progress from '../shared/Progress'
import {errorMessage, successMessage} from '../actions/status_messages'
import { setCurrentPage, setCurrentSection } from "../actions/navigation";

import graphql from '../graphql/client'
import {
  AVAILABLE_PLANS,
  BILLING_INFO
} from '../graphql/queries' 
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import serialize from 'form-serialize'

import SplitForm from "../components/StripeForm"


import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PlanPayment from "./payment"
//import dotenv from  'dotenv' 

function Pricing({app, dispatch}){  
 
 


   useEffect(()=>{
      dispatch(setCurrentSection("Settings"))
      dispatch(setCurrentPage("pricing")) 
      fetchPlans()
      fetchBilling()
    }, [])
   
  const [existingPlan, setExistingPlan] = React.useState({});
  const [selectedPlan, setSelectedPlan] = React.useState({}); 
  const [planCategories, setPlanCategories] = useState([])
  const [plans, setPlans] = useState([])
  const [value, setValue] = React.useState(1);
  const [loading, setLoading] = useState(false);
  const [viewBilling, setViewBilling] = useState(false);
  const [billingInfo, setBillingInfo] = useState({first_name:'', last_name:'', email:''});
  const useStyles = makeStyles(theme => ({
    '@global': {
      body: {
        backgroundColor: theme.palette.common.white,
      },
      ul: {
        margin: 0,
        padding: 0,
      },
      li: {
        listStyle: 'none',
      },
    },
    appBar: {
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    toolbar: {
      flexWrap: 'wrap',
    },
    toolbarTitle: {
      flexGrow: 1,
      color: 'black'
    },
    link: {
      margin: theme.spacing(1, 1.5),
    },
    heroContent: {
      padding: theme.spacing(2, 0, 3),
    },
    cardHeader: { 
      borderBottom: '1px solid lightgrey'
    },
    cardPricing: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'baseline',
      marginBottom: theme.spacing(2),
    },
    cardSelected:{
      border:'2px solid #FFB600',
      background: 'rgba(255,182,0,.1)'
    },
    footer: {
      borderTop: `1px solid ${theme.palette.divider}`,
      marginTop: theme.spacing(8),
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(3),
      [theme.breakpoints.up('sm')]: {
        paddingTop: theme.spacing(6),
        paddingBottom: theme.spacing(6),
      },
    }, 
    sliderContainer: {
      borderTop: `1px solid ${theme.palette.divider}`,
      marginTop: theme.spacing(8),
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(1),
      [theme.breakpoints.up('sm')]: {
        paddingTop: theme.spacing(6),
        paddingBottom: theme.spacing(1),
      },
    }, 
    paymentSummaryHeader: {
      backgroundColor: '#efeeeb',
    },
    root: {
      height: 120,
      width: '100%',
    },
    slider: {
      position: 'relative',
      width: '100%',
      minHeight: '10px'
    },
  }));  

  const freeDescriptions = ['All the basics for businesses that are just getting started.'];
  const standardDescriptions = ['Better insights for growing businesses that want more customers.'];
  const premiumDescriptions = ['Advanced features for pros who need more customization..'];


  const summary = {
      title: 'Payment Summary',
      price: '30',
      description: [
        'Plan ', 
        'Details' 
      ],
      buttonText: 'UPGRADE',
      buttonVariant: 'contained',
    }

  const footers = [
    {
      title: 'Everything in Standard, plus',
      description: ['Advanced segmentation', 'Advanced audience insights', 'Unlimited seats', 'Phone support'],
    },
    {
      title: 'Everything in Free, plus',
      description: ['Advanced audience insights', 'Maximum 4 seats'],
    }, 
    {
      title: 'Free Plan',
      description: [ 'Maximum 2 seats', 'Upto 2000 contacts'],
    },
  ]; 

  const PrettoSlider = withStyles({
    root: {
      color: '#FFB600',
      height: 8,
    },
    thumb: {
      height: 24,
      width: 24,
      backgroundColor: '#fff',
      border: '2px solid currentColor',
      marginTop: -8,
      marginLeft: -12,
      '&:focus, &:hover, &$active': {
        boxShadow: 'inherit',
      },
    },
    active: {},
    valueLabel: {
      left: 'calc(-50% + 4px)',
    },
    track: {
      height: 8,
      borderRadius: 4,
    },
    rail: {
      height: 8,
      borderRadius: 4,
    },
  })(Slider);
 

  const classes = useStyles();
// const state = {
//    values: defaultValues.slice(),
//    update: defaultValues.slice(),
//  }
  
  function kFormatter(num) {
      return Math.abs(num) > 999 ? Math.sign(num)*((Math.abs(num)/1000).toFixed(1)) + 'k' : Math.sign(num)*Math.abs(num)
  }

  function planChanged(plan){ 
    setSelectedPlan(plan);
  }

  

  function onUpdate(update){
    console.log("update", update);
    //this.setState({ update })
  }

  function onChange(values){
    console.log("onChange", values);
    //this.setState({ values })
  }

  function valuetext(value) {
    return `${value}°C`;
  }


  function fetchPlans(){
    setLoading(true) 
    setPlans([]); 
    
    graphql(AVAILABLE_PLANS, { appKey: app.key  }, {
      success: (data)=>{ 
        setLoading(false);  
        console.log("app", data.app ); 
        setDefaults(data.app.availablePlans, app.stripePlanId);
        setPlans(data.app.availablePlans );
      }, 
      error: (data)=>{
        setLoading(false); 
        console.log("error data", data);
        
      }
    })
  }

  function setDefaults(plans, currentStripePlanId){
    const plan = plans.find(x => x.stripePlanId === currentStripePlanId);
 
    setSelectedPlan(plan);
    setExistingPlan(plan);
  }



  function fetchBilling(){
    setLoading(true) 
    setBillingInfo([]);  
    graphql(BILLING_INFO, { appKey: app.key  }, {
      success: (data)=>{ 
        setLoading(false);  
        console.log("billing",data.app.billing ); 
        setBillingInfo(data.app.billing );
      }, 
      error: (data)=>{
        setLoading(false); 
        console.log("error data", data);
        
      }
    })
  }

  function currentPlanName(stripePlanId){
    if(stripePlanId == "free-plan"){
      return "Basic Plan"
    }
    else if(stripePlanId == "standard-monthly"){
      return "Pro Plan"
    }
    else if(stripePlanId == "premium-monthly"){
      return "Unlimited Plan"
    }
  }
 
  var defaultPlans = plans;
  var newTiers = [] 

  defaultPlans && defaultPlans.forEach(function(plan) {
    var desc = freeDescriptions;
    if(plan && plan.name.toLowerCase() == 'pro')
      desc = standardDescriptions;
    else if(plan && plan.name.toLowerCase() == 'unlimited')
      desc = premiumDescriptions;
    if(plan){
      var planObj = plan;
      planObj.description = desc;
      newTiers.push(planObj)
    }
  });
  newTiers = newTiers.reverse() 
 

  return (
    <React.Fragment>
      
      <CssBaseline />
       
      {/* Hero unit */}
      <Container spacing={1} maxWidth="lg" component="main" className={classes.heroContent} >
          {viewBilling && <Button variant="outlined" color="primary" onClick={(e) => setViewBilling(false)}  > Back </Button> }
         <Typography component="h6" variant="h6" align="center" color="textPrimary"   > 
           Current Plan: {currentPlanName(app.stripePlanId)} 
          </Typography>  
          <Typography component="h6" variant="h6" align="center" color="textSecondary"   >
           {viewBilling ? 'Payment Details' : 'Plan Selection' }   
           {loading && <Progress/>}
          </Typography>  
      </Container>
      {/* End hero unit */}


      <Container maxWidth="lg" component="main">
        {viewBilling && <Grid item xs={12} ><PlanPayment selectedPlan={selectedPlan} dispatch={dispatch} billingInfo={billingInfo}/></Grid>}
        {!viewBilling && <Grid container alignItems="flex-start"> 
            <Grid item xs={12} md={9} >
                 

                <Container maxWidth="lg" component="main">
                  <Grid container spacing={1} alignItems="flex-end">
                    {newTiers && newTiers.map(tier => (
                      // Enterprise card is full width at sm breakpoint
                      <Grid item key={tier.name} xs={12} md={4} >
                        <Card className={ ((selectedPlan && selectedPlan.name == tier.name) ? classes.cardSelected : '')}  style={{minHeight: '300px'}} >
                          <CardHeader
                            title={tier.name}
                            subheader={tier.subheader}
                            titleTypographyProps={{ align: 'center' }}
                            subheaderTypographyProps={{ align: 'center' }}
                            action={tier.name === 'Unlimited' ? <StarIcon /> : null}
                            className={classes.cardHeader}
                          />
                          <ButtonBase 
                                onClick={e => { planChanged(tier)}}
                                style={{width: '100%', height: '100%'}}
                            >
                            <CardContent>
                              <ul style={{minHeight: '100px'}}>
                                {tier.description.map(line => (
                                  <Typography component="li" variant="subtitle1" align="left" key={line}>
                                    {line}
                                  </Typography>
                                ))}
                              </ul>


                              <Typography  variant="h6" color="textPrimary">
                                  You Pay
                              </Typography>
                              <Box className={classes.cardPricing} mt={1}>
                                <Typography variant="h4" color="textPrimary">
                                  $
                                </Typography>
                                <Typography  variant="h4" color="textPrimary">
                                  {tier.amount}
                                </Typography> 
                              </Box>
                              <Typography variant="h6" color="textPrimary">
                                Month / Per App
                              </Typography>

                              <Typography variant="h6" color="textSecondary">
                                {tier.seats.toUpperCase()} seats
                              </Typography> 

                            </CardContent>
                          </ButtonBase> 
                        </Card>
                      </Grid>
                    ))} 
                  </Grid> 
                </Container> 
      

                
                {/* Footer */}
                <Container maxWidth="lg" component="footer" className={classes.footer}>
                  <Typography variant="h6" align="left" color="primary" component="p"> 
                    Compare plan features
                  </Typography>
                  <br/>
                  <Grid container spacing={2} justify="space-evenly" mt={5}>
                    {footers.map(footer => (
                      <Grid item xs={12} md={4} key={footer.title}>
                        
                        <ul>
                          <li key={'f-title'}>
                            <Link href="#" variant="title1" color="primary">
                             {footer.title}
                            </Link>
                          </li>
                          {footer.description.map(item => (
                            <li key={item}>
                              <Link href="#" variant="subtitle1" color="textSecondary">
                              <CheckCircleOutlineIcon />&nbsp;{item}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </Grid>
                    ))}
                  </Grid> 
                </Container>
                {/* End footer */}

            </Grid>  
            <Grid item xs={12} md={3} >
                 
              <Grid container  alignItems="flex-start"> 
                <Grid item key={summary.title} xs={12}  md={12}>
                  { selectedPlan && <Card >
                    <CardHeader
                      title={summary.title}
                      subheader={summary.subheader}
                      titleTypographyProps={{ align: 'center' }}
                      subheaderTypographyProps={{ align: 'center' }}
                      action={summary.title === 'Pro' ? <StarIcon /> : null}
                      className={classes.paymentSummaryHeader}
                    />
                    <ButtonBase  
                          style={{width: '100%', height: '100%'}}
                      >
                      <CardContent>
                        <div className={classes.cardPricing}>
                          <Typography component="h2" variant="h3" color="textPrimary">
                            ${selectedPlan.amount}
                          </Typography>
                          <Typography variant="h6" color="textSecondary">
                            /month
                          </Typography>
                        </div>
                        <ul>                       
                          <Typography component="li" variant="subtitle1" align="center">
                            {selectedPlan.name} Plan
                          </Typography> 
                          <Typography component="li" variant="subtitle1" align="center">
                            {selectedPlan.seats ? selectedPlan.seats.toUpperCase() : ''} seats
                          </Typography> 
                           
                          
                          

                        </ul>
                        

                      </CardContent>
                    </ButtonBase>
                    <CardActions>
                      <Button fullWidth variant={summary.buttonVariant} color="primary" onClick={(e) => setViewBilling(true)} disabled={(selectedPlan && existingPlan && selectedPlan.name == existingPlan.name)} >
                        {summary.buttonText}
                      </Button> 
                      

                    </CardActions>
                  </Card>
                  }
                </Grid>
              </Grid>   
            </Grid>
          </Grid> 
        }  
      </Container>
    

    </React.Fragment>
  );
}
 



function mapStateToProps(state) {
  const { app } = state 
  return {
    app,
  }
}


export default withRouter(connect(mapStateToProps)(Pricing))
