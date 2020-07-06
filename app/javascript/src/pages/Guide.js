import React, { Component } from "react";
import PropTypes from "prop-types";

import Button from "@material-ui/core/Button";

import graphql from "../graphql/client";
import { CREATE_DIRECT_UPLOAD } from "../graphql/mutations";

import { ColorPicker } from "../shared/FormFields";

import ContentHeader from "../components/ContentHeader";

import {
  getFileMetadata,
  directUploadWithProgress,
} from "../shared/fileUploader";
import { setCurrentPage, setCurrentSection } from "../actions/navigation";
import Guide from "../components/guide";
import ForumSharpIcon from "@material-ui/icons/ForumSharp";

import Badge from "@material-ui/core/Badge";
import Avatar from "@material-ui/core/Avatar";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";

const StyledBadge = withStyles((theme) => ({
  badge: {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    top: 16,
    right: 32,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "$ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}))(Badge);

const styles = (theme) => ({
  root: {
    [theme.breakpoints.up("sm")]: {
      margin: theme.spacing(3),
    },
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2),
    },
    margin: "50px!important",
    marginTop: "35px!important",
  },
  formControl: {
    margin: theme.spacing.unit,
    width: "100%",
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: theme.spacing.unit / 4,
  },
  noLabel: {
    marginTop: theme.spacing(3),
  },
  appSettingTitleContainer: {
    marginTop: 52,
    marginLeft: 44,
    backgroundColor: "transparent",
    color: "#000000",
    width: "calc(100% - 140px)",
  },
  appSettingTitle: {
    fontSize: 42,
    fontWeight: "bold",
  },
  appSettingMenu: {
    marginBottom: 10,
  },
  tabIndicator: {
    display: "none",
  },
  tabButton: {
    padding: "0 20px",
    "&:hover": {
      backgroundColor: "#FAF6F1",
    },
  },
  tabSelectedButton: {
    backgroundColor: "#FAF6F1",
  },
  imageButton: {
    backgroundColor: "#000000",
    color: "#ffffff",
    width: 150,
    height: 50,
  },
  submitButton: {
    backgroundColor: "#FFD300",
    marginTop: 25,
    color: "#000000",
    width: 250,
    height: 50,
  },
  mainContentHeader: {
    display: "none",
  },
});

class GuideContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: 3,
      tabs: [
        { name: "See what you'll be able to do", key: 1 },
        { name: "Customize your Messenger", key: 2 },
        { name: "Add chat to  your website", key: 3 },
        { name: "Set up live chat for logged-in users", key: 4 },
        { name: "Set expectations with office hours and reply time", key: 5 },
        { name: "Invite your teammates to join you in Intercom", key: 6 },
        { name: "Route emails to your Intercom Inbox", key: 7 },
      ],
    };
  }

  componentDidMount() {
    //this.fetchApp()
    this.props.dispatch(setCurrentPage("guide"));
    this.props.dispatch(setCurrentSection("guide"));
  }

  url = () => {
    return `/apps/${this.props.match.params.appId}.json`;
  };

  // Form Event Handlers
  update = (data) => {
    this.props.dispatch(
      this.props.updateApp(data.app, (d) => {
        console.log(d);
      })
    );
  };

  uploadHandler = (file, kind) => {
    getFileMetadata(file).then((input) => {
      graphql(CREATE_DIRECT_UPLOAD, input, {
        success: (data) => {
          const {
            signedBlobId,
            headers,
            url,
            serviceUrl,
          } = data.createDirectUpload.directUpload;
          const progressCallback = (event) => {
            if (event.lengthComputable) {
              var percentComplete = event.loaded / event.total;
              this.setState({ completed: parseInt(percentComplete * 100) });
            }
          };
          directUploadWithProgress(
            url,
            JSON.parse(headers),
            file,
            progressCallback
          ).then(() => {
            let params = {};
            params[kind] = signedBlobId;
            this.update({ app: params });
          });
        },
        error: (error) => {
          console.log("error on signing blob", error);
        },
      });
    });
  };

  handleTabChange = (e, i) => {
    this.setState({ tabValue: i });
  };

  selectItem = (index) => {
    this.setState({ selected: index });
  };
  renderContent = (i) => {
    switch (i) {
      case 1:
        return (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ marginRight: 90 }}>
              <div style={{ fontSize: 17 }}>
                <span>Display article on chat window</span>
              </div>
              <div
                style={{ marginTop: 35, marginBottom: 35, lineHeight: "32px" }}
              >
                <span
                  style={{ fontWeight: "normal", fontSize: 17, width: "100%" }}
                >
                  Welcome to Intercom! Your path to great relationships with
                  your customers starts here.
                </span>
                <br />
                <span
                  style={{ fontWeight: "normal", fontSize: 17, width: "100%" }}
                >
                  First, watch a quick video to get an overview of the steps
                  you’ll take to set up Intercom for your business, and what
                  you’ll learn along the way.
                </span>
              </div>
              <div>
                <Button
                  variant="contained"
                  color="secondary"
                  style={{
                    width: 200,
                    height: 50,
                    backgroundColor: "#FFD300",
                    color: "#000",
                  }}
                >
                  Continue
                </Button>
              </div>
            </div>
            <div style={{ width: 420 }}>
              <video width="400" controls>
                <source
                  src="https://www.radiantmediaplayer.com/media/bbb-360p.mp4"
                  type="video/mp4"
                />
              </video>
            </div>
          </div>
        );
      case 2:
        return (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ marginRight: 90 }}>
              <div
                style={{ marginTop: 35, marginBottom: 35, lineHeight: "32px" }}
              >
                <span
                  style={{ fontWeight: "normal", fontSize: 17, width: "100%" }}
                >
                  Welcome to Intercom! Your path to great relationships with
                  your customers starts here.
                  <br />
                  First, watch a quick video to get an overview of the steps
                  you’ll take to set up Intercom for your business, and what
                  you’ll learn along the way.
                </span>
              </div>
              <div style={{ fontSize: 17, fontWeight: "bold" }}>
                <span>Add my company logo</span>
              </div>
              <div style={{ marginTop: 20, marginBottom: 20 }}>
                <Button variant="contained" color="primary">
                  Upload Logo
                </Button>
              </div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: "bold",
                  marginTop: 10,
                  marginBottom: 10,
                }}
              >
                <span>Choose your background color for your message</span>
              </div>
              <div style={{ marginTop: 20, marginBottom: 20, maxWidth: 250 }}>
                <ColorPicker color="#000" label={""} />
              </div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: "bold",
                  marginTop: 10,
                  marginBottom: 10,
                }}
              >
                <span>Choose a color for buttons and links</span>
              </div>
              <div style={{ marginTop: 20, marginBottom: 20, maxWidth: 250 }}>
                <ColorPicker color="#000" label={""} />
              </div>

              <div style={{ marginTop: 10, marginBottom: 10 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  style={{
                    width: 200,
                    height: 50,
                    backgroundColor: "#FFD300",
                    color: "#000",
                  }}
                >
                  Continue
                </Button>
              </div>
            </div>
            <div style={{ width: 420 }}>
              <div
                style={{
                  maxHeight: 740,
                  width: 400,
                  backgroundColor: "rgb(250, 246, 241)",
                  marginBottom: 10,
                  zIndex: 1000,
                  borderRadius: 5,
                  height: "calc(80vh - 50px)",
                  border: "solid 1px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#000",
                    color: "#FFF",
                    textAlign: "center",
                    fontSize: 25,
                    fontWeight: "bold",
                    paddingTop: 40,
                    paddingBottom: 10,
                  }}
                >
                  Hi, Brian
                </div>
                <div
                  style={{
                    backgroundColor: "#000",
                    color: "#FFF",
                    textAlign: "center",
                    fontSize: 10,
                    fontWeight: "bold",
                    paddingTop: 20,
                    paddingBottom: 80,
                  }}
                >
                  We help your business grow by
                  <br />
                  connecting you to your customers.
                </div>
                <div
                  style={{
                    width: "calc(100% - 40px)",
                    marginLeft: 20,
                    backgroundColor: "#fff",
                    transform: "translateY(-55px)",
                    padding: 20,
                    borderRadius: 10,
                  }}
                >
                  <div style={{ fontSize: 15 }}>Your Conversation</div>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-start",
                        marginTop: 10,
                        marginBottom: 10,
                      }}
                    >
                      <Avatar
                        style={{ width: 32, height: 32, marginRight: 10 }}
                        src="../../../assets/user1.jpg"
                      />
                      <Avatar
                        style={{ width: 32, height: 32, marginRight: 10 }}
                        src="../../../assets/user2.jpg"
                      />
                      <Avatar
                        style={{ width: 32, height: 32, marginRight: 10 }}
                        src="../../../assets/user3.jpg"
                      />
                    </div>
                    <div
                      style={{
                        marginTop: 20,
                        marginBottom: 20,
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Button variant="contained" color="primary">
                        <ForumSharpIcon
                          style={{
                            marginRight: 10,
                            fontSize: 18,
                            width: 18,
                            height: 18,
                          }}
                        />
                        Start a conversation
                      </Button>
                      <span style={{ lineHeight: "35px" }}>See previous</span>
                    </div>
                    <div style={{ display: "flex" }}>
                      <StyledBadge
                        overlap="circle"
                        anchorOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                        variant="dot"
                      >
                        <Avatar
                          alt="Remy Sharp"
                          style={{
                            borderRadius: "50%",
                            border: "solid 1px black",
                          }}
                          src="/assets/user3.jpg"
                        />
                      </StyledBadge>
                      <div
                        style={{
                          marginLeft: 20,
                          maxWidth: 200,
                          lineHeight: "12px",
                          fontSize: 12,
                        }}
                      >
                        <small>Bot</small>
                        <br />
                        <small>
                          Ok, let us know if you need something and An agent
                          will reply as soon as possible
                        </small>
                      </div>
                      <div>
                        <small style={{ fontSize: 9 }}>6 mins ago</small>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    marginTop: -45,
                    width: "calc(100% - 40px)",
                    marginLeft: 20,
                    backgroundColor: "#FFF",
                    padding: 20,
                    borderRadius: 10,
                  }}
                >
                  <div>Find answers in our article's repository</div>
                  <FormControl
                    variant="outlined"
                    style={{
                      border: "solid 1px black",
                      borderRadius: 5,
                      marginTop: 20,
                    }}
                  >
                    <OutlinedInput
                      id="outlined-adornment-weight"
                      endAdornment={
                        <InputAdornment>
                          <IconButton
                            edge="end"
                            style={{
                              width: 53,
                              height: 53,
                              borderRadius: 5,
                              backgroundColor: "#000",
                              color: "#FFF",
                            }}
                          >
                            <SearchIcon />
                          </IconButton>
                        </InputAdornment>
                      }
                      labelWidth={0}
                    />
                  </FormControl>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ marginRight: 90 }}>
              <div
                style={{
                  marginTop: 5,
                  marginBottom: 35,
                  lineHeight: "32px",
                }}
              >
                <span
                  style={{
                    fontWeight: "normal",
                    fontSize: 17,
                    width: "100%",
                  }}
                >
                  Setting up the Messenger for visitors lets you chat with
                  people when they’re on your website.
                </span>
                <div
                  style={{ fontSize: 17, fontWeight: "bold", marginTop: 20 }}
                >
                  <span>Add my company logo</span>
                </div>
                <div style={{ display: "flex", paddingTop: 20, flex: 1 }}>
                  <div
                    style={{
                      height: 150,
                      backgroundColor: "#E6F7FF",
                      width: "50%",
                      border: "solid 1px #E5E5E5",
                      borderRight: "none",
                      color: '#5501B7',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <div>
                      <span style={{fontSize: 22}}>&lt;/&gt;</span>
                    </div>

                    <div style={{fontSize: 17}}>
                      <span>with code</span>
                    </div>
                    <div style={{fontSize: 13}}>
                      <span>javascript, rails</span>
                    </div>
                  </div>
                  <div
                    style={{
                      height: 150,
                      backgroundColor: "transparent",
                      width: "50%",
                      border: "solid 1px #E5E5E5",
                      color: '#000000',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <div>
                      <span style={{fontSize: 22}}>&lt;/&gt;</span>
                    </div>

                    <div style={{fontSize: 17}}>
                      <span>with a third-part app</span>
                    </div>
                    <div style={{fontSize: 13}}>
                      <span>Segment, Wordpress, Shopify</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ width: 540, backgroundColor: '#F5F4F4' }}>

            </div>
          </div>
        );
      default:
        return (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ marginRight: 90 }}>
              <div style={{ fontSize: 17 }}>
                <span>Display article on chat window</span>
              </div>
              <div>
                <Button
                  variant="contained"
                  color="secondary"
                  style={{
                    width: 200,
                    height: 50,
                    backgroundColor: "#FFD300",
                    color: "#000",
                  }}
                >
                  Continue
                </Button>
              </div>
            </div>
            <div style={{ width: 420 }}>
              <video width="400" controls>
                <source
                  src="https://www.radiantmediaplayer.com/media/bbb-360p.mp4"
                  type="video/mp4"
                />
              </video>
            </div>
          </div>
        );
    }
  };

  render() {
    const { classes } = this.props;
    const { tabs, selected } = this.state;
    return (
      <div>
        {this.props.app ? (
          <React.Fragment>
            <ContentHeader
              title={"Your Quick Start Guide"}
              headerClass={classes.appSettingTitleContainer}
              headerTitleClass={classes.appSettingTitle}
              headerMenuClass={classes.appSettingMenu}
            />
            <div
              style={{ marginLeft: 70, borderTop: "solid 1px rgba(0,0,0,0.1)" }}
            >
              {tabs.map((tab) => {
                const checked = selected === tab.key;
                return (
                  <Guide
                    {...tab}
                    onSelect={() => this.selectItem(tab.key)}
                    selected={checked}
                  >
                    {checked && this.renderContent(tab.key)}
                  </Guide>
                );
              })}
            </div>
          </React.Fragment>
        ) : null}
      </div>
    );
  }
}

GuideContainer.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles, { withTheme: true })(GuideContainer);
