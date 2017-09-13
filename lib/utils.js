'use strict';

module.exports = {

  getIntegrationResponsesForContentHandling () {
    const funcs = this.serverless.service.functions;
    const integrationResponses = [];

    Object.keys(funcs).forEach((fKey) => {
      funcs[fKey].events.forEach((e) => {
        if (e.http && e.http.contentHandling) {
          const integrationResponse = {};
          integrationResponse.httpMethod = e.http.method.toUpperCase();
          integrationResponse.contentHandling = e.http.contentHandling;
          integrationResponse.path = e.http.path;
          integrationResponses.push(integrationResponse);
        }
      })
    })
    return integrationResponses;
  },

  getApiGatewayDeploymentId() {
    const template = this.serverless.service.provider.compiledCloudFormationTemplate;

    return Object.keys(template.Resources).find(id => {
      return template.Resources[id].Type === 'AWS::ApiGateway::Deployment';
    });
  },

  addDependencies(id, dependencies) {
    const template = this.serverless.service.provider.compiledCloudFormationTemplate;

    if (template.Resources[id].DependsOn) {
      template.Resources[id].DependsOn.concat(dependencies);
    } else {
       template.Resources[id].DependsOn = dependencies;
    }
  },

  getApiGatewayStage(deploymentId) {
    const service = this.serverless.service;
    const resources = service.resources;
    const template = service.provider.compiledCloudFormationTemplate;
    const deployment = template.Resources[deploymentId];

    const stage = {
      name: deployment.Properties.StageName
    };

    if (resources && resources.Resources) {
      Object.keys(resources.Resources).forEach(key => {
        const resource = resources.Resources[key];

        if (resource.Type === 'AWS::ApiGateway::Stage') {
          if (resource.Properties.DeploymentId.Ref === deploymentId) {
            stage.name = resource.Properties.StageName;
            stage.id = key;
          }
        }
      });
    }

    return stage;
  }

};
