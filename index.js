'use strict';

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
      utils
    );

    this.hooks = {
      'before:aws:package:finalize:mergeCustomProviderResources': this.beforePackage.bind(this),
    };
  }

  beforePackage() {
    const template = this.serverless.service.provider.compiledCloudFormationTemplate;

    const config = this.getConfig();
    const binaryMediaTypes = config.binaryMediaTypes;
    
    if (binaryMediaTypes) {
      if (Array.isArray(binaryMediaTypes)) {
        const restApi = template.Resources.ApiGatewayRestApi;

        if (restApi) {
          restApi.Properties.BinaryMediaTypes = binaryMediaTypes;
        } else {
          throw new Error('Could not find ApiGatewayRestApi resource');
        }
      } else {
        throw new Error('custom.apiGateway.binaryMediaTypes must be an array');
      }
    }

    const responses = this.getResponsesWithContentHandling();
    const apiMethodsByResource = this.getApiMethods();

    responses.forEach(response => {
      const resourceLogicalId = this.provider.naming.getResourceLogicalId(
        response.path
      );

      const methods = apiMethodsByResource[resourceLogicalId];

      if (methods) {
        if (methods.some(method => {
          if (method.Properties.HttpMethod.toUpperCase() === response.method.toUpperCase()) {
            method.Properties.Integration.ContentHandling = response.contentHandling;
            return true;
          }
        })) {
          return
        }
        throw new Error(`Did not find method  ${response.method} to set content handling!`);
      } else {
        throw new Error(`Could not find API Gateway Resource ${resourceLogicalId}`);
      }
    });
  }

  getConfig() {
    const custom = this.serverless.service.custom;

    if (custom && custom.apiGateway) {
      return custom.apiGateway;
    }
    
    return {};
  }

};
