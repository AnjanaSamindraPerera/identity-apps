/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com).
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

import { GearIcon } from "@oxygen-ui/react-icons";
import { AccessControlUtils } from "@wso2is/access-control";
import { ChildRouteInterface, RouteInterface } from "@wso2is/core/models";
import { RouteUtils as CommonRouteUtils } from "@wso2is/core/utils";
import isEmpty from "lodash-es/isEmpty";
import React, { lazy } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch } from "redux";
import { commonConfig } from "../../../extensions/configs/common";
import { serverConfigurationConfig } from "../../../extensions/configs/server-configuration";
import useAuthorization from "../../authorization/hooks/use-authorization";
import { OrganizationManagementConstants } from "../../organizations/constants/organization-constants";
import { OrganizationUtils } from "../../organizations/utils/organization";
import { useGovernanceConnectorCategories } from "../../server-configurations/api/governance-connectors";
import {
    GovernanceCategoryForOrgsInterface,
    GovernanceConnectorForOrgsInterface
} from "../../server-configurations/models/governance-connectors";
import { getAppViewRoutes } from "../configs/routes";
import { getSidePanelIcons } from "../configs/ui";
import { AppConstants } from "../constants/app-constants";
import { history } from "../helpers/history";
import { FeatureConfigInterface } from "../models/config";
import { AppState, setDeveloperVisibility, setFilteredDevelopRoutes, setSanitizedDevelopRoutes } from "../store";
import { AppUtils } from "../utils/app-utils";

/**
 * Props interface of {@link useOrganizations}
 */
export type useRoutesInterface = {
    filterRoutes: (
        onRoutesFilterComplete: () => void,
        isFirstLevelOrg?: boolean
    ) => void;
};

/**
 * Hook that provides access to the Organizations context.
 *
 * @returns An object containing the current Organizations context.
 */
