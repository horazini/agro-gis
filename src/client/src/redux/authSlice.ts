import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ThunkAction } from "redux-thunk";
import { RootState } from "./store";
import { apiRequest, setAuthToken, removeAuthToken } from "./api";

import { API } from "../config";

interface AuthState {
  isAuthenticated: boolean;
  error: string | null;
  userId: number | null;
  tenantId: number | null;
  userTypeId: number | null;
  username: string | null;
  names: string | null;
  surname: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  error: null,
  userId: null,
  tenantId: null,
  userTypeId: null,
  username: null,
  names: null,
  surname: null,
};

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
      state.error = null;
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
      state.error = action.payload;
    },
    logoutSuccess: (state) => {
      state.isAuthenticated = false;
      state.error = null;
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
      const { token, tenantId, userTypeId, userId, username, names, surname } =
        await apiRequest<{
          token: string;
          tenantId: number;
          userTypeId: number;
          userId: number;
          username: string;
          names: string;
          surname: string;
        }>("POST", `${API}/login`, formData);
      setAuthToken(token);

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
    removeAuthToken();
    dispatch(logoutSuccess());
  };

export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
