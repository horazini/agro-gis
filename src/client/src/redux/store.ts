import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./authSlice";

const initialState = {
  auth: {
    isAuthenticated: localStorage.getItem("isAuthenticated") === "true", // Establece al campo 'isAuthenticated' del estado de Redux, el mismo valor que el de 'isAuthenticated' en el objeto localStorage.
    tenantId: Number(localStorage.getItem("tenantId")),
    userTypeId: Number(localStorage.getItem("userTypeId")),
    userId: Number(localStorage.getItem("userId")),
    username: localStorage.getItem("username"),
    names: localStorage.getItem("names"),
    surname: localStorage.getItem("surname"),
  },
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: initialState,
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

/* 
import { combineReducers } from 'redux';

const rootReducer = combineReducers({
  auth: authReducer,
  //tasks: tasksReducer
});

export default rootReducer; 

*/