const useRoutes = (): useRoutesInterface => {
    const dispatch: Dispatch = useDispatch();

    const { legacyAuthzRuntime }  = useAuthorization();

    const featureConfig: FeatureConfigInterface = useSelector((state: AppState) => state.config.ui.features);
    const loggedUserName: string = useSelector((state: AppState) => state.profile.profileInfo.userName);
    const isSuperAdmin: string = useSelector((state: AppState) => state.organization.superAdmin);
    const isFirstLevelOrg: boolean = useSelector((state: AppState) => state.organization.isFirstLevelOrganization);
    const allowedScopes: string = useSelector((state: AppState) => state?.auth?.allowedScopes);
    const isPrivilegedUser: boolean = useSelector((state: AppState) => state?.auth?.isPrivilegedUser);
    const tenantDomain: string = useSelector((state: AppState) => state.auth.tenantDomain);

    const {
        data: governanceConnectors
    } = useGovernanceConnectorCategories(featureConfig?.residentIdp?.enabled && isFirstLevelOrg);

    /**
     * Filter the routes based on the user roles and permissions.
     *
     * @param onRoutesFilterComplete - Callback to be called after the routes are filtered.
     * @param isFirstLevelOrg - Is the current organization the first level organization.
     *
     * @returns A promise containing void.
     */
    const filterRoutes = async (onRoutesFilterComplete: () => void, isFirstLevelOrg: boolean): Promise<void> => {
        if (
            isEmpty(allowedScopes) ||
            !featureConfig.applications ||
            !featureConfig.users
        ) {
            return;
        }

        const resolveHiddenRoutes = (): string[] => {
            const commonHiddenRoutes: string[] = [
                ...AppUtils.getHiddenRoutes(),
                ...AppConstants.ORGANIZATION_ONLY_ROUTES
            ];

            function getAdditionalRoutes() {
                if (!isOrganizationManagementEnabled) {
                    return [ ...AppUtils.getHiddenRoutes(), ...AppConstants.ORGANIZATION_ROUTES ];
                }

                const isCurrentOrgRootAndSuperTenant: boolean =
                    OrganizationUtils.isCurrentOrganizationRoot() && AppConstants.getSuperTenant() === tenantDomain;

                if (legacyAuthzRuntime) {
                    if (isCurrentOrgRootAndSuperTenant || isFirstLevelOrg) {
                        if (isPrivilegedUser) {
                            if (loggedUserName === isSuperAdmin) {
                                return [ ...commonHiddenRoutes, ...AppConstants.ORGANIZATION_ROUTES ];
                            } else {
                                return [
                                    ...commonHiddenRoutes,
                                    ...AppConstants.ORGANIZATION_ROUTES,
                                    ...AppConstants.SUPER_ADMIN_ONLY_ROUTES
                                ];
                            }
                        } else {
                            if (loggedUserName === isSuperAdmin) {
                                return commonHiddenRoutes;
                            } else {
                                return [ ...commonHiddenRoutes, ...AppConstants.SUPER_ADMIN_ONLY_ROUTES ];
                            }
                        }
                    } else {
                        if (window["AppUtils"].getConfig().organizationName) {
                            return [
                                ...AppUtils.getHiddenRoutes(),
                                ...OrganizationManagementConstants.ORGANIZATION_ROUTES
                            ];
                        } else {
                            return [ ...AppUtils.getHiddenRoutes(), ...AppConstants.ORGANIZATION_ROUTES ];
                        }
                    }
                }

                if (isCurrentOrgRootAndSuperTenant && !window["AppUtils"].getConfig().organizationName) {
                    if (loggedUserName === isSuperAdmin) {
                        return commonHiddenRoutes;
                    } else {
                        return [ ...commonHiddenRoutes, ...AppConstants.SUPER_ADMIN_ONLY_ROUTES ];
                    }
                }

                if (window["AppUtils"].getConfig().organizationName) {
                    return [
                        ...AppUtils.getHiddenRoutes()
                    ];
                } else {
                    return [ ...commonHiddenRoutes ];
                }
            }

            const additionalRoutes: string[] = getAdditionalRoutes();

            return [ ...additionalRoutes ];
        };
        
        let allowedRoutes: string[] = window["AppUtils"].getConfig().organizationName
            ? AppConstants.ORGANIZATION_ENABLED_ROUTES
            : undefined;
            
        if (legacyAuthzRuntime) {
            allowedRoutes = !OrganizationUtils.isCurrentOrganizationRoot()
                && !isFirstLevelOrg
                && AppConstants.ORGANIZATION_ENABLED_ROUTES;
        }

        const [
            appRoutes,
            sanitizedAppRoutes
        ] = CommonRouteUtils.filterEnabledRoutes<FeatureConfigInterface>(
            getAppViewRoutes(commonConfig.useExtendedRoutes),
            featureConfig,
            allowedScopes,
            window[ "AppUtils" ].getConfig().organizationName ? false : commonConfig.checkForUIResourceScopes,
            resolveHiddenRoutes(),
            allowedRoutes
        );

        // TODO : Remove this logic once getting started pages are removed.
        if (
            appRoutes.length === 2 &&
            appRoutes.filter(
                (route: RouteInterface) =>
                    route.id ===
                    AccessControlUtils.DEVELOP_GETTING_STARTED_ID ||
                    route.id === "404"
            ).length === 2
        ) {
            appRoutes[ 0 ] = appRoutes[ 0 ].filter((route: RouteInterface) => route.id === "404");
        }

        if (governanceConnectors?.length > 0) {
            const customGovernanceConnectorRoutes: RouteInterface[] = [];

            governanceConnectors.forEach((category: GovernanceCategoryForOrgsInterface) => {
                if (!serverConfigurationConfig.connectorCategoriesToShow.includes(category.id)) {
                    const governanceConnectorChildren: ChildRouteInterface[] = [];

                    category?.connectors?.forEach((connector: GovernanceConnectorForOrgsInterface) => {
                        governanceConnectorChildren.push({
                            component: lazy(() =>
                                import(
                                    "../../server-configurations/pages/connector-edit-page"
                                )
                            ),
                            exact: true,
                            icon: {
                                icon: getSidePanelIcons().childIcon
                            },
                            id: connector.id,
                            name: connector.name,
                            path: AppConstants.getPaths().get("GOVERNANCE_CONNECTOR_EDIT")
                                .replace(
                                    ":categoryId",
                                    category.id
                                )
                                .replace(
                                    ":connectorId",
                                    connector.id
                                ),
                            protected: true,
                            showOnSidePanel: false
                        });
                    });

                    customGovernanceConnectorRoutes.push(
                        {
                            category: category.id,
                            children: governanceConnectorChildren,
                            component: lazy(() =>
                                import(
                                    "../../server-configurations/pages/connector-listing-page"
                                )
                            ),
                            exact: true,
                            icon: {
                                icon: <GearIcon />
                            },
                            id: category.id,
                            name: category.name,
                            path: AppConstants.getPaths().get("GOVERNANCE_CONNECTOR")
                                .replace(":id", category.id),
                            protected: true,
                            showOnSidePanel: true
                        }
                    );
                }
            });

            appRoutes.push(...customGovernanceConnectorRoutes);
            sanitizedAppRoutes.push(...customGovernanceConnectorRoutes);
        }

        dispatch(setFilteredDevelopRoutes(appRoutes));
        dispatch(setSanitizedDevelopRoutes(sanitizedAppRoutes));

        onRoutesFilterComplete();

        if (sanitizedAppRoutes.length < 1) {
            dispatch(setDeveloperVisibility(false));
        }

        if (sanitizedAppRoutes.length < 1) {
            history.push({
                pathname: AppConstants.getPaths().get("UNAUTHORIZED"),
                search:
                    "?error=" + AppConstants.LOGIN_ERRORS.get("ACCESS_DENIED")
            });
        }
    };

    return {
        filterRoutes
    };
};

export default useRoutes;