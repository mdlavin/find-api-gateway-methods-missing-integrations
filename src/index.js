process.env.AWS_SDK_LOAD_CONFIG = 'true';

const AWS = require('aws-sdk');
const yargs = require('yargs');

async function forEachResource (apigateway, restApiId, func, position) {
  const result = await apigateway.getResources({
    restApiId,
    position,
    embed: ['methods']
  }).promise();

  for (const item of result.items) {
    await func(item);
  }

  if (result.position) {
    return forEachResource(apigateway, restApiId, func, result.position);
  }
}

async function lookForMissingMethodItegration (apigateway, restApiId, resourceId, httpMethod) {
  const params = { httpMethod, resourceId, restApiId };
  await apigateway.getIntegration(params).promise();
}

async function lookForMissingResourceItegration (apigateway, restApiId, resource) {
  for (const method in resource.resourceMethods) {
    try {
      await lookForMissingMethodItegration(apigateway, restApiId, resource.id, method);
    } catch (error) {
      if (error.name === 'NotFoundException') {
        console.log(`Method intergration missing for ${resource.path}`);
      }
    }
  }
}

async function run () {
  const options = yargs
    .option('profile', {
      description: 'The AWS ~/.aws/config profile to use',
      alias: 'p'
    })
    .option('restApiId', {
      description: 'The API Gateway REST API ID to inspect',
      alias: 'r',
      required: true
    })
    .argv

  if (options.profile) {
    process.env.AWS_PROFILE = options.profile;
  }

  const apigateway = new AWS.APIGateway();
  const func = lookForMissingResourceItegration.bind(undefined, apigateway, options.restApiId)
  await forEachResource(apigateway, options.restApiId, func);
}

run()
  .catch(function (error) {
    console.log(error);
    process.exitCode = -1;
  });