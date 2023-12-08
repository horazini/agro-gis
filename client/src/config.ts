export const API =
  process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_API_URL_DEV
    : process.env.REACT_APP_API_URL_PROD;
export const SENTINEL_HUB_API_URL = process.env.REACT_APP_SENTINEL_HUB_API_URL;
export const SENTINEL_HUB_BASE_URL =
  process.env.REACT_APP_SENTINEL_HUB_BASE_URL || "";
export const PLANET_LABS_API_KEY =
  process.env.REACT_APP_PLANET_LABS_API_KEY || "";
