'use strict';

const test = require('ava');

const Plugin = require('..');

test.beforeEach(t => {
  t.context.template = {
    Resources: {}
  };
  t.context.resources = {
    Resources: {}
  };
  t.context.functions = {

  };
  t.context.serverless = {
    version: '1.13.2',
    getProvider: () => null,
    service: {
      provider: {
        compiledCloudFormationTemplate: t.context.template
      },
      resources: t.context.resources,
      functions: t.context.functions
    }
  };
  t.context.plugin = new Plugin(t.context.serverless, {
    stage: 'test'
  });
});

test('get integration responses for ContentHandling', t => {
  const expected = [{
    httpMethod: "GET",
    contentHandling: "CONVERT_TO_BINARY",
    path: "/test"
  }];

  t.context.functions = [{
    testFunction: {
      events: [{
        http: {
          path: "/test",
          method: "get",
          contentHandling: "CONVERT_TO_BINARY" 
        }
      }]
    }
  }]

  const actual = t.context.plugin.getIntegrationResponsesForContentHandling();
  t.true(actual.httpMethod === expected.httpMethod);
  t.true(actual.contentHandling === expected.contentHandling);
  t.true(actual.path === expected.path);
});

test('finds deployment id', t => {
  const id = 'ApiGatewayDeployment12345';

  t.context.template.Resources[id] = {
    Type: 'AWS::ApiGateway::Deployment',
  };

  t.true(id === t.context.plugin.getApiGatewayDeploymentId());
});

test('add dependency for apig deployment', t => {
  const id = 'ApiGatewayDeployment12345';
  const dependencies = ['CustomeResource'];

  t.context.template.Resources[id] = {
    Type: 'AWS::ApiGateway::Deployment',
  };

  t.context.plugin.addDependencies(id, dependencies);
  t.true(t.context.template.Resources[id].DependsOn.includes(dependencies[0]));
});

test('add dependencies for apig deployment', t => {
  const id = 'ApiGatewayDeployment12345';
  const dependencies = ['CustomeResource1', 'CustomeResource2'];

  t.context.template.Resources[id] = {
    Type: 'AWS::ApiGateway::Deployment',
    DependsOn: ['resources']
  };

  t.context.plugin.addDependencies(id, dependencies);
  t.true(t.context.template.Resources[id].DependsOn.includes(dependencies[0]));
  t.true(t.context.template.Resources[id].DependsOn.includes(dependencies[1]));
});
