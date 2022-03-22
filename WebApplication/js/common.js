//set dark mode
document.body.classList.add("dark-mode");

//basic HTML encoding
function basicHTMLEncode(str) {
    if(str && typeof str === 'string') {
        //replace bad characters, this small list of 5 was taken from OWASP
        str = str.replace(/&/g, '&amp');
        str = str.replace(/</g, '&lt');
        str = str.replace(/>/g, '&gt');
        str = str.replace(/"/g, '&quot');
        str = str.replace(/'/g, '&#x27');
    }
    return str;
}

//epoch to human time
function epoch2human(timestamp) {
    try { timestamp = timestamp.replace("T_","") }
    finally {
        var myDate = new Date( timestamp *1);
        return myDate.toLocaleString();
    }
}