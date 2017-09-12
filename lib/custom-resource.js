'use strict';

const aws = require('aws-sdk');
const response = require('cfn-response');

module.exports.handler = function(event, context) {
  Promise.resolve()
    .then(() => {
      const apiGateway = new aws.APIGateway();

      const integrationResponses = event.ResourceProperties.IntegrationResponses;
      const binaryMediaTypes = event.ResourceProperties.BinaryMediaTypes;
      const restApiId = event.ResourceProperties.RestApi;
      const apiName = event.ResourceProperties.ApiName;

      const swaggerInput = JSON.stringify({
        "swagger": "2.0",
        "info": {
          "title": apiName
        },
        "x-amazon-apigateway-binary-media-types": binaryMediaTypes
      });

      const integrationResponse = {
        statusCode: '200',
        restApiId: restApiId
      };

      switch (event.RequestType) {
        case 'Create':
        case 'Update':
          return apigateway.putRestApi({
              restApiId: restApiId,
              mode: 'merge',
              body: swagger
            })
            .promise()
            .then(() => {
              return apigateway.getResources({ restApiId: restApiId })
                .promise();
            })
            .then((resources) => {
              const integrationPromises = [];
              integrationResponses.forEach((response) => {
                integrationResponse.httpMethod = response.httpMethod;
                integrationResponse.contentHandling = response.contentHandling;
                integrationResponse.resourceId = resources.items.find(
                  r => r.path === `/${response.path}`).id;

                integrationPromises.push(apigateway.putIntegrationResponse(integrationResponse).promise());
              })

              return Promise.all(integrationPromises);
            })
            .then(() => {
              console.log('BinaryMediaTypes and ContentHandling set in api gateway.');
            })
        default:
          return Promise.resolve('no action matched');
      }
  })
  .then((msg) => {
    /* eslint-disable no-console */
    console.log('completed: ', msg);
    response.send(event, context, response.SUCCESS, {});
  })
  .catch(e => {
    /* eslint-disable no-console */
    console.log(e);
    response.send(event, context, response.FAILED, {});
  });
};
