const cdk = require('@aws-cdk/core');
const consoleblocker_service = require('../lib/consoleblocker_service');

class ConsoleblockerCdkStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    // The code that defines your stack goes here
    new consoleblocker_service.ConsoleService(this, 'Consoleblocker');
  }
}

module.exports = { ConsoleblockerCdkStack }
