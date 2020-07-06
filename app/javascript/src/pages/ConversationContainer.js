import React, { Component } from "react";
import { Route, Link, Switch, withRouter } from "react-router-dom";

import sanitizeHtml from "sanitize-html";

import { connect } from "react-redux";

import {
  RowColumnContainer,
  ColumnContainer,
  GridElement,
  FixedHeader,
  ConversationsButtons,
  Overflow,
} from "../components/conversation/styles";

import Hidden from "@material-ui/core/Hidden";
import Button from "@material-ui/core/Button";
import CheckIcon from "@material-ui/icons/Check";
import InboxIcon from "@material-ui/icons/Inbox";
import FilterListIcon from "@material-ui/icons/FilterList";
import ChatIcon from "@material-ui/icons/Chat";
import Tooltip from "@material-ui/core/Tooltip";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import UserListItem from "../components/conversation/UserListItem";
import Progress from "../shared/Progress";
import FilterMenu from "../components/conversation/filterMenu";

import ConversationContainerShow from "../components/conversation/container";
import image from "../../../assets/images/empty-icon8.png";
import {
  getConversations,
  updateConversationsData,
  clearConversations,
} from "../actions/conversations";
import { withStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';

import { getAppUser } from "../actions/app_user";

import AssignmentRules from "../components/conversation/assignmentRules";
import { setCurrentSection, setCurrentPage } from "../actions/navigation";
import { Checkbox, FormControlLabel } from '@material-ui/core';
import SearchBar from 'material-ui-search-bar';
import Avatar from "@material-ui/core/Avatar";

const GreenCheckbox = withStyles({
  root: {
    color: green[400],
    '&$checked': {
      color: green[600],
    },
  },
  checked: {},
})((props) => <Checkbox color="default" {...props} />);


class ConversationContainer extends Component {
  constructor(props) {
    super(props);
    this.fetching = false;
    this.props.dispatch(clearConversations([]));
  }

  componentDidMount() {
    this.getConversations({ page: 1 });

    this.props.dispatch(setCurrentSection("Conversations"));
  }

  handleScroll = (e) => {
    let element = e.target;

    //console.log(element.scrollHeight - element.scrollTop, element.clientHeight)
    if (element.scrollHeight - element.scrollTop === element.clientHeight) {
      if (this.props.conversations.meta.next_page && !this.fetching) {
        this.fetching = true;
        this.getConversations({}, () => {
          this.fetching = false;
        });
      }
    }
  };

  getConversations = (options, cb) => {
    this.props.dispatch(
      getConversations(options, () => {
        cb && cb();
      })
    );
  };

  setSort = (option) => {
    this.props.dispatch(updateConversationsData({ sort: option }));
    this.setState({ sort: option });
  };

  setFilter = (option) => {
    this.props.dispatch(updateConversationsData({ filter: option }));
  };

  filterButton = (handleClick) => {
    return (
      <Tooltip title="filter conversations">
        <a
          className="btn-dropdown"
          aria-label="More"
          aria-controls="long-menu"
          aria-haspopup="true"
          variant={"outlined"}
          onClick={handleClick}
          size="small"
        >
          {/*<MoreVertIcon />*/}
          {this.props.conversations.filter}
        </a>
      </Tooltip>
    );
  };

  sortButton = (handleClick) => {
    return (
      <Tooltip title="sort conversations">
        <a
          className="btn-dropdown"
          aria-label="More"
          aria-controls="long-menu"
          aria-haspopup="true"
          variant={"outlined"}
          onClick={handleClick}
          size="small"
        >
          {/*<MoreVertIcon />*/}
          {this.props.conversations.sort}
        </a>
      </Tooltip>
    );
  };

  filterConversations = (options, cb) => {
    this.props.dispatch(
      updateConversationsData({ filter: options.id, collection: [] }, () => {
        this.getConversations({ page: 1 }, cb);
      })
    );
  };

  sortConversations = (options, cb) => {
    this.props.dispatch(
      updateConversationsData({ sort: options.id, collection: [] }, () => {
        this.getConversations({ page: 1 }, cb);
      })
    );
  };

  renderConversationContent = (o) => {
    const message = o.lastMessage.message;
    if (message.htmlContent)
      return sanitizeHtml(message.htmlContent).substring(0, 250);
  };

  renderUserConversationDetail = detail => {
    let participant;
    if (detail && detail.collection) {
      participant = detail.collection.find(userDetail => userDetail.appUser.id === detail.mainParticipant.id);
    }

    return (
        <GridElement
            style={{
              display: "flex",
              justifyContent: "space-around",
            }}
        >
          <div style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
            <FixedHeader style={{ height: "65px", width: '100%' }}>
              <b style={{fontSize: 22, fontFamily: 'Proxima Nova'}}>Conversations</b>
            </FixedHeader>

            <div className='text-center'>
              {
                participant &&
                <>
                  <div style={{width: 150,
                    height: 150,
                    margin: 'auto',
                    marginTop: 50}}>

                  <Avatar
                      style={{width: '100%', height: '100%'}}
                      alt={participant.appUser.email}
                      src={participant.appUser.avatarUrl}
                  />
                  </div>
                  <div style={{margin: 20, fontSize: 18}}>
                    <b>{participant.appUser.displayName}</b>
                  </div>
                  <div className="text-left" style={{margin: 20, border: 'solid 1px #E5E5E5', borderRadius: 5, padding: 10, paddingLeft: 30, lineHeight: 1.6}}>
                    <div>User: {participant.appUser.displayName}</div>
                    <div>Location: {participant.appUser.location ? participant.appUser.location : ''}</div>
                    <div>Email: {participant.appUser.email}</div>
                    <div>Owner: {participant.appUser.owner ? participant.appUser.owner : 'no owner'}</div>
                    <div>CustomerId: {participant.appUser.id}</div>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <a href="javascript:0" style={{color: 'black'}}>show more</a>
                      <Button style={{marginLeft: 20, padding: 0 }} variant="outlined">Edit</Button></div>
                  </div>
                  <div className="text-left" style={{margin: 20, border: 'solid 1px #E5E5E5', borderRadius: 5, padding: 10, paddingLeft: 30, lineHeight: 1.2}}>
                    <span style={{fontSize: 18}}>Qualification</span>
                    <div className="qualification-check">
                      <FormControlLabel
                          control={<GreenCheckbox checked name="checkName" />}
                          label={<span style={{ fontSize: 14 }}>{'Name  ' + participant.appUser.displayName}</span>}
                          style={{fontSize: 12}}
                      />
                    </div>
                    <div className="qualification-check">
                      <FormControlLabel
                          control={<GreenCheckbox checked name="checkName" />}
                          label={<span style={{ fontSize: 14 }}>{'Email  ' + participant.appUser.email}</span>}
                          style={{fontSize: 12}}
                      />
                    </div>
                    <div className="qualification-check">
                      <FormControlLabel disabled
                          control={<GreenCheckbox name="checkName" />}
                          label={<span style={{ fontSize: 14 }}>{'Phone'} <a style={{marginLeft: 20, padding: 0, color: 'black' }} href="javascript:0">Add</a></span>}
                          style={{fontSize: 12}}
                      />
                    </div>
                    <div className="qualification-check">
                      <FormControlLabel disabled
                          control={<GreenCheckbox name="checkName" />}
                          label={<span style={{ fontSize: 14 }}>{'Company Name'} <a style={{marginLeft: 20, padding: 0, color: 'black' }} href="javascript:0">Add</a></span>}
                          style={{fontSize: 12}}
                      />
                    </div>
                    <div className="qualification-check">
                      <FormControlLabel disabled
                          control={<GreenCheckbox name="checkName" />}
                          label={<span style={{ fontSize: 14 }}>{'Company Size'} <a style={{marginLeft: 20, padding: 0, color: 'black' }} href="javascript:0">Add</a></span>}
                          style={{fontSize: 12}}
                      />
                    </div>
                    <div className="qualification-check">
                      <FormControlLabel disabled
                          control={<GreenCheckbox name="checkName" />}
                          label={<span style={{ fontSize: 14 }}>{'Company Website'} <a style={{marginLeft: 20, padding: 0, color: 'black' }} href="javascript:0">Add</a></span>}
                          style={{fontSize: 12}}
                      />
                    </div>
                    <div className="qualification-check">
                      <FormControlLabel
                          control={<GreenCheckbox name="checkName" disabled/>}
                          label={<span style={{ fontSize: 14 }}>{'Company industry'} <a style={{marginLeft: 20, padding: 0, color: 'black' }} href="javascript:0">Add</a></span>}
                          style={{fontSize: 12}}
                      />
                    </div>
                    <div className="qualification-check">
                      <FormControlLabel disabled
                          control={<GreenCheckbox name="checkName" />}
                          label={<span style={{ fontSize: 14 }}>{'Number of Emails'} <a style={{marginLeft: 20, padding: 0, color: 'black' }} href="javascript:0">Add</a></span>}
                          style={{fontSize: 12}}
                      />
                    </div>
                    <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                      <Button style={{marginLeft: 20, padding: 0 }} variant="outlined">Setting</Button>
                    </div>
                  </div>
                </>
              }
            </div>
          </div>
        </GridElement>
    )
  }

  renderConversations = (appId) => {
    let collections = [];
    if (this.props.conversations && this.props.conversations.collection && this.props.conversations.collection.length > 0) {
      collections = this.props.conversations.collection;
    } else {
      collections = [
        {
          mainParticipant: 'Admin',
          key: 'admin-channel',
          lastMessage: {
            appUser: 'admin',
            createdAt: new Date()
          }
        }
      ]
    }
    return (
      <GridElement
        noFlex
        style={{
          boxShadow: "rgba(204, 204, 204, 0.52) 8px -4px 20px 0px",
          overflow: "hidden"
        }}
      >
        {/*<FixedHeader>Conversations</FixedHeader>*/}
        <FixedHeader style={{ height: "65px" }}>

          <div className='searchContainer'>
            <SearchBar
                onChange={null}
                placeholder='Search Message'
                onRequestSearch={null}
                style={{
                  boxShadow: 'none',
                  border: 'none',
                  backgroundColor: '#FAF6F1',
                  borderRadius: 5
                }}
            />
          </div>

        </FixedHeader>

        <FixedHeader style={{ height: "67px" }}>
          {/*<HeaderTitle>
                  Conversations
                </HeaderTitle>*/}

          <ConversationsButtons>
            <FilterMenu
              options={[
                { id: "opened", name: "opened", count: 1, icon: <InboxIcon /> },
                { id: "closed", name: "closed", count: 2, icon: <CheckIcon /> },
              ]}
              value={this.props.conversations.filter}
              filterHandler={this.filterConversations}
              triggerButton={this.filterButton}
            />

            <FilterMenu
              options={[
                { id: "newest", name: "newest", count: 1, selected: true },
                { id: "oldest", name: "oldest", count: 1 },
                { id: "waiting", name: "waiting", count: 1 },
                { id: "priority-first", name: "priority first", count: 1 },
                { id: "unfiltered", name: "all", count: 1 },
              ]}
              value={this.props.conversations.sort}
              filterHandler={this.sortConversations}
              triggerButton={this.sortButton}
            />
          </ConversationsButtons>
        </FixedHeader>

        <Overflow onScroll={this.handleScroll}>
          {this.props.conversations.collection.map((o, i) => {
            const user = o.mainParticipant;

            return (
              <div
                key={o.id}
                onClick={(e) =>
                  this.props.history.push(
                    `/apps/${appId}/conversations/${o.key}`
                  )
                }
              >
                <UserListItem
                  value={this.props.conversation.key}
                  mainUser={user}
                  object={o.key}
                  messageUser={o.lastMessage.appUser}
                  showUserDrawer={() =>
                    this.props.actions.showUserDrawer(user.id)
                  }
                  messageObject={o.lastMessage}
                  conversation={o}
                  createdAt={o.lastMessage.message.createdAt}
                  message={this.renderConversationContent(o)}
                  appKey={appId}
                />
              </div>
            );
          })}

          {this.props.conversations.loading ? <Progress /> : null}
        </Overflow>
      </GridElement>
    );
  };

  render() {
    const { appId } = this.props.match.params;

    return (
      <RowColumnContainer>
        <ColumnContainer>
          <Hidden smUp>
            <Route
              exact
              path={`/apps/${appId}/conversations`}
              render={(props) => this.renderConversations(appId)}
            />
          </Hidden>

          <Hidden smDown>{this.renderConversations(appId)}</Hidden>

          {/*
                <Drawer 
                open={this.state.displayMode === "conversations"} 
                onClose={this.hideDrawer}>
                {this.renderConversations()}
                </Drawer>
              */}

          <Switch>
            <Route
              exact
              path={`/apps/${appId}/conversations`}
              render={(props) => (
                <EmptyConversation dispatch={this.props.dispatch} />
              )}
            />

            <Route
              exact
              path={`/apps/${appId}/conversations/assignment_rules`}
              render={(props) => (
                <GridElement
                  grow={2}
                  style={{
                    display: "flex",
                    justifyContent: "space-around",
                  }}
                >
                  <FixedHeader style={{ height: "65px" }}/>
                  <AssignmentRules />
                </GridElement>
              )}
            />

            <Route
              exact
              path={`/apps/${appId}/conversations/:id`}
              render={(props) => (
                <>
                  <ConversationContainerShow
                    appId={appId}
                    app={this.props.app}
                    events={this.props.events}
                    conversation={this.props.conversation}
                    showUserDrawer={this.props.actions.showUserDrawer}
                    currentUser={this.props.currentUser}
                    {...props}
                  />
                  <Hidden smDown>{this.renderUserConversationDetail(this.props.conversation)}</Hidden>
                </>
              )}
            />
          </Switch>
        </ColumnContainer>
      </RowColumnContainer>
    );
  }
}

class EmptyConversation extends Component {
  componentDidMount() {
    this.props.dispatch(setCurrentPage("Conversations"));
  }

  render() {
    return (
      <Hidden smDown>
        <FixedHeader style={{ height: "65px" }}/>
        <GridElement
          grow={2}
          style={{
            display: "flex",
            justifyContent: "space-around",
          }}
        >
          <div style={{ alignSelf: "center" }}>
            <Paper style={{ padding: "2em" }}>
              <ChatIcon fontSize="large" />
              <Typography variant="h5">Conversations</Typography>

              <Typography component="p">Select a conversation</Typography>

              <img width="300px" src={image} />
            </Paper>
          </div>
        </GridElement>
      </Hidden>
    );
  }
}

function mapStateToProps(state) {
  const { auth, app, conversations, conversation, app_user } = state;
  const { loading, isAuthenticated } = auth;
  //const { sort, filter, collection , meta, loading} = conversations

  return {
    conversations,
    conversation,
    app_user,
    app,
    isAuthenticated,
  };
}

export default withRouter(connect(mapStateToProps)(ConversationContainer));
