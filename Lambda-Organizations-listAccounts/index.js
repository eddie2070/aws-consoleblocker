const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();
const organizations = new AWS.Organizations();



exports.handler = function(event, context, callback) {
  console.log("event: ", event);

   var params = {
 };
 var result = [];
  organizations.listAccounts(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
      console.log("data: ", data);
      for(var i = 0; i < data['Accounts'].length; i++) { 
                  console.log('list of accounts: '+i,data['Accounts'][i]['Id']);
                  result.push(data['Accounts'][i]['Id']);
              }
        console.log("results: ", result);
        callback(null, result);
      //console.log("list of accounts: ",data['Accounts']);
    }
  });

};