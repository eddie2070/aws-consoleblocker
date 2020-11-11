const { expect, matchTemplate, MatchStyle } = require('@aws-cdk/assert');
const cdk = require('@aws-cdk/core');
const ConsoleblockerCdk = require('../lib/consoleblocker-cdk-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new ConsoleblockerCdk.ConsoleblockerCdkStack(app, 'MyTestStack');
    // THEN
    expect(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
