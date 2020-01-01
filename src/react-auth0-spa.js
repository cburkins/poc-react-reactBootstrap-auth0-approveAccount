// src/react-auth0-spa.js

import React, { useState, useEffect, useContext } from "react";
import createAuth0Client from "@auth0/auth0-spa-js";

// ---------------------------------------------------------------------------------

// Internal function
// Modifies the current history entry
// Essentially changes URL of current page without having to reload the page
// We seem to be replacing URL with the SAME current URL
// It also seems that we never actually call this function
const DEFAULT_REDIRECT_CALLBACK = () => {
  console.error("Changing Page URL:", window.location.pathname);
  // replaceState() does not manipulate browser history, it simply replaces current URL in address bar
  window.history.replaceState({}, document.title, window.location.pathname);
};

// ---------------------------------------------------------------------------------

// Exported function
// We're essentially creating/exporting a "custom hook"
// Creates Auth0Context.Consumer() and Auth0Context.Provider() functions
// For Class components, you'd wrap a child component in .Conumser() to get access to these props
// For Functional components, you can use the useContext() function
const Auth0Context = React.createContext();
export const useAuth0 = () => useContext(Auth0Context);

// ---------------------------------------------------------------------------------

// Exported function to create Auth0Client
// Functional component, uses destructuring to get "children" and onRedirectCallback props
// "children" is everything inside the actual Auth0Provider tag
// "onRedirectCallback" is a named prop that the caller might have used, with DEFAULT_REDIRECT_CALLBACK being the default (if no value was given)
export const Auth0Provider = ({ children, onRedirectCallback = DEFAULT_REDIRECT_CALLBACK, ...initOptions }) => {
  // useState() is a React Hook, retrieves simple state where do you don't lifecycle methods or a full React class component
  // Creates new state variable, arg1 to useState() is initial value, returns two values (value, and method to set value)
  const [isAuthenticated, setIsAuthenticated] = useState();
  const [user, setUser] = useState();
  const [auth0Client, setAuth0] = useState();
  const [loading, setLoading] = useState(true);

  //   -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
  // React Hook, useEffect() runs after first render, and after every re-render (DOM update)
  // Essentially a "side effect" sort of like componentDidMount, componentDidUpdate, and componentWillUnmount combined
  // 2nd arg (array) is empty, so this fn is called every time it's re-rendered
  useEffect(() => {
    const initAuth0 = async () => {
      console.warn("Creating Auth0 Client");
      const auth0FromHook = await createAuth0Client(initOptions);
      setAuth0(auth0FromHook);

      // If we just returned from Auth0, then URL will contain "code=" query param
      if (window.location.search.includes("code=")) {
        console.error("=code");
        // If we called loginWithRedirecct() with {appstate: <something>}, we'll get it back here
        const { appState } = await auth0FromHook.handleRedirectCallback();
        console.warn("appState", appState);
        console.warn("About to call onRedirectCallback()");
        onRedirectCallback(appState);
      }

      const isAuthenticated = await auth0FromHook.isAuthenticated();
      setIsAuthenticated(isAuthenticated);

      if (isAuthenticated) {
        const user = await auth0FromHook.getUser();
        setUser(user);
      }

      setLoading(false);
    };
    initAuth0();
    // eslint-disable-next-line
  }, []);

  //   -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
  // This is the return for the Auth0Provider component definition (Auth0Provider component is used in index.js)
  return (
    <Auth0Context.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        getIdTokenClaims: (...p) => auth0Client.getIdTokenClaims(...p),
        loginWithRedirect: (...p) => auth0Client.loginWithRedirect(...p),
        getTokenSilently: (...p) => auth0Client.getTokenSilently(...p),
        getTokenWithPopup: (...p) => auth0Client.getTokenWithPopup(...p),
        logout: (...p) => auth0Client.logout(...p)
      }}>
      {children}
    </Auth0Context.Provider>
  );
};
// End of "Auth0Provider" component
// ---------------------------------------------------------------------------------
