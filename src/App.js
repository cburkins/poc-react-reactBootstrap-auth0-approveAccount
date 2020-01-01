import React from "react";
import { HashRouter, Switch, Route } from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";

// Custom Hook
import { useAuth0 } from "./react-auth0-spa";

export default function App() {
    // useContext() to get access to global props/methods
    const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
    const isAuthenticatedStatus = isAuthenticated ? "Authenticated" : "Not Authenticated";

    // Use custom hook, essentially grabs the "loading" via useContext()
    // loading=true means that we are still waiting to get our authentication state from Auth0
    const { loading } = useAuth0();
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="App">
            <HashRouter>
                <div>
                    <Navbar bg="light">
                        {/* 1st Nav item, mr-auto pushes the 2nd Nav item to the right */}
                        {/* prettier-ignore */}
                        <Nav className="mr-auto">
                            <Nav.Item><Nav.Link as={Link} to="/">Home</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link as={Link} to="/about">About</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link as={Link} to="/users">Users</Nav.Link></Nav.Item>
                        </Nav>
                        {/* 2nd Nav item, gets pushed to right because of mr-auto on first item */}
                        <Nav>Status: {isAuthenticatedStatus}</Nav>
                        <Nav className="ml-3">
                            {!isAuthenticated && <button onClick={() => loginWithRedirect({})}>Log in</button>}
                            {isAuthenticated && <button onClick={() => logout()}>Log out</button>}
                        </Nav>
                    </Navbar>
                    {/* A <Switch> looks through its children <Route>s and renders first that matches current URL. */}
                    <Switch>
                        <Route path="/about" component={About} />
                        <Route path="/users" component={Users} />
                        <Route path="/" component={Home} />
                    </Switch>
                </div>
            </HashRouter>
        </div>
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
