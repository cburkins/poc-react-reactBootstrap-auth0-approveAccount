import React from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";

// Custom Hook
// When we call "useAuth0()" below, essentially calls useContext(Auth0Context)
import { useAuth0 } from "./react-auth0-spa";

const NavBarFn = () => {
    // Calls useContext() to get access to global props/methods related to our Authentication capability
    // Am I using object destructuring here ?
    let chadContext = useAuth0();
    console.warn("chadContext:", chadContext);
    const { isAuthenticated, loginWithRedirect, logout } = chadContext;

    return (
        <Navbar bg="light">
            {/* 1st Nav item, mr-auto pushes the 2nd Nav item to the right */}
            {/* prettier-ignore */}
            <Nav className="mr-auto">
            <Nav.Item><Nav.Link as={Link} to="/">Home</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link as={Link} to="/page1">Page1 (Unprotected)</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link as={Link} to="/page2">Page2 (Protected Content)</Nav.Link></Nav.Item>
        </Nav>
            {/* 2nd Nav item, gets pushed to right because of mr-auto on first item */}
            <Nav>Status: {isAuthenticated ? "Authenticated" : "Not Authenticated"}</Nav>
            <Nav className="ml-3">
                {!isAuthenticated && <button onClick={() => loginWithRedirect({})}>Log in</button>}
                <button onClick={() => logout()}>Log out</button>
            </Nav>
        </Navbar>
    );
};

export default NavBarFn;
