import boto3
import os
import random
import string
import time
import re
import argparse
import sys
import json

#Authenticate
session = boto3.Session()

#Set up boto3 global variables
s3 = session.client('s3')
cloudformation = session.client('cloudformation', 'us-east-1')

#S3 Bucket Functions
def upload_deployment_bucket():
    random_string = ''.join(random.choices(string.digits + string.ascii_lowercase, k=10))
    newbucket = 'serverless-c2-deployment-' + random_string
    response = s3.create_bucket(Bucket=newbucket)
    print("Created new deployment bucket: " + response["Location"])

    lambdadirectory = './CloudDeploy/LambdaFunctions/'
    for filename in os.listdir(lambdadirectory):
        filenamepath = os.path.join(lambdadirectory, filename)
        try:
            response = s3.upload_file(filenamepath, newbucket, filename)
        except ClientError as e:
            logging.error(e)
            return False
    try:
        response = s3.upload_file('./CloudDeploy/c2-deployment.yaml', newbucket, 'c2-deployment.yaml')
        response = s3.upload_file('./CloudDeploy/webapp-deployment.yaml', newbucket, 'webapp-deployment.yaml')
    except ClientError as e:
        logging.error(e)
        return False   
    return newbucket

def upload_payload_bucket(newbucket):
    response = s3.create_bucket(Bucket=newbucket)
    print("Created new payload bucket: " + response["Location"])

    #CORS
    cors_configuration = {
        'CORSRules': [{
            'AllowedHeaders': ['*'],
            'AllowedMethods': ['GET', 'HEAD'],
            'AllowedOrigins': ['*'],
            'ExposeHeaders': []
        }]
    }
    s3.put_bucket_cors(Bucket=newbucket, CORSConfiguration=cors_configuration)

    lambdadirectory = './CloudDeploy/Payloads/'
    for filename in os.listdir(lambdadirectory):
        filenamepath = os.path.join(lambdadirectory, filename)
        try:
            response = s3.upload_file(filenamepath, newbucket, filename)
        except ClientError as e:
            logging.error(e)
            return False 
    return True

def uploadto_webappbucket(webapp_bucket):
    webappdirectory = './WebApplication/'
    for r, d, f in os.walk(webappdirectory):
        for file in f:
            filenamepath = os.path.join(r, file)
            newfile = filenamepath.replace(webappdirectory, '')
            fixslashes = newfile.replace('\\','/')
            try:
                if (file.split('.')[-1] == "html"):
                    response = s3.upload_file(filenamepath, webapp_bucket, fixslashes, ExtraArgs={'ContentType': 'text/html'})
                elif (file.split('.')[-1] == "css"):
                    response = s3.upload_file(filenamepath, webapp_bucket, fixslashes, ExtraArgs={'ContentType': 'text/css'})
                elif (file.split('.')[-1] == "js"):
                    response = s3.upload_file(filenamepath, webapp_bucket, fixslashes, ExtraArgs={'ContentType': 'text/javascript;charset=UTF-8'})
                else:
                    response = s3.upload_file(filenamepath, webapp_bucket, fixslashes)
            except:
                a = 'b'
            #except ClientError as e:
            #    logging.error(e)
            #    return False

def delete_bucket(bucketname):
    try:
        response = s3.list_objects_v2(Bucket=bucketname)
        if 'Contents' in response:
            for item in response['Contents']:
                s3.delete_object(Bucket=bucketname, Key=item['Key'])
        response2 = s3.delete_bucket(Bucket=bucketname)
        print("Deleted bucket: " + bucketname)
    except:
        print("Failed deleting bucket (it may not exist).")
        return False

#Cloudformation functions
def cloudformation_deploy(newbucketname, payloadbucketname, email):
    response = cloudformation.create_stack(
        StackName=newbucketname,
        TemplateURL='https://' + newbucketname + '.s3.amazonaws.com/c2-deployment.yaml',
        Parameters=[
            {
                'ParameterKey': 'UserEmail',
                'ParameterValue': email
            },            {
                'ParameterKey': 'DeploymentBucket',
                'ParameterValue': newbucketname
            },            {
                'ParameterKey': 'PayloadBucket',
                'ParameterValue': payloadbucketname
            },
        ],
        Capabilities=[
            'CAPABILITY_NAMED_IAM',
        ],
    )

def cloudformation_webapp_deploy(deploymentbucket, webappbucket):
    response = cloudformation.create_stack(
        StackName=webappbucket,
        TemplateURL='https://' + deploymentbucket + '.s3.amazonaws.com/webapp-deployment.yaml',
        Parameters=[
            {
                'ParameterKey': 'BucketName',
                'ParameterValue': webappbucket,
            },
        ],
        Capabilities=[
            'CAPABILITY_NAMED_IAM',
        ],
    )

def cloudformation_getstatus(newbucketname):
    print("Checking status of the " + newbucketname + " cloudformation stack.")
    status = ""
    while status != "CREATE_COMPLETE":
        time.sleep(3)
        response = cloudformation.describe_stacks(StackName=newbucketname)
        status = response['Stacks'][0]['StackStatus']
        print("Status:" + status, end = "\r")
    print("Status Complete: " + status)

