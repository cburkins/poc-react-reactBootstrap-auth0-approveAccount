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
    console.error("Changing Page URL (within DEFAULT_REDIRECT_CALLBACK):", window.location.pathname);
    // replaceState() does not manipulate browser history, it simply replaces current URL in address bar
    window.history.replaceState({}, document.title, window.location.pathname);
};

// ---------------------------------------------------------------------------------

// Exported function
// We're creating/exporting a React "custom hook"
// I think this is just a shortcut to exporting the Context itself, and forcing caller to call "useContext()"
// Creates Auth0Context.Consumer() and Auth0Context.Provider() functions
// For Class components, you'd wrap a child component in .Conumser() to get access to these props
// For Functional components, you can use the useContext() function
const Auth0Context = React.createContext();
export const useContextAuth0 = () => useContext(Auth0Context);

// ---------------------------------------------------------------------------------

// Exported React Functional Component to create Auth0Client context
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
    // Create React Effect Hook, first argument is Effect function, second argument is optional
    // 2nd arg: omitted means effect runs on every render
    //          empty array means effect runs only on first render (i.e. equivalent of componentDidMount)
    //          array of "dependencies", means that affect will ONLY run when one of dependencies changes
    // Within index.js, we're wrapping our entire <App> with this Auth0Provider() function
    // Essentially a "side effect" sort of like componentDidMount, componentDidUpdate, and componentWillUnmount combined
    useEffect(() => {
        // Define initAuth0, then immediately call it down below (I assume so we can use async/await)
        const initAuth0 = async () => {
            console.warn("Started Auth0Provider useEffect()");
            // Auth0 directions say you should only create one instance of the client
            // Somewhat confusing since our SPA gets created, then passes to Auth0 for authentication, then browser comes back to "us"
            // So during authentication, we actually call this twice
            const auth0ClientLocal = await createAuth0Client(initOptions);
            // Use React State Hook to remember our Auth0 client in our "state" using variable auth0Client
            setAuth0(auth0ClientLocal);

            // Two use cases to consider:
            // (1): Initial SPA load when user navigates to our app
            // (2): Browser(and user) got sent over to Auth0 for authentication, and we've now returned back from there
            //      If we just returned from Auth0, then URL will contain "code=" query param
            if (window.location.search.includes("code=")) {
                console.log('Received "code" within response URL, so must be returning from Auth0 authentication');

                // To get over to Auth0 for authentication, we likely called useContextAuth0().loginWithRedirect()
                //    If we called loginWithRedirect() with {appstate: <something>}, we'll see it reflected back to us here
                // I read through Auth0's code, and handleRedirectCallback() makes a call to /oath/token to exchance/send our code for an oauth token
                // This usually happens quickly with no user interaction
                console.log("About to call auth0ClientLocal.handleRedirectCallback(), which just calls /oauth/token");
                try {
                    const { appState } = await auth0ClientLocal.handleRedirectCallback();
                    console.log("appState", appState);
                    console.log("About to call onRedirectCallback()");
                    onRedirectCallback(appState);
                } catch (e) {
                    console.error("Error: Invalid state on redirect from auth0", e); // => Somehow auth0 can not parse the response
                    console.warn("About to call onRedirectCallback() with an empty appstate");
                    onRedirectCallback({});
                }
            }

            // Determine if we're currently authenticated
            const isAuthenticated = await auth0ClientLocal.isAuthenticated();
            // Use React State Hoook to remember if we're currently authenticated
            setIsAuthenticated(isAuthenticated);

            if (isAuthenticated) {
                const user = await auth0ClientLocal.getUser();
                setUser(user);
            }

            setLoading(false);
        };

        // Invoke the function we just defined (I assume so we can use async/await)
        initAuth0();

        // eslint-disable-next-line
    }, []);
    // end of useEffect() within Auth0Provider()
    //   -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -

    // This is the return for the Auth0Provider component definition (Auth0Provider component is used in index.js)
    return (
        // useEffect() function above gets called once when this React component mounts
        <Auth0Context.Provider
            value={{
                isAuthenticated,
                user,
                loading,
                // Uses "rest" operator to get all parameters, then "spread" operator to pass them along as arguments
                getIdTokenClaims: (...p) => auth0Client.getIdTokenClaims(...p),
                loginWithRedirect: (...p) => auth0Client.loginWithRedirect(...p),
                getTokenSilently: (...p) => auth0Client.getTokenSilently(...p),
                getTokenWithPopup: (...p) => auth0Client.getTokenWithPopup(...p),
                logout: (...p) => auth0Client.logout(...p),
            }}
        >
            {children}
        </Auth0Context.Provider>
    );
};
// End of "Auth0Provider" component
// ---------------------------------------------------------------------------------
