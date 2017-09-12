'use strict';

module.exports = {

  getIntegrationResponsesForContentHandling () {
	const funcs = this.serverless.service.functions;
    const integrationResponses = [];
    const integrationResponse = {};

    Object.keys(funcs).forEach((fKey) => {
      funcs[fKey].events.forEach((e) => {
        if (e.http && e.http.contentHandling) {
          integrationResponse.httpMethod = e.http.method.toUpperCase();
          integrationResponse.contentHandling = e.http.contentHandling;
          integrationResponse.path = e.http.path;
          integrationResponses.push(integrationResponse);
        }
      })
    })
    return integrationResponses;
  },

  addDependApiGatewayDeployment(depend) {
    const template = this.serverless.service.provider.compiledCloudFormationTemplate;
	  let deploymentId;

    Object.keys(template.Resources).forEach(function(key) {
      if (template.Resources[key].Type === 'AWS::ApiGateway::Deployment') {
        if (template.Resources[key].DependsOn) {
          template.Resources[key].DependsOn.push(depend);
        } else {
          template.Resources[key].DependsOn = [depend];
        }
		    deploymentId = key;
      }
    });
	  return deploymentId;
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
