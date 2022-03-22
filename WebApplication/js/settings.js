
var table = document.getElementById('usersTable');
//Implant Table Fill (need to update the variables here to reflect the admin page)
function populateTable(tableData, role) {
    //table.innerHTML = '';
    for (let data in tableData.Users) {
        let value = tableData.Users[data];
        console.log(value.Username);
        console.log(data);
        let row = table.insertRow(-1);
        //usersName
        let usersName = row.insertCell(0);
        usersName.innerHTML = basicHTMLEncode(value.Username);
        let userEnabled = row.insertCell(1);
        userEnabled.innerHTML = basicHTMLEncode(value.Enabled);          
        let userStatus = row.insertCell(2);
        userStatus.innerHTML = basicHTMLEncode(value.UserStatus);
        let userGroup = row.insertCell(3);
        userGroup.innerHTML = '';

        let userActions = row.insertCell(4);
        //Setting up all the action buttons - make buttons refresh slower
        //enable vs disable
        if (value.Enabled) {
            var statusButton = '<button class="btn btn-square btn-secondary rounded-circle" data-toggle="tooltip" data-title="Disable User" type="button" onclick=disableUser("' + basicHTMLEncode(value.Username) + '");>&#128721;</button>'
            var deleteButton = '<button disabled class="btn btn-square btn-danger rounded-circle" data-toggle="tooltip" data-title="Disable user before deleting!" type="button" onclick=deleteUser("' + basicHTMLEncode(value.Username) + '");location.reload();>&#10006;</button>'
        }
        else {
            var statusButton = '<button class="btn btn-square btn-success rounded-circle" data-toggle="tooltip" data-title="Enable User" type="button" onclick=enableUser("' + basicHTMLEncode(value.Username) + '");>&#10004;</button>'
            var deleteButton = '<button class="btn btn-square btn-danger rounded-circle" data-toggle="tooltip" data-title="Delete User" type="button" onclick=deleteUser("' + basicHTMLEncode(value.Username) + '");>&#10006;</button>'
        }
        //make admin vs remove admin
        var makeAdminButton = '<button class="btn btn-square btn-primary rounded-circle" data-toggle="tooltip" data-title="Make Admin" type="button" onclick=makeAdmin("' + basicHTMLEncode(value.Username) + '");>&#9819;</button>';
        var removeAdminButton = '<button class="btn btn-square color-blue rounded-circle" data-toggle="tooltip" data-title="Remove Admin" type="button" onclick=removeAdmin("' + basicHTMLEncode(value.Username) + '");>&#9817;</button>';
        var resetButton = '<button class="btn btn-square btn-primary rounded-circle" data-toggle="tooltip" data-title="Reset Password" type="button" onclick=resetPassword("' + basicHTMLEncode(value.Username) + '");>&#8635;</button>';
        var spacer = '&nbsp;'
        userActions.innerHTML = makeAdminButton + spacer + removeAdminButton + spacer + resetButton + spacer + statusButton + spacer + deleteButton
        /*basicHTMLEncode(value.public_ip_source);  */
    }
    listAdminUsers();
}
function editTableAdmins(tableData) {
    for (let data in tableData.Users) {
        let value = tableData.Users[data];
        console.log(table.length);
        for (var i=0;i<table.rows.length;i++) {
            console.log(table.rows[i].cells[0].innerHTML)
            if (table.rows[i].cells[0].innerHTML == basicHTMLEncode(value.Username)) {
                table.rows[i].cells[3].innerHTML = basicHTMLEncode("Admin");
            }
        }

    }
}

listUsers();

const change_password = document.getElementById('change-password');
change_password.addEventListener('submit', changePassword);
