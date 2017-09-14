'use strict';

module.exports = {

  getIntegrationResponsesForContentHandling () {
    const funcs = this.serverless.service.functions;
    const integrationResponses = [];

    Object.keys(funcs).forEach((fKey) => {
      funcs[fKey].events.forEach((e) => {
        if (e.http && e.http.contentHandling) {
          const integrationResponse = {
            httpMethod: e.http.method.toUpperCase(),
            contentHandling: e.http.contentHandling,
            path: e.http.path
          };
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
      template.Resources[id].DependsOn = template.Resources[id].DependsOn.concat(dependencies);
    } else {
       template.Resources[id].DependsOn = dependencies;
    }
  },

};
