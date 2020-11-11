const core = require("@aws-cdk/core");
const apigateway = require("@aws-cdk/aws-apigateway");
const lambda = require("@aws-cdk/aws-lambda");
//const s3 = require("@aws-cdk/aws-s3");
const iam = require("@aws-cdk/aws-iam");
const dynamodb = require("@aws-cdk/aws-dynamodb");


class ConsoleService extends core.Construct {
  constructor(scope, id) {
    super(scope, id);

    const masterOrgAccountID = new core.CfnParameter(this, "masterOrgAccountID", {
      type: "String",
      description: "The ID of the AWS Organizations master account."});

    //const bucket = new s3.Bucket(this, "WidgetStore");

    const handler = new lambda.Function(this, "WidgetHandler", {
      runtime: lambda.Runtime.NODEJS_12_X, // So we can use async in widget.js
      code: lambda.Code.asset("resources"),
      handler: "dynamorequest.handler",
      environment: {
        //BUCKET: bucket.bucketName
      }
    });

    handler.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "dynamodb:BatchGetItem",
        "dynamodb:ConditionCheckItem",
        "dynamodb:DescribeTable",
        "dynamodb:GetItem",
        "dynamodb:Scan",
        "dynamodb:Query"
    ],
      resources: [ 'arn:aws:dynamodb:us-east-1:753451452012:table/account-safelist' ]
    }));
    //bucket.grantReadWrite(handler); // was: handler.role);

    const api = new apigateway.RestApi(this, "consoleblock-api", {
      restApiName: "Widget Service",
      deploy: false,
      description: "This service serves widgets."
    });

    const getWidgetsIntegration = new apigateway.LambdaIntegration(handler, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });

    const resource = api.root.addResource('checklist');

    resource.addMethod("GET", getWidgetsIntegration); // GET /

    // Then create an explicit Deployment construct
    const deployment  = new apigateway.Deployment(this, 'test_deployment', { api });

    const devstage = new apigateway.Stage(this, 'dev_stage',{
      description: "Dev ConsoleBlocker API",
      deployment,
      stageName: "dev"
    });

    const table = new dynamodb.Table(this, 'account-safelist', {
      partitionKey: { name: 'ID', type: dynamodb.AttributeType.STRING },
      timeToLiveAttribute: 'TTL',
      tableName: 'account-safelist'
    });

    const roleDDBWrite = new iam.Role(this, 'MasterAccount-WriteDDBConsoleBlockerRole', {
      assumedBy: new iam.AccountPrincipal(masterOrgAccountID.valueAsString),
      name: 'MasterAccount-WriteDDBConsoleBlockerRole'
    });

    roleDDBWrite.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: [table.tableArn],
      actions: ['dynamodb:PutItem',
                'dynamodb:UpdateItem'
              ],
    }));

    const ddbarn = new core.CfnOutput(this, "DDBTableARN",{
      value: table.tableArn,
      description: 'DynamoDB Table ARN',
      exportName: 'DDBTableARN'
    });

  }
}

module.exports = { ConsoleService }