# Background

This is the 2nd part of my 2nd attempt of using Auth0 for user authentication in a React app. The goals of this POC was to start with CRA (create-react-app) again, use react-bootstrap rather than reactstrap (as I did in previous attempt), and leverage my own slimmed down version of react-auth0-spa.js.

I built this POC using:

-   React
-   Bootstrap (via react-bootstrap, not reactstrap)
-   Auth0 (via @auth0/auth0-spa-js)

It demonstrates authentication using OIDC which uses OAuth 2.0 Authorization Code Grant (flow).

![image](https://user-images.githubusercontent.com/9342308/71644598-01339e80-2c99-11ea-95e5-aa26c904ae49.png)

And when you authenticate, it looks like this:

![image](https://user-images.githubusercontent.com/9342308/71644610-2de7b600-2c99-11ea-8ce2-5fa247f6b4b3.png)

# Building this App

-   Started with my own repo "poc-react-react-boostrap"
-   As review, remember that repo started with "npx create-react-app poc-react-react-bootstrap"
-   Then applied basics of react-router-dom and react-boostrap
-   Starting from here, I want to apply a basic Auth0 configuration for login
-   In the beginning, App.js looks like this:

```jsx
import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

export default function App() {
    return (
        <Router>
            <div>
                <Navbar bg="light">
                    {/* 1st Nav item, mr-auto pushes the 2nd Nav item to the right */}
                    <Nav className="mr-auto">
                        <Nav.Item>
                            <Nav.Link href="/">Home</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="/about">About</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="/users">Users</Nav.Link>
                        </Nav.Item>
                    </Nav>
                    {/* 2nd Nav item, gets pushed to right because of mr-auto on first item */}
                    <Nav>Status: Connected</Nav>
                </Navbar>

                {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
                <Switch>
                    <Route path="/about">
                        <About />
                    </Route>
                    <Route path="/users">
                        <Users />
                    </Route>
                    <Route path="/">
                        <Home />
                    </Route>
                </Switch>
            </div>
        </Router>
    );
}

function Home() {
    return <h2>Home</h2>;
}

function About() {
    return <h2>About</h2>;
}

function Users() {
    return <h2>Users</h2>;
}
```

# Adding Auth0

##### Install Auth0

```
npm install react-router-dom @auth0/auth0-spa-js
```

##### Create React Hooks for Auth0

NOTE: Here's the original copy: https://github.com/auth0-samples/auth0-react-samples/blob/master/01-Login/src/react-auth0-spa.js

Here's my customized copy (less functions, more comments)

```jsx
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
```

##### Config file

-   Create src/auth_config.json

```jsx

{
    "domain": "dev-8snzgxfi.auth0.com",
    "clientId": "E7mcNC6Y6OQZXQ12pSDK2YQKp7VHfmFI"
}
```

##### Wrap entire app in Auth0

New version of index.js looks like this:

```jsx
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
```

##### Change from Router to HashRouter

Easy enough

##### Add a button for login / logout

-   App.js: Pull in my custom hook

```jsx
export default function App() {
  // useContext() to get access to global props/methods
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const isAuthenticatedStatus = isAuthenticated ? "Authenticated" : "Not Authenticated";
...
```

##### Defect: Page reloads on every route change, and Auth0 takes a full second to load

Import "Link" from react-router-dom, and leverage "as" feature of <Nav.Link>

```jsx
import { Link } from "react-router-dom";
// prettier-ignore
<Nav className="mr-auto">
    <Nav.Item><Nav.Link as={Link} to="/">Home</Nav.Link></Nav.Item>
    <Nav.Item><Nav.Link as={Link} to="/about">About</Nav.Link></Nav.Item>
    <Nav.Item><Nav.Link as={Link} to="/users">Users</Nav.Link></Nav.Item>
</Nav>
```
