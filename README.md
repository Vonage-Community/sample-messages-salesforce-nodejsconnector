# sample-messages-salesforce-nodejsconnector


## Integration WhatsApp and SMS into SalesForce using Vonage Messages API in NodeJS

In this repository, you will find the backend connector that connects the Vonage Messaging API to the Salesforce APIs to push data back into the custom objects. it works hand in hand with its UI component which can be found here:
https://github.com/marc-marchaldecorny/vonage4salesforce-lightningcomponent

# Creating the Vonage API account:
Vonage is a leading global CPaaS player that offers B2C communication channels over API. These include SMS and WhatsApp!
If you already have an account, you can login here : https://dashboard.nexmo.com/ and follow the instructions.
If you don't have an account, you can create one in less than 1 minute and start sending SMS, WhatsApp immediately :
https://dashboard.nexmo.com/sign-up

# Configuring your salesforce instance:
If you are here, it means that you are using Salesforce! If you are not you can get a developer account for free following the instructions below:
https://developer.salesforce.com/signup


you will need to create API credentials for Salesforce so that this NodeJS script can push data into it.
Please follow the steps
1. Create connected APP : https://help.salesforce.com/s/articleView?id=sf.connected_app_create.htm&type=5
In the step above after creating the Connected App, you will be able to view the following two variables that you will use later:
- SFDC_CONSUMER_KEY
- SFDC_CONSUMER_SECRET
2. Create a dedicated user : https://help.salesforce.com/s/articleView?language=en_US&type=5&id=adding_new_users.htm
In the step above after creating the user, you will be able to view the following two variables that you will use later:
- SFDC_USERNAME
- SFDC_PASSWORD

# Deploying the nodeJS code:
Chose your favourite hosting environement to deploy the nodeJS code. just remember to add the following environemnt variables to complete the deployment.

- SFDC_CONSUMER_KEY
- SFDC_CONSUMER_SECRET
- SFDC_USERNAME
- SFDC_PASSWORD
- SFDC_CALLBACK_URI - not needed 

Gather the URLS of your deployed service.

# Configure the Vonage API dashboard.
connect to the portal : https://dashboard.nexmo.com/
chose your API key in the left menu
create an application for the integration: https://dashboard.nexmo.com/applications
configure the Call back URLs under the application as follows:
- INBOUND URL : https://yourhostingservice/webhook/inbound
- EVENT URL : https://yourhostingservice/webhook/event

this will also work for the sandbox !
https://dashboard.nexmo.com/messages/sandbox

your ready to receive SMSs and WhatsApp straight into Salesforce with Vonage API
