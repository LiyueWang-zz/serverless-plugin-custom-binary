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

test('add depend for apig deployment', t => {
  const id = 'ApiGatewayDeployment12345';
  const depend = 'CUstomeResource';

  t.context.template.Resources[id] = {
    Type: 'AWS::ApiGateway::Deployment',
  };

  t.true(id === t.context.plugin.addDependApiGatewayDeployment(depend));
  t.true(t.context.template.Resources[id].DependsOn.includes(depend));
});

test('finds stage name from deployment', t => {
  const expected = {
    name: 'dev'
  };

  t.context.template.Resources['ApiGatewayDeployment12345'] = {
    Type: 'AWS::ApiGateway::Deployment',
    Properties: {
      StageName: 'dev'
    }
  };

  const actual = t.context.plugin.getApiGatewayStage('ApiGatewayDeployment12345');
  t.deepEqual(expected, actual);
});

test('finds stage name from stage', t => {
  const expected = {
    name: 'foo_dev',
    id: 'ApiGatewayStage'
  };

  t.context.template.Resources['ApiGatewayDeployment12345'] = {
    Type: 'AWS::ApiGateway::Deployment',
    Properties: {
      StageName: 'dev'
    }
  };

  t.context.resources.Resources['ApiGatewayStage'] = {
    Type: 'AWS::ApiGateway::Stage',
    Properties: {
      StageName: 'foo_dev',
      DeploymentId: {
        Ref: 'ApiGatewayDeployment12345'
      }
    }
  };

  const actual = t.context.plugin.getApiGatewayStage('ApiGatewayDeployment12345');
  t.deepEqual(expected, actual);
});
