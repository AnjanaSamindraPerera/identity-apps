/**
 * Copyright (c) 2020, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { ClaimResourceEndpointsInterface } from "../models";

/**
 * Get the resource endpoints for the Claim Management feature.
 *
 * @param serverHost - Server Host.
 * @param serverHostWithOrgPath - Server Host with the Organization Path.
 * @returns ClaimResourceEndpointsInterface
 */
export const getClaimResourceEndpoints = (
    serverHost: string,
    serverHostWithOrgPath: string
): ClaimResourceEndpointsInterface => {
    return {
        claims: `${ serverHostWithOrgPath }/api/server/v1/claim-dialects`,
        externalClaims:`${ serverHostWithOrgPath }/api/server/v1/claim-dialects/{}/claims`,
        localClaims: `${serverHostWithOrgPath}/api/server/v1/claim-dialects/local/claims`,
        resourceTypes: `${ serverHostWithOrgPath }/scim2/ResourceTypes`
    };
};