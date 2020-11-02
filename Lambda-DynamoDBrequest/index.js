const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async event => {
  console.log("event: ", event.queryStringParameters.id);
  const params = {
    TableName: "account-safelist", // The name of your DynamoDB table
    Key: {
    ID: event.queryStringParameters.id
  }
  };
  try {
    // Utilising the scan method to get all items in the table
    const data = await documentClient.get(params).promise();
    console.log("data.Item.Status: ", data);
    if (JSON.stringify(data) === '{}')
    {
      const response = {
      statusCode: 200,
      body: JSON.stringify("non-approved")
    };
    console.log("response: ", response);
    return response;
    }
    else
    {
    const response = {
      statusCode: 200,
      body: JSON.stringify(data.Item.Status)
    };
    console.log("response: ", response);
    return response;
    }
  } catch (e) {
    return e;
    //{
    //  statusCode: 500,
  //};
  }
};