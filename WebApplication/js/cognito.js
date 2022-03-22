var bearer;

var poolData = {
    UserPoolId: _config.cognito.UserPoolId,
    ClientId: _config.cognito.UserPoolClientId
};

var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

var cognitoUser;

//functions
function login(event){

    event.preventDefault();
    var username = document.getElementById("emailInputSignin").value;
    var authenticationData = {
        Username: username,
        Password: document.getElementById("passwordInputSignin").value
    };
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

    var userData = {
        Username : username,
        Pool : userPool
    };
    cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            console.log(result);
            var accessToken = result.getAccessToken().getJwtToken();
            console.log('Authentication successful', accessToken);
            window.location = './dashboard.html';
        },

        onFailure: function(err) {
            console.log('failed to authenticate');
            console.log(JSON.stringify(err));
            alert(err.message);
        },

        mfaRequired: function(codeDeliveryDetails) {
            // MFA is required to complete user authentication.
            // Get the code from user and call
            cognitoUser.sendMFACode(mfaCode, this)
        },

        newPasswordRequired: function(userAttributes, requiredAttributes) {
            location.href="./login.html#modal-2"
        }
    });
}

//required password reset
function resetPasswordRequired(event) {
    event.preventDefault();
    var newPassword = document.getElementById("passwordReset").value;
    console.log("New password:" + newPassword);
    cognitoUser.completeNewPasswordChallenge(newPassword, null, {
        onSuccess: function (result) {
            console.log(result);
            var accessToken = result.getAccessToken().getJwtToken();
            console.log('Authentication successful', accessToken);
            window.location = './dashboard.html';
        },
        onFailure: function(err) {
            console.log(JSON.stringify(err));
            alert(err.message);
        },
    });
};


//Check User
function checkLogin(){
    cognitoUser = userPool.getCurrentUser();
    if (cognitoUser != null) {
        console.log('user exists');
        cognitoUser.getSession(function(err, session) {
            if (err) {
               console.log("Session expired...");
               window.location = './login.html';
            }
            else console.log("Session refreshed" + session); bearer = localStorage.getItem('CognitoIdentityServiceProvider.' + _config.cognito.UserPoolClientId + '.' + userPool.getCurrentUser().username + '.idToken');
        });
    }
    else {
        window.location = './login.html';
    }
}

function getJWTToken(){
    var cognitoUser = userPool.getCurrentUser();
    if (cognitoUser != null) {
        cognitoUser.getSession(function(err, session) {
            if (session) { return session.getIdToken().getJwtToken() }
        });
    }
}

//change password
function changePassword(event) {
    //var cognitoUser = userPool.getCurrentUser();
    console.log(cognitoUser);
    event.preventDefault();
    var oldPassword = document.getElementById("oldPassword").value;
    var newPassword = document.getElementById("newPassword").value;
    cognitoUser.changePassword(oldPassword, newPassword, function(err, data) {
        if (err) { console.log(err, err.stack); alert(err.message); }// an error occurred
        else { console.log(data); alert("Password changed!"); window.location = './settings.html'  }         // successful response
    });
}

//signing out
function logOut() {
    var cognitoUser = userPool.getCurrentUser();
    console.log(cognitoUser, 'signing out...');
    cognitoUser.signOut();
    window.location = './login.html';
}

if (!window.location.pathname.match('/login.html')) {
    checkLogin();
}

//setup Cognito Identity Credentials
AWS.config.region = _config.cognito.region;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: _config.cognito.IdentityPoolId,
    Logins: {
        [_config.cognito.Logins]: bearer
    }
});
//Logout form submit
//const form = document.getElementById('signoutButton');
//form.addEventListener('submit', logOut);


