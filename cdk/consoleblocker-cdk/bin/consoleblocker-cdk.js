#!/usr/bin/env node

const cdk = require('@aws-cdk/core');
const { ConsoleblockerCdkStack } = require('../lib/consoleblocker-cdk-stack');

const app = new cdk.App();
new ConsoleblockerCdkStack(app, 'ConsoleblockerCdkStack');
