const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.json());

console.log("retrieve Environment Variables")
const SFDC_CONSUMER_KEY=process.env.SFDC_CONSUMER_KEY
const SFDC_CONSUMER_SECRET=process.env.SFDC_CONSUMER_SECRET
const SFDC_USERNAME=process.env.SFDC_USERNAME
const SFDC_PASSWORD=process.env.SFDC_PASSWORD
const SFDC_CALLBACK_URI=process.env.SFDC_CALLBACK_URI
console.log("SFDC_CONSUMER_KEY="+SFDC_CONSUMER_KEY)
console.log("SFDC_CONSUMER_SECRET="+SFDC_CONSUMER_SECRET)
console.log("SFDC_USERNAME="+SFDC_USERNAME)
console.log("SFDC_PASSWORD="+SFDC_PASSWORD)

var jsforce = require('jsforce');
var conn = new jsforce.Connection({
  oauth2 : {
    // you can change loginUrl to connect to sandbox or prerelease env.
    // loginUrl : 'https://test.salesforce.com',
    clientId : SFDC_CONSUMER_KEY,
    clientSecret : SFDC_CONSUMER_SECRET
  },
  logLevel:"DEBUG"
});


/*
app
  .route('/webhook/get')
  .post(handleGet)
*/
app
  .route('/webhook/inbound')
  .post(handleInboundMessage)


app
  .route('/webhook/event')
  .post(handleInboundEvent)

function handleInboundMessage(request, response) 
{
  // handle inbound message SMS and WhatsApp
  const params = Object.assign(request.query, request.body)
  console.log(params)

    conn.login(SFDC_USERNAME, SFDC_PASSWORD, async function(err, userInfo) {
    if (err) { return console.error(err); }
    // Now you can get the access token and instance URL information.
    // Save them to establish connection next time.
    console.log("accessToken: "+conn.accessToken);
    console.log("instanceUrl: "+conn.instanceUrl);
    console.log("Channel: "+params.channel);
     
    // check channel
    switch(params.channel )
    {
        case 'whatsapp':
            console.log('whatsapp channel');
            break;
        case 'sms':
                console.log('whatsapp channel');
                break;
        default :
            console.log('channel not supported');
            response.status(200).send({status: 0, message: "Channel not supported"})


    }
    // check message type and create response
    let msg_body = "";
    let error_msg = "";
    let msgResponse = await new Promise(resolve => {
        switch(params.message_type )
        {
            case 'text':
                console.log('text message');
                msg_body=params.text
                break;
            case 'image':
                console.log('image message');
                // default 
                msg_body="Image not Supported"
                // download image and convert to base64
                var request = require('request').defaults({ encoding: null });

                
                request.get(params.image.url, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
                        //console.log(data);
                        if(params.image.hasOwnProperty('caption')){
                            msg_body='<img alt="<image_Name>" src="'+data+'"></img>'
                        }
                        else{
                            msg_body=params.image.caption+'<br/><img alt="<image_Name>" src="'+data+'"></img>'
                        }
                        console.log("set image in base64");
                        resolve(true)
                    }
                    else
                    {
                        console.log("failed to download image");
                        error_msg = 'failed to download image';
                        resolve(false)
                    }
                });
                
                break;
            default :
                console.log('format not supported');
                error_msg = 'format not supported';
                resolve(false)
                


        }
    })
    // successful message input
    if(msgResponse == true )
    {

        // Create Message Object   
        messageObject = {
            "ContactPhoneNumber__c" : "+"+params.from,
            "BrandPhoneNumber__c" : "+"+params.to,
            "Channel__c" : params.channel,
            "Content__c" : msg_body,
            "Direction__c" : "in",
            "Date_Time__c" : params.timestamp,
            "VonageMsgId__c" : params.message_uuid,
            "LastMessageState__c" : "delivered"
        }
        console.log(messageObject)
        // create object inside salesforce
        conn.sobject("VonageMessagingHistory__c").create( messageObject , function(err, ret) {
            if (err || !ret.success) { return console.error(err, ret); }
            console.log("Created record id : " + ret.id);
            
        });
        response.status(200).send({status: 1, message: "success"})
    }
    else
    {
        response.status(200).send({status: 0, message: error_msg})
    }

  });



}

function handleInboundEvent(request, response) 
{
  // handle inbound message SMS and WhatsApp
  const params = Object.assign(request.query, request.body)
  console.log(params)

  conn.login(SFDC_USERNAME, SFDC_PASSWORD, function(err, userInfo) {
    if (err) { return console.error(err); }
    // Now you can get the access token and instance URL information.
    // Save them to establish connection next time.
    console.log("accessToken: "+conn.accessToken);
    console.log("instanceUrl: "+conn.instanceUrl);
       
    // "LastMessageState__c" => $messageState,"LastMessageStateTime__c" => $datetimenow

    // update object
    conn.sobject("VonageMessagingHistory__c").upsert({ 
        'VonageMsgId__c' : params.message_uuid,
        "LastMessageState__c" : params.status,
        "LastMessageStateTime__c" : params.timestamp,
      }, 'VonageMsgId__c', function(err, ret) {
        if (err || !ret.success) { return console.error(err, ret); }
        console.log('Updated Successfully : ' + ret.id);
        // ...
      });


  });

  response.status(204).send()
}
/*
function handleGet(request, response) 
{
  // handle inbound message SMS and WhatsApp
  const params = Object.assign(request.query, request.body)
  console.log(params)

  conn.login(SFDC_USERNAME, SFDC_PASSWORD, function(err, userInfo) {
    if (err) { return console.error(err); }
    // Now you can get the access token and instance URL information.
    // Save them to establish connection next time.
    console.log("accessToken: "+conn.accessToken);
    console.log("instanceUrl: "+conn.instanceUrl);
       
    // "LastMessageState__c" => $messageState,"LastMessageStateTime__c" => $datetimenow

    // update object
    conn.sobject("VonageMessagingHistory__c").retrieve("a1H2o00000B4h75EAB", function(err, history) {
        if (err) { return console.error(err); }
        console.log(history);
        // ...
      });



  });

response.status(204).send()
}
*/

function formatMessageBody()
{
    
}

app.listen(process.env.SERVER_PORT || 3000)