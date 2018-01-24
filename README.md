Usage
=====

To debug API Gateway deployment failures, like "BadRequestException: No integration defined for method" the
`find-api-gateway-methods-missing-integrations` tool can be used to look for badly configured method like
this:

    find-api-gateway-methods-missing-integrations -r some-rest-api-id

If you want to query using a non-default AWS profile, the -p option can be used like this:

    find-api-gateway-methods-missing-integrations -p your-profile -r some-rest-api-id

The output of the tool will list the API Gateway methods that are missing integrations and would lead to failed
deployments.

Installation
============

Make sure you are using node > v8 and run `yarn global add find-api-gateway-methods-missing-integrations`.