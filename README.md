[![CircleCI](https://circleci.com/gh/LiyueWang/serverless-plugin-custom-binary.svg?style=shield&circle-token=e8cebb6ab1ac44c57262bf84c68604326708f7a9)](https://circleci.com/gh/LiyueWang/serverless-plugin-custom-binary)

# serverless-plugin-custom-binary

This is a plugin for Serverless that sets up `BinaryMediaTypes` and `ContentHandling` to [enable support for Binary Payloads in API Gateway](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-payload-encodings.html).

## Usage

```yaml

service: my-service

plugins:
  - serverless-plugin-custom-binary

custom:
  apiGateway:
    binaryMediaTypes:
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

Several other plugins exist but now CloudFormation appears to support configuring these properties directly. The other plugins make sure of API calls that create race conditions or otherwise complicate deployments.

