import React from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";

// Custom Hook
// When we call "useContextAuth0()" below, essentially calls useContext(Auth0Context)
import { useContextAuth0 } from "./react-auth0-spa";

const NavBarFn = () => {
    // Calls useContext() to get access to global props/methods related to our Authentication capability
    // Then use object destructuring to select item I need from the provided context
    const { isAuthenticated, loginWithRedirect, logout } = useContextAuth0();

    // Create Navbar at top of page with Navigation Links, Login Buton, Logout Button
    // Login button calls auth0Client.loginWithRedirect()
    // In reading over that code, it is essentially just calling window.location.assign(url)
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
