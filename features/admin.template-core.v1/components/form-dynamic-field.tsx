/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com).
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

import { getCertificateIllustrations } from "@wso2is/admin.core.v1";
import { IdentifiableComponentInterface } from "@wso2is/core/models";
import { CheckboxFieldAdapter, FilePickerAdapter, FinalFormField, FormApi, TextFieldAdapter } from "@wso2is/form";
import { Hint } from "@wso2is/react-components";
import React, { FunctionComponent, PropsWithChildren, ReactElement } from "react";
import { Icon } from "semantic-ui-react";
import {
    DynamicFieldInterface,
    DynamicFilePickerFieldInterface,
    DynamicInputFieldTypes
} from "../models/dynamic-fields";

/**
 * Prop types for the dynamic input fields.
 */
export interface FormDynamicFieldPropsInterface extends IdentifiableComponentInterface {
    /**
     * Field configs.
     */
    field: DynamicFieldInterface;
    /**
     * Form state from the form library.
     */
    form: FormApi<Record<string, any>>;
    /**
     * Whether the form field is read only or not.
     */
    readOnly?: boolean;
}

/**
 * Component responsible for generating the field based on the provided field configs.
 *
 * @param props - Props injected to the `FormDynamicField` component.
 */
export const FormDynamicField: FunctionComponent<PropsWithChildren<
    FormDynamicFieldPropsInterface
>> = ({
    field,
    form: _form,
    readOnly,
    ["data-componentid"]: componentId = "form-dynamic-field",
    ...rest
}: PropsWithChildren<FormDynamicFieldPropsInterface>): ReactElement => {

    const getDynamicFieldAdapter = (type: DynamicInputFieldTypes): ReactElement => {
        switch (type) {
            case DynamicInputFieldTypes.CHECKBOX:
                return (
                    <FinalFormField
                        fullWidth
                        FormControlProps={ {
                            margin: "dense"
                        } }
                        aria-label={ field?.["aria-label"] }
                        data-componentid={ field?.dataComponentId }
                        name={ field?.name }
                        label={ field?.label }
                        placeholder={ field?.placeholder }
                        component={ CheckboxFieldAdapter }
                        disabled={ readOnly || field?.readOnly }
                        required={ field?.required }
                        hint={
                            field?.helperText ? (
                                <Hint compact>
                                    { field?.helperText }
                                </Hint>
                            ) : null
                        }
                    />
                );
            case DynamicInputFieldTypes.TEXT:
                return (
                    <FinalFormField
                        fullWidth
                        FormControlProps={ {
                            margin: "dense"
                        } }
                        aria-label={ field?.["aria-label"] }
                        data-componentid={ field?.dataComponentId }
                        name={ field?.name }
                        type={ field?.type }
                        label={ field?.label }
                        placeholder={ field?.placeholder }
                        component={ TextFieldAdapter }
                        readOnly={ readOnly || field?.readOnly }
                        required={ field?.required }
                        helperText={
                            field?.helperText ? (
                                <Hint compact>
                                    { field?.helperText }
                                </Hint>
                            ) : null
                        }
                    />
                );
            case DynamicInputFieldTypes.TEXTAREA:
                return (
                    <FinalFormField
                        fullWidth
                        FormControlProps={ {
                            margin: "dense"
                        } }
                        aria-label={ field?.["aria-label"] }
                        data-componentid={ field?.dataComponentId }
                        name={ field?.name }
                        type={ field?.type }
                        label={ field?.label }
                        placeholder={ field?.placeholder }
                        component={ TextFieldAdapter }
                        readOnly={ readOnly || field?.readOnly }
                        rows={ 3 }
                        multiline={ true }
                        required={ field?.required }
                        helperText={
                            field?.helperText ? (
                                <Hint compact>
                                    { field?.helperText }
                                </Hint>
                            ) : null
                        }
                    />
                );
            case DynamicInputFieldTypes.FILE:
                return (
                    <FinalFormField
                        fullWidth
                        FormControlProps={ {
                            margin: "dense"
                        } }
                        aria-label={ field?.["aria-label"] }
                        data-componentid={ field?.dataComponentId }
                        name={ field?.name }
                        label={ field?.label }
                        fileType={ (field as DynamicFilePickerFieldInterface)?.fileType }
                        dropzoneText={ (field as DynamicFilePickerFieldInterface)?.dropzoneText }
                        pasteAreaPlaceholderText={
                            (field as DynamicFilePickerFieldInterface)?.pasteAreaPlaceholderText }
                        uploadButtonText={ (field as DynamicFilePickerFieldInterface)?.uploadButtonText }
                        hidePasteOption={ (field as DynamicFilePickerFieldInterface)?.hidePasteOption }
                        placeholderIcon={ getCertificateIllustrations().uploadPlaceholder }
                        selectedIcon={ <Icon name="file alternate" size="huge"/> }
                        component={ FilePickerAdapter }
                        required={ field?.required }
                        helperText={
                            field?.helperText ? (
                                <Hint compact>
                                    { field?.helperText }
                                </Hint>
                            ) : null
                        }
                    />
                );
            default:
                return (
                    <FinalFormField
                        fullWidth
                        FormControlProps={ {
                            margin: "dense"
                        } }
                        aria-label={ field?.["aria-label"] }
                        data-componentid={ field?.dataComponentId }
                        name={ field?.name }
                        type={ field?.type }
                        label={ field?.label }
                        placeholder={ field?.placeholder }
                        component={ TextFieldAdapter }
                        readOnly={ readOnly || field?.readOnly }
                        required={ field?.required }
                        helperText={
                            field?.helperText ? (
                                <Hint compact>
                                    { field?.helperText }
                                </Hint>
                            ) : null
                        }
                    />
                );
        }
    };

    return (
        <div data-componentid={ componentId } { ...rest }>
            { getDynamicFieldAdapter(field?.type) }
        </div>
    );
};
