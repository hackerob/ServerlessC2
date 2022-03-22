var cognito = new AWS.CognitoIdentityServiceProvider({apiVersion: '2016-04-18'});

//list users
function listUsers() {
    var params = {
        UserPoolId: _config.cognito.UserPoolId
    };
    cognito.listUsers(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);  populateTable(data);         // successful response
    });

}

//list admin users
function listAdminUsers() {
    //list users in Admins group
    const cognitoParams = {
        UserPoolId: _config.cognito.UserPoolId,
        GroupName: "Admins"
    };
    cognito.listUsersInGroup(cognitoParams, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);   editTableAdmins(data);//populateTable(data, cognitoParams.GroupName);        // successful response
    });
}

//create User
function createUser(event) {
    var cognitoUser = userPool.getCurrentUser();
    console.log(cognitoUser);
    event.preventDefault();
    var EMAIL = document.getElementById("emailInputSignin").value;
    var password = document.getElementById("passwordInputSignin").value;
    const cognitoParams = {
        UserPoolId: _config.cognito.UserPoolId,
        Username: EMAIL,
        UserAttributes: [{
            Name: "email",
            Value: EMAIL,
        },
        {
            Name: "email_verified",
            Value: "true",
        },
        ],
        TemporaryPassword: password,
    };
    cognito.adminCreateUser(cognitoParams, function(err, data) {
        if (err) { console.log(err, err.stack); alert(err); }// an error occurred
        else { console.log(data); window.location.href = './settings.html';  }         // successful response
    });
}

//adminEnableUser
function enableUser(EMAIL) {
    const cognitoParams = {
        UserPoolId: _config.cognito.UserPoolId,
        Username: EMAIL,
    };
    cognito.adminEnableUser(cognitoParams, function(err, data) {
        if (err) { console.log(err, err.stack); alert(err); }// an error occurred
        else     console.log(data); location.reload();      // successful response
    });
}

//adminDisableUser
function disableUser(EMAIL) {
    const cognitoParams = {
        UserPoolId: _config.cognito.UserPoolId,
        Username: EMAIL,
    };
    cognito.adminDisableUser(cognitoParams, function(err, data) {
        if (err) { console.log(err, err.stack); alert(err); }// an error occurred
        else     console.log(data); location.reload();       // successful response
    });
}

//adminDeleteUser
function deleteUser(EMAIL) {
    const cognitoParams = {
        UserPoolId: _config.cognito.UserPoolId,
        Username: EMAIL,
    };
    cognito.adminDeleteUser(cognitoParams, function(err, data) {
        if (err) { console.log(err, err.stack); alert(err); }// an error occurred
        else     console.log(data); location.reload();        // successful response
    });
}

//adminConfirmSignUp



//adminResetUserPassword
function resetPassword(EMAIL) {
    const cognitoParams = {
        UserPoolId: _config.cognito.UserPoolId,
        Username: EMAIL
    };
    cognito.adminResetUserPassword(cognitoParams, function(err, data) {
        if (err) { console.log(err, err.stack); alert(err); }// an error occurred
        else     console.log(data); location.reload();        // successful response
    });
}


//adminAddUserToGroup
function makeAdmin(EMAIL) {
    const cognitoParams = {
        UserPoolId: _config.cognito.UserPoolId,
        Username: EMAIL,
        GroupName: "Admins"
    };
    cognito.adminAddUserToGroup(cognitoParams, function(err, data) {
        if (err) { console.log(err, err.stack); alert(err); }// an error occurred
        else     console.log(data); location.reload();        // successful response
    });
}

//adminRemoveUserFromGroup
function removeAdmin(EMAIL) {
    const cognitoParams = {
        UserPoolId: _config.cognito.UserPoolId,
        Username: EMAIL,
        GroupName: "Admins"
    };
    cognito.adminRemoveUserFromGroup(cognitoParams, function(err, data) {
        if (err) { console.log(err, err.stack); alert(err); }// an error occurred
        else     console.log(data); location.reload();        // successful response
    });
}


//Create User Form submit
const create_user = document.getElementById('create-user');
create_user.addEventListener('submit', createUser);
