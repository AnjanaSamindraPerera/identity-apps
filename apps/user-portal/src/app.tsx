/**
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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

import React, { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { Provider } from "react-redux";
import { Redirect, Route, Router, Switch } from "react-router-dom";
import { ProtectedRoute } from "./components";
import { SignIn, SignOut } from "./components/authentication";
import { i18n } from "./configs";
import { AppConfig, history } from "./helpers";
import { AppConfigInterface } from "./models";
import { store } from "./store";
import { filteredRoutes, getAppConfig } from "./utils";

/**
 * Main App component.
 *
 * @return {JSX.Element}
 */
export const App = (): JSX.Element => {

    const [appConfig, setAppConfig] = useState<AppConfigInterface>(null);

    /**
     * Obtain app.config.json from the server root when the app mounts.
     */
    useEffect(() => {
        getAppConfig().then((appConfigModule) => {
            setAppConfig(appConfigModule);
        });
    }, []);

    return (
        <Router history={ history }>
            <div className="container-fluid">
                <I18nextProvider i18n={ i18n }>
                    <Provider store={ store }>
                        <AppConfig.Provider value={ appConfig }>
                            <Switch>
                                <Redirect exact={ true } path="/" to={ window["AppUtils"].getConfig().routes.login } />
                                <Route
                                    path={ window["AppUtils"].getConfig().routes.login }
                                    render={ (props) => {
                                        return <SignIn { ...props } />;
                                    } }
                                />
                                <Route
                                    path={ window["AppUtils"].getConfig().routes.logout }
                                    render={ () => {
                                        return <SignOut />;
                                    } }
                                />
                                {
                                    appConfig
                                        ? filteredRoutes(appConfig).map((route, index) => {
                                            return (
                                                route.protected ?
                                                    (
                                                        <ProtectedRoute
                                                            component={ route.component }
                                                            path={ route.path }
                                                            key={ index }
                                                        />
                                                    )
                                                    :
                                                    (
                                                        <Route
                                                            path={ route.path }
                                                            render={ (props) =>
                                                                (<route.component { ...props } />)
                                                            }
                                                            key={ index }
                                                        />
                                                    )
                                            );
                                        })
                                        : null
                                }
                            </Switch>
                        </AppConfig.Provider>
                    </Provider>
                </I18nextProvider>
            </div>
        </Router>
    );
};
