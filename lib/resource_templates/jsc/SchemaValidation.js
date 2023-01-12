/**
Copyright 2022 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/* global context, print, api */

// Template SchemaValidation.js

// include api.js

const bundle = context.getVariable('bundle')
let target
const path = context.getVariable('proxy.pathsuffix').replace(/\/$/, '')
const resource = bundle.policify.getResourceForPath(api, path)
print('path', path, 'resource', resource)
const verb = context.getVariable('request.verb').toLowerCase()

function responseBody () {
  let body
  try {
    body = context.proxyResponse.content.asJSON
  } catch (e) {
    print('error getting json content', e)
    body = ''
  }
  if (!body) {
    // Get content...
    try {
      body = JSON.stringify(context.proxyResponse.content)
    } catch (e) {
      print(e)
    }
  }
  return body
}

// only process if we are in the proxy response flow
if (context.flow === 'PROXY_RESP_FLOW') {
  // @TODO: check for http response code?
  target = responseBody()

  // check if the endpoint config exists
  try {
    const check = api.paths[resource][verb]
    print(check, 'endpoint config exists')
  } catch (e) {
    print('Could not find endpoint definition for ' + resource + ' [' + verb + '] ')
    context.setVariable('SCHEMA.error', true)
  }

  // find and parse the schema
  const schema = bundle.policify.schemaFromApi(api, api.paths[resource][verb].responses['200'])

  if (!schema) {
    print('Could not find schema definition')
    context.setVariable('SCHEMA.error', true)
  } else if (!target) {
    print('Could not find target')
    context.setVariable('SCHEMA.error', true)
  } else {
    // print("Keys in schema: " + Object.keys(schema["properties"]).toString());
    // print("Keys in target: " + Object.keys(target).toString());
    // print('target', JSON.stringify(target));
    print('schema', JSON.stringify(schema))

    const isValid = bundle.policify.validateSchema(target, schema)
    print('valid?', isValid)
    if (isValid) {
      print('Target is conform the schema defined for ' + resource)
    } else {
      const err = bundle.policify.getLastError()
      print('Target does not validate with the schema defined for ' + resource)
      print('Error ' + JSON.stringify(err))
      context.setVariable('SCHEMA.error', true)
    }
  }
}
