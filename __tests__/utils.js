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

  const actual = t.context.plugin.getResponsesWithContentHandling();
  t.true(actual.httpMethod === expected.httpMethod);
  t.true(actual.contentHandling === expected.contentHandling);
  t.true(actual.path === expected.path);
});
