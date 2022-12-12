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

var elements = require('./regex_rules.json')

var print = function (m1, m2) {
  console.log(m1, m2)
}
var context = {
  setVariable: function (s, v) {
    console.log(s, v)
  },
  proxyRequest: {
    url: 'http://localhost/bla/x=create function foobar returns'
  }
}

var block = function (haystack, filters) {
  filters.some(function (jsonRegex) {
    // Create a regex from the json string.
    // print('regex',jsonRegex.rule);
    var f = new RegExp(jsonRegex.rule, jsonRegex.flags)
    // print('regex',f);
    var hit = f.exec(haystack)
    if (hit) {
      print('found', hit[0])
      context.setVariable('FILTER.block', true)
      return true
    }
  })
}

elements.forEach(function (element) {
  var filters = element.filters
  if (element.element === 'QueryParam') {
    if (block(decodeURIComponent(context.proxyRequest.url), filters)) {
      return
    }
  }
})
