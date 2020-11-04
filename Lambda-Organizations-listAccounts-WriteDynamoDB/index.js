const AWS = require("aws-sdk");
const sts = new AWS.STS();

var sts_params = {
    RoleArn: "arn:aws:iam::753451452012:role/MasterAccount-WriteDDBConsoleBlockerRole",
    RoleSessionName: "LambdaMasterAccountWrtDDB"
  };

exports.handler = function(event, context, callback) {
  console.log("event: ", event);
  var notif=event.responsePayload;
  console.log("notif: ", notif);
  
  //Assuming the new role will return temporary credentials
    sts.assumeRole(sts_params, function (err, data) {
      if (err) {
        console.log(err, err.stack);
        var resp = response('Internal server error!', 501);
        callback(null, resp);
      } else {
        console.log(data);
        
        //Once we've gotten the temp credentials, let's apply them
        AWS.config.credentials = new AWS.TemporaryCredentials({RoleArn: sts_params.RoleArn});
        const documentClient = new AWS.DynamoDB.DocumentClient();


  for(var i = 0; i < notif.length; i++) {
    const params = {
    TableName: "account-safelist", // The name of your DynamoDB table
    Item: {
    'ID': notif[i],
    'Status': 'approved',
    'Owner': 'Horizon',
    'UpdateTime': Math.floor(Date.now() /1000),
    //'TTL': Math.floor(Date.now()/1000 + 12096e5/1000)
    'TTL': Math.floor(Date.now()/1000 + 600)
  }
  };
  
  const data = documentClient.put(params,function(err, data){
   if (err) console.log(err);
   else console.log(data);
  });
  
  }
 }
})
};