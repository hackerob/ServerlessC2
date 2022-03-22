var s3 = new AWS.S3();
var apigateway = new AWS.APIGateway();

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
            console.log(dataBody);
            var edited = dataBody.replace('AWS_URL_LISTENER_HERE',listener)
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
    var payloadHTML = document.getElementById('payload');
    //this will need to be sanitized OR only allow admins to upload templates
    payloadHTML.innerHTML = data
    hljs.highlightAll();
}

function populateOptions(data) {
    console.log(data.Contents);
    for (var result in data.Contents) {
        var filename = document.getElementById("selectedPayload");
        var option = document.createElement('option')
        option.innerHTML = data.Contents[result].Key;
        filename.appendChild(option);
    }
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

const selectPayloadHTML = document.getElementById('loadPayload');
selectPayloadHTML.onclick = function(){getObject()};

const downloadPayloadHTML = document.getElementById('downloadPayload');
downloadPayloadHTML.onclick = function(){getObject("download")};


//populate select payload dropdown
listObjects();

listListeners();
