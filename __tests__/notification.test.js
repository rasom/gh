/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

'use strict'

const { runCmd } = require('./testUtils')

describe('E2E: Notification Module Test', () => {
    it('List Notifications `gh nt`', done => {
        expect(runCmd('bin/gh.js nt')).toMatchSnapshot()
        done()
    })
})
