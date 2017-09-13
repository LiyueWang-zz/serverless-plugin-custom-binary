'use strict';

const addCustomResource = require('add-custom-resource');
const path = require('path');
const semver = require('semver');

const utils = require('./lib/utils');

module.exports = class CustomBinary {

  constructor(serverless, options) {
    if (!semver.satisfies(serverless.version, '>= 1.13')) {
      throw new Error('serverless-plugin-custom-binary requires serverless 1.13 or higher!');
    }

    this.serverless = serverless;
    this.options = options;
    this.provider = this.serverless.getProvider('aws');

    Object.assign(this,
      { addCustomResource },
      utils
    );

    this.hooks = {
      'before:aws:package:finalize:mergeCustomProviderResources': this.beforePackage.bind(this),
    };
  }

  beforePackage() {
    const template = this.serverless.service.provider.compiledCloudFormationTemplate;
    const integrationResponses = this.getIntegrationResponsesForContentHandling();
    const binaryMediaTypes = this.serverless.service.custom.apigatewayBinary.types;
    const apiName = this.provider.naming.getApiGatewayName();
    const deploymentId = this.getApiGatewayDeploymentId();

    if (deploymentId) {
      const stage = this.getApiGatewayStage(deploymentId);
      const dependencies = ['ApiGatewayRestApi'];

      if (stage.id) {
        dependencies.push(stage.id);
      }

      addCustomResource(template, {
        name: 'ApiGatewayBinarySupport',
        sourceCodePath: path.join(__dirname, 'lib/custom-resource.js'),
        resource: {
          properties: {
            IntegrationResponses: integrationResponses,
            BinaryMediaTypes: binaryMediaTypes,
            ApiName: apiName,
            RestApi: {
              Ref: 'ApiGatewayRestApi'
            }
          },
          dependencies
        },
        role: {
          policies: [{
            PolicyName: 'apigateway-permissions',
            PolicyDocument: {
              Version: '2012-10-17',
              Statement: [{
                Effect: 'Allow',
                Action: ['apigateway:*'],
                Resource: 'arn:aws:apigateway:*:*:*'
              }]
            }
          }]
        }
      });

      const customDependencies = ['CustomApiGatewayBinarySupportResource'];
      this.addDependencies(deploymentId, customDependencies);
    } else {
      throw new Error('Could not find AWS::ApiGateway::Deployment resource in CloudFormation template!');
    }
  }

};
