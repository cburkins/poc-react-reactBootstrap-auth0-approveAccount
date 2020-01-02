import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { Auth0Provider } from "./react-auth0-spa";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import config from "./auth_config.json";

// A function that routes the user to the right place after login
const onRedirectCallback = appState => {
  console.warn("onRedirectCallback() within index.js");
  console.warn(appState);
  console.warn("window.location.pathname", window.location.pathname);
  window.history.replaceState({}, document.title, appState && appState.targetUrl ? appState.targetUrl : window.location.pathname);
  // history.push(appState && appState.targetUrl ? appState.targetUrl : window.location.pathname);
};

// arg 1: React element, arg2: container DOM element
// Mounts arg1 as a child in the DOM container (arg2)
ReactDOM.render(
  // Wrap our App in Auth0Provider wrapper
  // config.domain and config.clientId come from ./auth_config.json (must match known Auth0 registered application)
  <Auth0Provider domain={config.domain} client_id={config.clientId} redirect_uri={window.location.origin} onRedirectCallback={onRedirectCallback}>
    <App />
  </Auth0Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
