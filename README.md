# Background

This is a relatively basic (but complete) implementation of a React Single Page Application with User Authentication.

-   React for the SPA (single-page application) framework
-   Boostrap <a href="https://react-bootstrap.github.io/components/alerts">(react-bootstrap)</a> for the visual styling
-   Integration with Auth0 for user creation and authentication
-   <a href="https://github.com/auth0/auth0-spa-js/">auth0-spa-js</a> which is Auth0's authentication framework for SPA with PKCE
-   Auth0 integration uses <a href="https://auth0.com/docs/api-auth/tutorials/adoption/authorization-code">Authorization Code grant with PKCE</a> for Single Page Apps
-   Additional pop-up modal by me to display errors from Auth0 (e.g. unverified email account)
-   Additional error handling by me (e.g. try/catch for 401's from Auth0)

# History

This started as the 3rd part of my 2nd attempt at using Auth0 for user authentication in a React app. The goals of this POC was to use my existing Auth0 configuration, with the addition of manual admin approval required for new accounts. I essentially followed this suggestion\: https://community.auth0.com/t/how-to-prevent-logging-in-until-admin-approval/9340/2

I built this POC using:

-   React
-   Bootstrap (via react-bootstrap, not reactstrap)
-   Auth0 (via @auth0/auth0-spa-js)

To start, I copied this repo: https://github.com/cburkins/poc-react-reactBootstrap-auth0

From there, did the following:

-   Added popup bootstrap modal to share error message from Auth0 (e.g. "Your registration must be approved by an administrator")
-   Added "useEffect()" to sense the error within the callback URL params
-   Added 2nd "useEffect()" that waits for the modal to be dismissed, waits for Auth0 lib to be loaded, then forces a logout (so the user doesn't use cached cookie for next login attempt)

![image](https://user-images.githubusercontent.com/9342308/71648873-e0d70480-2cd7-11ea-8295-0f0ad4c3d711.png)

### Deployment Step 1 (Basic User Creation & Login/Logout)

1. Clone this repo
1. Install all dependencies via `npm install`
1. Create Auth0 application (via their portal)
    - `Name:` can be anything you'd like, just a convenience thing
    - Application Type should be "Single Page Web Application"
    - `Allowed Callback URLs`, add `http://localhost:3000`
    - `Allowed Logout URLs`, add `http://localhost:3000`
    - `Allowed Web Origins`, add `http://localhost:3000`
1. Create a file called
1. Copy "client_id" and "domain" into `src/auth_config.json`, should look like this:
    ```
    {
        "domain": "dev-8snzgxfi.auth0.com",
        "clientId": "5XF0vALgtkN6t1Z3KJTChqyaCQiQ94Tm"
    }
    ```
1. Start app locally on port 3000 via `npm start`
1. Click "Login" and create new user
1. Click "Login" and confirm success (ie.g. "Status: Authenticated" in app header)
1. Optional: set "Application Type:" to "Single Page Application" which removes the option of using grant type of "Passwordless OTP"

### Deployment Step 2 (Only verified email addresses)

1. Go to Auth0 Portal
1. Click on "Auth Pipeline->Rules"
1. Click on "Create Rule", then "Force email verification"

    NOTE: This is pre-configured rule from Auth0, but for reference, it looks like this:

    ```javascript
    function (user, context, callback) {
      if (!user.email_verified) {
        return callback(new UnauthorizedError('Please verify your email before logging in.'));
      } else {
        return callback(null, user, context);
      }
    }
    ```

1. Confirm that Login/Logout fails and displays error Modal now (assuming your email address is **unverified**)
1. Check your email address to approve email address
1. Confirm that Login/Lougout works now

### Deployment Step 3 (Only Approved Users)

1. Go back to Auth0 Portal/Rules
1. Click on "Create Rule"
1. Click on "Empty Rule"
1. Name: Allow only approved users
1. Script: (see below)

    ```javascript
    function (user, context, callback) {
    if (user.app_metadata && user.app_metadata.approved) {
        // user has been approved
        return callback(null, user, context);
    }
    // anything else is false (user not approved)
    return callback(new UnauthorizedError('Your account must be approved by an administrator.'));
    }
    ```

1. Verify that Login/Logout is failing again (with modal popup)
1. Approve User via Auth0 Portal
    - Edit user in Portal
    - Within "app_metadata":
        ```json
        {
            "approved": true
        }
        ```
1. Verify that Login/Logout works again

### Appendix: Troubleshooting 401/Unauthorized in Authorization Code grant (Defect)

NOTE: This was an Auth0 defect that I discovered in June 2020, and was fixed in Oct 2020, and therefore is **no longer relevant** (removed from directions above)

Defect Description: User login works fine, receiving "code" from login works fine, the problem is when you try to send in your "code" to /oath/token to receive a "token" in return. For some strange reason, you get a 401/Unauthorized

#### `The Short Version`

This was the shortest way to work around the bug I discovered in Auth0's configuration, which I reported here: https://community.auth0.com/t/401-unauthorized-when-obtaining-token-in-authorization-code-grant/44685/2

1. Create new Auth0 tenant (which creates "Default App")
1. Within default app, fill in "http://localhost:3000" to the following:
    - "Callback URL", "Allowed Origins", "Logout URL"
1. Change "Application Type" to "Regular Web Application"
1. Change "Token Endpoint Authentication" to "None"
1. Confirm modal "... will disable the Client Credentials grant for.."
1. Save

#### `The Original Journey of Discovery`

This was the long version for working around the same defect as above. This is superflous, simply documentation of the original journey I took to discover the correct way to configure my Auth0 Application for SPA using PKCE.

1.  Create new Auth0 tenant (which creates "Default App")
1.  Within default app, fill in "http://localhost:3000" to the following:
    -   "Callback URL", "Allowed Origins", "Logout URL"
1.  Veryify default settings and test login within SPA:
    -   Application Type: is set to "Select an application type"
    -   Token Endpoint Authentication Method: field is inactive (greyed out) and set to "Post"
    -   Advanced Setting->Grant Types: The following are checked (and unable to be changed): Implicit, Authorization Code, Refresh Token, Client Credentials
1.  When using "Authorization Code" flow within a SPA using Auth0 Quickstart example
    -   new user: User creation works fine
    -   code: Obtaining "code" works fine
    -   token failure: When you exchange "code" for "token" via /oauth/token endpoint, you get a 401/Unauthorized
1.  SPA: Changing "Application Type" from "Select an application type" to "Single Page Application"
    -   "Token Endpoint Authentication Method" remains grayed out, and set to "Post"
    -   Within Advanced Setting->Grant Types:
        -   "Client Credentials" is now grayed out, but still checked.
        -   Implicit, Authorization Code, and Refresh Token remain checked.
    -   code: Obtaining "code" works fine
    -   token failure: When you exchange "code" for "token" via /oauth/token endpoint, you get a 401/Unauthorized
1.  Native: Changing "Application Type" from "Single Page Application" to "Native"
    -   "Token Endpoint Authentication Method" remains grayed out, and set to "Post"
    -   Within Advanced Setting->Grant Types:
        -   "Client Credentials" is now grayed out, but still checked.
        -   Implicit, Authorization Code, and Refresh Token remain checked.
    -   code: Obtaining "code" works fine
    -   token failure: When you exchange "code" for "token" via /oauth/token endpoint, you get a 401/Unauthorized
1.  Regular Web Application: Changing "Application Type" from "Native" to "Regular Web Application"
    -   "Token Endpoint Authentication Method" field is now active (not greyed out), and set to "Post"
    -   Advanced Settings->Grant Types: Implicit, Authorization Code, Refresh Token, and Client Credentials are checked
    -   code: Obtaining "code" works fine
    -   token failure: When you exchange "code" for "token" via /oauth/token endpoint, you get a 401/Unauthorized
1.  SPA: Changing "Application Type" from "Regular Web Application" to "Single Page Application"
    -   Receive modal saying "Changing the Application Type from Regular Web Application to Single Page Application will disable the Client Credentials grant for this application"
    -   Clicked on "confirm"
    -   "Token Endpoint Authentication Method" is now grayed out, and set to "None"
    -   Advanced Settings->Grant Types:
        -   Implicit, Authorization Code, and Refresh Token are now checked.
        -   Client Credentials is grayed out, and not checked
    -   Still successfully get "code" when you login
    -   Now get a 200/OK when exchanging code for token at /oauth/token
