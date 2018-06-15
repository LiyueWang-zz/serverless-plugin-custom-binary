'use strict';

module.exports = {

  getResponsesWithContentHandling() {
    const funcs = this.serverless.service.functions;

    return Object.keys(funcs).reduce((responses, functionName) => {
      funcs[functionName].events.forEach((e) => {
        if (e.http && e.http.contentHandling) {
          responses.push({
            method: e.http.method,
            contentHandling: e.http.contentHandling,
            path: e.http.path
          });
        }
      });
      return responses;
    }, []);
  },

  getApiMethods() {
    const template = this.serverless.service.provider.compiledCloudFormationTemplate;

    return Object.keys(template.Resources).reduce((methods, resourceId) => {
      const resource = template.Resources[resourceId]
      if (resource.Type === 'AWS::ApiGateway::Method') {
        const apiResourceId = resource.Properties.ResourceId.Ref;

        methods[apiResourceId] = methods[apiResourceId] || [];
        methods[apiResourceId].push(resource);
      }

      return methods;
    }, {});
  }

};
