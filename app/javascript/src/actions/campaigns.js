import ActionTypes from '../constants/action_types';

// Action Creators
export function setCampaignsNeedToUpdateCount() {
  return (dispatch, getState) => {    
     dispatch({
       type: ActionTypes.SetCampaignNeedToUpdateCount
     })
  }
}


const initialState = {getCampaignNeedToUpdateCount: 0}

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case ActionTypes.SetCampaignNeedToUpdateCount:
      return Object.assign({}, state , {getCampaignNeedToUpdateCount: state.getCampaignNeedToUpdateCount + 1})
    default: return state
  }
}