def cloudformation_getoutputs(newbucketname):
    response = cloudformation.describe_stacks(StackName=newbucketname)
    fin = open("./WebApplication/js/config.js", "rt")
    data = fin.read()
    outputs = response['Stacks'][0]['Outputs']
    for output in outputs:
        #print(output['OutputKey'] + ": '" + output['OutputValue'] + "',")
        outputkey  = output['OutputKey']
        outputvalue = output['OutputValue']
        data = re.sub(f"{outputkey}: '.*'", f"{outputkey}: '{outputvalue}'", data)
    deployment_ID = newbucketname.split("-")[-1]
    data = re.sub("DeploymentID: '.*'", f"DeploymentID: '{deployment_ID}'", data)
    fin.close()
    fin = open("./WebApplication/js/config.js", "wt")
    fin.write(data)
    fin.close()
    print("Updated the config.js file.")

def cloudformation_webapp_getoutputs(newbucketname):
    response = cloudformation.describe_stacks(StackName=newbucketname)
    outputs = response['Stacks'][0]['Outputs']
    return 'https://' + outputs[0]['OutputValue']

def cloudformation_delete(bucketname):
    response = cloudformation.delete_stack(
        StackName=bucketname
    )
    print("Sent Cloudformation Delete command!")

#Main Commands
def build_c2(email):
    newbucketname = upload_deployment_bucket()
    webapp_bucket = 'serverless-c2-webapp-' + newbucketname.split("-")[-1]
    payload_bucket = 'serverless-c2-payloads-' + newbucketname.split("-")[-1]
    upload_payload_bucket(payload_bucket)
    cloudformation_webapp_deploy(newbucketname, webapp_bucket)
    cloudformation_deploy(newbucketname, payload_bucket email)
    cloudformation_getstatus(newbucketname)
    cloudformation_getoutputs(newbucketname)
    uploadto_webappbucket(webapp_bucket)
    cloudformation_getstatus(webapp_bucket)
    url = cloudformation_webapp_getoutputs(webapp_bucket)
    print(f"Serverless C2 has been deployed! Go to the following URL: {url}")

def destroy_c2(deploymentID):
    deployment_id = "serverless-c2-deployment-" + deploymentID.split("-")[-1]
    delete_bucket(deployment_id)
    payload_id = "serverless-c2-payloads-" + deploymentID.split("-")[-1]
    delete_bucket(payload_id)
    webapp_bucket = 'serverless-c2-webapp-' + deploymentID.split("-")[-1]
    delete_bucket(webapp_bucket)
    cloudformation_delete(webapp_bucket)
    cloudformation_delete(deployment_id)

def list_deployments():
    deployment_buckets = {}
    response = s3.list_buckets()
    for bucket in response['Buckets']:
        if bucket["Name"].startswith('serverless-c2-deployment-'):
            id = bucket['Name'].split("-")[-1]
            deployment_buckets[id] = {}
            deployment_buckets[id]['Deployment Bucket'] = bucket['Name']
            for other_bucket in response['Buckets']:
                if other_bucket['Name'] == f"serverless-c2-payloads-{id}":
                    deployment_buckets[id]['Payloads Bucket'] = f"serverless-c2-payloads-{id}"
                if other_bucket['Name'] == f"serverless-c2-webapp-{id}":
                    deployment_buckets[id]['Webapp Bucket'] = f"serverless-c2-webapp-{id}"
                    deployment_buckets[id]['Management URL'] = cloudformation_webapp_getoutputs(f'serverless-c2-webapp-{id}')
    print(json.dumps(deployment_buckets, indent=4))

def list_cloudformation_status():
    response = cloudformation.describe_stacks()
    for stack in response['Stacks']:
        print("Cloudformation Stack: " + stack['StackName'] + " - " + stack['StackStatus'])

def cloudformation_displayconfig(deployment_id):
    newbucketname = "serverless-c2-deployment-" + deployment_id.split("-")[-1]
    response = cloudformation.describe_stacks(StackName=newbucketname)
    fin = open("./WebApplication/js/config.js", "rt")
    data = fin.read()
    outputs = response['Stacks'][0]['Outputs']
    for output in outputs:
        outputkey  = output['OutputKey']
        outputvalue = output['OutputValue']
        data = re.sub(f"{outputkey}: '.*'", f"{outputkey}: '{outputvalue}'", data)
    data = re.sub("DeploymentID: '.*'", f"DeploymentID: '{deployment_id}'", data)
    fin.close()
    print(data)

help = ("Commands:\n"
        "Setup new ServerlessC2                 - build jim@gmail.com\n"
        "View Cloudformation config.js contents - config 1qa2ws3edf\n"
        "List ServerlessC2 Instances            - list\n"
        "View Cloudformation deployment status  - status\n"
        "Delete ServerlessC2 Instance           - destroy 1qa2ws3edf")

def main():
    if len(sys.argv) > 1:
        if sys.argv[1] == "build":
            if len(sys.argv) > 2:
                build_c2(sys.argv[2])
            else:
                print("Please specify email address!")
        elif sys.argv[1] == "config":
            if len(sys.argv) > 2:
                cloudformation_displayconfig(sys.argv[2])
            else:
                print("Please specify a deployment ID.")
        elif sys.argv[1] == "list":
            list_deployments()
        elif sys.argv[1] == "status":
            list_cloudformation_status()
        elif sys.argv[1] == "destroy":
            if len(sys.argv) > 2:
                destroy_c2(sys.argv[2])
            else:
                print("Please specify which deployment ID you would like to destroy.")
        else:
            print("Please specify a real command!\n" + help)
    else:
        print(help)

if __name__ == "__main__":
    main()
