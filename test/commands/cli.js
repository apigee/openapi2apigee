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

var path = require('path')
var childProcess = require('child_process')
var should = require('should')

describe('openapi2apigee', function () {
  it('without arguments should return correct exit code', function (done) {
    childProcess.exec([
      path.join(process.cwd(), 'bin/openapi2apigee')
    ].join(' '), function (err) {
      should.equal(err.code, 1)
      done()
    })
  })
  it('with wrong api file should return correct exit code', function (done) {
    childProcess.exec([
      path.join(process.cwd(), 'bin/openapi2apigee generateApi apiname -s wrong.json -d ./apigee')
    ].join(' '), function (err) {
      should.equal(err.code, 1)
      done()
    })
  })
})
