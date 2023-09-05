import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ThunkAction } from "redux-thunk";
import { RootState } from "./store";

import { API } from "../config";

interface AuthState {
  isAuthenticated: boolean;
  userId: number | null;
  tenantId: number | null;
  userTypeId: number | null;
  username: string | null;
  names: string | null;
  surname: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  userId: null,
  tenantId: null,
  userTypeId: null,
  username: null,
  names: null,
  surname: null,
};

// ------------------------------------

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{
        tenantId: number;
        userTypeId: number;
        userId: number;
        username: string;
        names: string;
        surname: string;
      }>
    ) => {
      state.isAuthenticated = true;
      state.tenantId = action.payload.tenantId;
      state.userTypeId = action.payload.userTypeId;
      state.userId = action.payload.userId;
      state.username = action.payload.username;
      state.names = action.payload.names;
      state.surname = action.payload.surname;

      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("tenantId", String(action.payload.tenantId));
      localStorage.setItem("userTypeId", String(action.payload.userTypeId));
      localStorage.setItem("userId", String(action.payload.userId));
      localStorage.setItem("username", action.payload.username);
      localStorage.setItem("names", action.payload.names);
      localStorage.setItem("surname", action.payload.surname);
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = false;
    },
    logoutSuccess: (state) => {
      state.isAuthenticated = false;
      state.tenantId = null;
      state.userTypeId = null;
      state.userId = null;
      state.username = null;
      state.names = null;
      state.surname = null;
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("tenantId");
      localStorage.removeItem("userTypeId");
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
      localStorage.removeItem("names");
      localStorage.removeItem("surname");
    },
  },
});

export const { loginSuccess, loginFailure, logoutSuccess } = authSlice.actions;

export const login =
  (formData: {
    username: string;
    password: string;
  }): ThunkAction<Promise<void>, RootState, unknown, any> =>
  async (dispatch) => {
    try {
      const headers: HeadersInit = {};
      const authToken = localStorage.getItem("authToken"); //getAuthToken();
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }
      /* 
      // Attempt to log in outside dev environment fails on next 
      // fetch, may have something to do with CORS or env var 
      */
      const response = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: formData ? JSON.stringify(formData) : undefined,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
      const res = await response.json();

      const { token, tenantId, userTypeId, userId, username, names, surname } =
        res;

      localStorage.setItem("authToken", token); // setAuthToken(token: string);

      dispatch(
        loginSuccess({ tenantId, userTypeId, userId, username, names, surname })
      );
    } catch (error: any) {
      if (!error.response) {
        throw error;
      }
      dispatch(loginFailure(error.message));
    }
  };

export const logout =
  (): ThunkAction<Promise<void>, RootState, unknown, any> =>
  async (dispatch) => {
    localStorage.removeItem("authToken"); //removeAuthToken();
    dispatch(logoutSuccess());
  };

export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;

export default authSlice.reducer;
