import React, { useState, useEffect } from "react";

import { HashRouter, Switch, Route } from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";

// Custom Hook
import { useAuth0 } from "./react-auth0-spa";

export default function App() {
  // useContext() to get access to global props/methods
  const { isAuthenticated, loginWithRedirect, logout, loading } = useAuth0();
  const isAuthenticatedStatus = isAuthenticated ? "Authenticated" : "Not Authenticated";

  const [modalShow, setModalShow] = useState(false);
  const [modalMessage, setModalMessage] = useState("Modal Message Placeholder");
  const [modalTitle, setModalTitle] = useState("Modal Title Placeholder");
  const [forceLogout, setForceLogout] = useState(false);

  // React Hook, useEffect() runs after first render, and after every re-render (DOM update)
  // Essentially a "side effect" sort of like componentDidMount, componentDidUpdate, and componentWillUnmount combined
  // 2nd arg (array) is empty, so this fn is called every time it's re-rendered
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("error")) {
      console.error("Error from Auth0");
      console.log(`All URL Query Params: ${window.location.search}`);
      const keys = urlParams.keys();
      for (const key of keys) {
        console.log(`   key:${key}, value:${urlParams.get(key)}`);
      }
      // Set title and message for Modal
      setModalTitle(urlParams.get("error"));
      setModalMessage(urlParams.get("error_description"));
      // Turn on modal so it pops up
      setModalShow(true);

      // Clear all the query params from the URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // As a courtesy, truly logout the user since they got error, will allow them to login again
      // Otherwise, it seems to keep using the same cached login, and giving the same error
      // logout();
      setForceLogout(true);
    }
  }, []);

  // Runs every time "loading" status changes.
  // When "forceLogout" is set, forces logout (assuming Auth0 is finished loading, and user closed error modal)
  useEffect(() => {
    if (forceLogout && !loading && !modalShow) {
      console.log("Forcing Logout (so user is forced to use password dialog on next login attempt rather than cached cookie");
      logout();
      setForceLogout(false);
    }
  }, [loading, logout, forceLogout, modalShow]);

  // Use custom hook, essentially grabs the "loading" via useContext()
  // loading=true means that we are still waiting to get our authentication state from Auth0
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

      {/* Create a modal, but it's likely supressed (hidden) until show variable changes to true */}
      <ModalFn show={modalShow} onHide={() => setModalShow(false)} message={modalMessage} title={modalTitle} />
    </div>
  );
}

function ModalFn({ message, title, ...restOfProps }) {
  // By default, "props" object is passed in, and we destructure to extract "message" and "title" properties
  return (
    <Modal {...restOfProps}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={restOfProps.onHide}>
          Close &amp; Logout
        </Button>
      </Modal.Footer>
    </Modal>
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
