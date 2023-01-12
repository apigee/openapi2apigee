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

/* global print, context, elements, parse */
// Template: JavaScriptFilter.js
const block = function (haystack, filters) {
  filters.some(function (jsonRegex) {
    // Create a regex from the json string.
    const f = new RegExp(jsonRegex.rule, jsonRegex.flags)
    let bool = false
    print('regex', f)
    const hit = f.exec(haystack.trim())
    if (hit) {
      print('found', hit[0], haystack)
      context.setVariable('FILTER.block', true)
      bool = true
    }
    return bool
  })
}

elements.forEach(function (element) {
  const filters = element.filters
  const decodedUrl = decodeURIComponent(context.proxyRequest.url)
  let params
  try {
    params = parse(decodedUrl.substr(decodedUrl.indexOf('?')))
  } catch (error) {
    print('could not parse querystring', error)
    context.setVariable('FILTER.block', true)
    return true
  }
  if (element.element === 'QueryParam') {
    Object.keys(params).forEach(function (key) {
      const val = params[key]
      if (val && typeof val === 'string') {
        if (block(val, filters)) {
          // nothing to do
        }
      }
    })
  }
})

// print('context.proxyRequest.headers', context.proxyRequest.headers);
// print('context.proxyRequest.query', context.proxyRequest.query);
// print('context.proxyRequest.parameters', context.proxyRequest.parameters);
// print('context.proxyRequest.method', context.proxyRequest.method);
// print('context.proxyRequest.body', context.proxyRequest.body);
// print('context.proxyRequest.url', context.proxyRequest.url);
