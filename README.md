# Background

This is the 3rd part of my 2nd attempt at using Auth0 for user authentication in a React app. The goals of this POC was to use my existing Auth0 configuration, with the addition of manual admin approval required for new accounts

I essentially followed this suggestion\: https://community.auth0.com/t/how-to-prevent-logging-in-until-admin-approval/9340/2

I built this POC using:

- React
- Bootstrap (via react-bootstrap, not reactstrap)
- Auth0 (via @auth0/auth0-spa-js)

To start, I copied this repo: https://github.com/cburkins/poc-react-reactBootstrap-auth0

From there, did the following:

- Added popup bootstrap modal to share error message from Auth0 (e.g. "Your registration must be approved by an administrator")
- Added "useEffect()" to sense the error within the callback URL params
- Added 2nd "useEffect()" that waits for the modal to be dismissed, waits for Auth0 lib to be loaded, then forces a logout (so the user doesn't use cached cookie for next login attempt)

![image](https://user-images.githubusercontent.com/9342308/71648873-e0d70480-2cd7-11ea-8295-0f0ad4c3d711.png)

### Deployment

1. Create Auth0 application (via their portal)
2. From that application, put "client_id" and "domain" into auth_config.json
3. Create Auth0 rule to allow only Approved Users (see below)
4. Manually Approve User (see below)

##### Create Auth0 rule to allow only Approved Users

- Go to Auth0 Portal
- navigate to "Rules"
- Click on "Create Rule"
- Click on "Empty Rule"
- Name: Allow only approved users
- Script: (see below)

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

##### Manually approve an Auth0 user

- Go to Auth0 Portal
- navigate to user&roles->users
- On correct user, selecte menu (three dots) and "Details"
- Within <b>app_metatdata</b> (not user_metadata)

("false" or blank or mis-spelled will result in user denial)

```json
{
  "approved": true
}
```
