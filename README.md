# serverless-plugin-custom-binary

This is a plugin for Serverless that injects a [CloudFormation Custom Resource](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-custom-resources.html) in your deployed stack that sets up `BinaryMediaTypes` and `ContentHandling` to [enable support for Binary Payloads in API Gateway](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-payload-encodings.html).

## Usage

```yaml

service: my-service

plugins:
  - serverless-plugin-custom-binary

custom:
  apigatewayBinary:
    types:
      - 'application/json'

functions:
  helloword:
    handler: handler.hello
    events:
      - http:
        path: /hello
        method: GET
        contentHandling: CONVERT_TO_BINARY
```

## Notes
Serverless plugin [serverless-apigw-binary](https://github.com/maciejtreder/serverless-apigw-binary) is to set `BinaryMediaTypes` and Serverless plugin [serverless-apigwy-binary](https://github.com/ryanmurakami/serverless-apigwy-binary) is to set `ContentHandling`. However, to update these two settings to api gateway, you must redeploy the API to make the changes available for your users. [(reference)](http://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-deploy-api.html). After the redeploy there may take a few seconds to make the changes available, which is not allowed in our case. Besides [AWS Limit createDeployment](http://docs.aws.amazon.com/apigateway/latest/developerguide/limits.html) which makes the *serverless-apigwy-binary* has to [wait 1 minute to get reliable deployment](https://github.com/ryanmurakami/serverless-apigwy-binary/blob/master/index.js#L68). To avoid the race condition and the extra wait time, we create this plugin to add custom resource to enable support for Binary Payloads before the Api Gateway deployment takes place.

