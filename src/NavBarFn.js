import React from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";

// Custom Hook
import { useAuth0 } from "./react-auth0-spa";

const NavBarFn = () => {
  // useContext() to get access to global props/methods
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const isAuthenticatedStatus = isAuthenticated ? "Authenticated" : "Not Authenticated";

  return (
    <Navbar bg="light">
      {/* 1st Nav item, mr-auto pushes the 2nd Nav item to the right */}
      <Nav className="mr-auto">
        <Nav.Item>
          <Nav.Link as={Link} to="/">
            Home
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={Link} to="/about">
            About
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={Link} to="/users">
            Users
          </Nav.Link>
        </Nav.Item>
      </Nav>
      {/* 2nd Nav item, gets pushed to right because of mr-auto on first item */}
      <Nav>Status: {isAuthenticatedStatus}</Nav>
      <Nav className="ml-3">
        {!isAuthenticated && <button onClick={() => loginWithRedirect({})}>Log in</button>}
        {isAuthenticated && <button onClick={() => logout()}>Log out</button>}
      </Nav>
    </Navbar>
  );
};

export default NavBarFn;
