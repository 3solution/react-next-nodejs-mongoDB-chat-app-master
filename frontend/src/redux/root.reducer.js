/** @format */

import { combineReducers } from 'redux';

import userReducer from './user/user.reducer';
// import savedStateReducer from './saved-state/saved-state.reducer';

import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';

const rootReducer = combineReducers({
    user: userReducer,
    // savedState: savedStateReducer,
});

const persistConfig = {
    key: 'gsoc-challenge-chat-app',
    storage: storage,
};

export default persistReducer(persistConfig, rootReducer);
