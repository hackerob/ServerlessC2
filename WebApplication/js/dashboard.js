//Setting some global HTML variables
var table = document.getElementById('dashboardTable');

//Implant Table Fill
function populateTable(tableData) {
    table.innerHTML = '';
    tableData.sort(function(a, b) {
        return b.heartbeat - a.heartbeat;
    });
    for (let data in tableData) {
        let value = tableData[data];
        //make some conditional here that if data is so old then we just go ahead and either skip or hide the row
        if (value.heartbeat < (Date.now()-604800000)) {
            console.log("you old");
            continue
        }
        let row = table.insertRow(-1);
        let HostID = row.insertCell(0);
        HostID.innerHTML = "<a href=implant.html?hostid=" + basicHTMLEncode(value.hostid) + ">" + basicHTMLEncode(value.hostid) + "</a>";

        let Birthtime = row.insertCell(1);
        Birthtime.innerHTML = epoch2human(basicHTMLEncode(value.birthtime));

        let Heartbeat = row.insertCell(2);
        Heartbeat.innerHTML = epoch2human(basicHTMLEncode(value.heartbeat));

        let SourceIP = row.insertCell(3);
        SourceIP.innerHTML = basicHTMLEncode(value.public_ip_source);
    }
}


async function getdashboardJSON() {
    const responseObject = await fetch(_config.api.ManagementUrl, {
        "headers": {
            "Authorization": bearer,
            "Content-Type": "application/json",
            "accept": "application/json",
        },
        "body": null,
        "method": "GET",
        "withCredentials": true,
        "mode": "cors"
    })
    const responseJSON = await responseObject.json()
    populateTable(responseJSON);
}

getdashboardJSON();
