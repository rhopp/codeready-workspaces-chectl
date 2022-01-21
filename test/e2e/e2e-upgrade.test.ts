/**
 * Copyright (c) 2019-2021 Red Hat, Inc.
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */

// tslint:disable: no-console
import { E2eHelper, NAMESPACE } from './util'

const helper = new E2eHelper()
jest.setTimeout(1000000)

const binChectl = E2eHelper.getChectlBinaries()

const PLATFORM = process.env.PLATFORM || 'minikube'

const INSTALLER = 'operator'

const UPDATE_CHE_TIMEOUT_MS = 10 * 60 * 1000
const CHE_VERSION_TIMEOUT_MS = 10 * 60 * 1000

describe('Test Che upgrade', () => {
  let cheVersion: string

  describe('Prepare latest stable Che', () => {
    it(`Deploy Che using ${INSTALLER} installer and self signed certificates`, async () => {
      // Retrieve latest stable Che version
      cheVersion = await helper.getLatestReleasedVersion()

      const deployCommand = `${binChectl} server:deploy --batch --workspace-engine=dev-workspace --platform=${PLATFORM} --installer=${INSTALLER} --version=${cheVersion} --chenamespace=${NAMESPACE} --telemetry=off`
      await helper.runCliCommand(deployCommand)

      await helper.waitForVersionInCheCR(cheVersion, CHE_VERSION_TIMEOUT_MS)
    })
  })

  describe('Test Che update', () => {
    it('Update CodeReady Workspaces Version', async () => {
      await helper.runCliCommand(binChectl, ['server:update', '-y', `-n ${NAMESPACE}`, '--telemetry=off'])
      await helper.waitForCheServerImageTag(helper.getNewVersion(), UPDATE_CHE_TIMEOUT_MS)
    })

    it('Check updated Che version', async () => {
        await helper.waitForVersionInCheCR(helper.getNewVersion(), CHE_VERSION_TIMEOUT_MS)
    })
  })
})
