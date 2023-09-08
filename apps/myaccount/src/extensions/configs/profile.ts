/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
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

import { ProfileConstants } from "@wso2is/core/constants";
import { ProfileConfig } from "./models";

export const profileConfig: ProfileConfig = {
    attributes: {
        getRegExpValidationError: (attribute: string) => {
            if (attribute === ProfileConstants?.SCIM2_SCHEMA_DICTIONARY.get("PHONE_NUMBERS")
            ){
                return "myAccount:components.profile.forms.mobileChangeForm." +
                    "inputs.mobile.validations.invalidFormat";
            }
        }
    }
};
