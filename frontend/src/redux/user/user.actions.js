/** @format */

import { UserActionTypes } from './user.types';

const setCurrentUser = user => {
    return {
        type: UserActionTypes.SET_CURRENT_USER,
        payload: user,
    };
};

export { setCurrentUser };
