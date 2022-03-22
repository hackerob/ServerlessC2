# Serverless C2:

Serverless C2 is a completely serverless command and control platform utilizing the AWS cloud. It gives pentesters, CTF players, and potentially even red teamers a cheap C2 platform designed with antivirus evasion in mind by limiting the amount of red flags the security products and teh blue team might see. The Serverless C2 implants are designed to be lightweight and instead of calling out to custom domains or IP addressess, simply call out to AWS API Gateway URL's making it harder for tools to distinguish the HTTPS traffic from normal HTTPS traffic. The Serverless C2 can be quickly deployed in your AWS cloud and will provide you a serverless team "server" where you can create payloads, manage implants, and invite team members all from the comfort of your own browser.


# Installation

It is recommended that you install Serverless C2 in it's own AWS account or at least not alongside other important AWS infrastructure.

1. From an AWS CloudShell session in us-east-1 run the following commands:
```
git clone https://github.com/hackerob/ServerlessC2.git
cd ServerlessC2
python3 CloudDeploy.py build jim@gmail.com
```
2. This will take a little under 5 minutes, but ya you have time to grab a coffee or beer!

3. When the Python script finishes, it should print out the URL to your new Serverless C2 instance. Navigate to the URL and login with the credentials that have been sent to your email.
