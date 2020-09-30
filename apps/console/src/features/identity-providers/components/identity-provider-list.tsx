/**
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import { AlertLevels, LoadableComponentInterface, TestableComponentInterface } from "@wso2is/core/models";
import { addAlert } from "@wso2is/core/store";
import {
    AnimatedAvatar,
    AppAvatar,
    ConfirmationModal,
    DataTable,
    EmptyPlaceholder,
    LinkButton,
    PrimaryButton,
    TableActionsInterface,
    TableColumnInterface
} from "@wso2is/react-components";
import React, { FunctionComponent, ReactElement, ReactNode, SyntheticEvent, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Header, Icon, SemanticICONS } from "semantic-ui-react";
import { handleIDPDeleteError } from "./utils";
import {
    AppConstants,
    EmptyPlaceholderIllustrations,
    UIConstants,
    history
} from "../../core";
import { deleteIdentityProvider } from "../api";
import { IdentityProviderManagementConstants } from "../constants";
import {
    IdentityProviderInterface,
    IdentityProviderListResponseInterface,
    StrictIdentityProviderInterface
} from "../models";

/**
 * Proptypes for the identity provider list component.
 */
interface IdentityProviderListPropsInterface extends LoadableComponentInterface, TestableComponentInterface {
    /**
     * Advanced Search component.
     */
    advancedSearch?: ReactNode;
    /**
     * Default list item limit.
     */
    defaultListItemLimit?: number;
    /**
     * IdP list.
     */
    list: IdentityProviderListResponseInterface;
    /**
     * Callback to be fired when clicked on the empty list placeholder action.
     */
    onEmptyListPlaceholderActionClick?: () => void;
    /**
     * On IdP delete callback.
     */
    onIdentityProviderDelete?: () => void;
    /**
     * On list item select callback.
     * @param {React.SyntheticEvent} event - Click event.
     * @param {IdentityProviderInterface} idp - Selected IDP
     */
    onListItemClick?: (event: SyntheticEvent, idp: IdentityProviderInterface) => void;
    /**
     * Callback for the search query clear action.
     */
    onSearchQueryClear?: () => void;
    /**
     * Search query for the list.
     */
    searchQuery?: string;
    /**
     * Enable selection styles.
     */
    selection?: boolean;
    /**
     * Show list item actions.
     */
    showListItemActions?: boolean;
}

/**
 * Identity provider list component.
 *
 * @param {IdentityProviderListPropsInterface} props Props injected to the component.
 * @return {React.ReactElement}
 */
export const IdentityProviderList: FunctionComponent<IdentityProviderListPropsInterface> = (
    props: IdentityProviderListPropsInterface
): ReactElement => {

    const {
        advancedSearch,
        defaultListItemLimit,
        isLoading,
        list,
        onEmptyListPlaceholderActionClick,
        onIdentityProviderDelete,
        onListItemClick,
        onSearchQueryClear,
        searchQuery,
        selection,
        showListItemActions,
        [ "data-testid" ]: testId
    } = props;

    const dispatch = useDispatch();

    const [ showDeleteConfirmationModal, setShowDeleteConfirmationModal ] = useState<boolean>(false);
    const [ deletingIDP, setDeletingIDP ] = useState<StrictIdentityProviderInterface>(undefined);

    const { t } = useTranslation();

    /**
     * Redirects to the identity provider edit page when the edit button is clicked.
     *
     * @param {string} idpId Identity provider id.
     */
    const handleIdentityProviderEdit = (idpId: string): void => {
        history.push(AppConstants.getPaths().get("IDP_EDIT").replace(":id", idpId));
    };

    /**
     * Deletes an identity provider when the delete identity provider button is clicked.
     *
     * @param {string} idpId Identity provider id.
     */
    const handleIdentityProviderDeleteAction = (idpId: string): void => {
        setDeletingIDP(list.identityProviders.find(idp => idp.id === idpId));
        setShowDeleteConfirmationModal(true);
    };

    /**
     * Deletes an identity provider when the delete identity provider button is clicked.
     *
     * @param {string} idpId Identity provider id.
     */
    const handleIdentityProviderDelete = (idpId: string): void => {
        deleteIdentityProvider(idpId)
            .then(() => {
                dispatch(addAlert({
                    description: t("devPortal:components.idp.notifications.deleteIDP.success.description"),
                    level: AlertLevels.SUCCESS,
                    message: t("devPortal:components.idp.notifications.deleteIDP.success.message")
                }));
            })
            .catch((error) => {
                handleIDPDeleteError(error);
            })
            .finally(() => {
                setShowDeleteConfirmationModal(false);
                setDeletingIDP(undefined);
                onIdentityProviderDelete();
            });
    };

    /**
     * Resolve the relevant placeholder.
     *
     * @return {React.ReactElement}
     */
    const showPlaceholders = (): ReactElement => {
        // When the search returns empty.
        if (searchQuery) {
            return (
                <EmptyPlaceholder
                    action={ (
                        <LinkButton onClick={ onSearchQueryClear }>Clear search query</LinkButton>
                    ) }
                    image={ EmptyPlaceholderIllustrations.emptySearch }
                    imageSize="tiny"
                    title={ t("devPortal:components.idp.placeHolders.emptyIDPSearchResults.title") }
                    subtitle={ [
                        t("devPortal:components.idp.placeHolders.emptyIDPSearchResults.subtitles.0",
                            { searchQuery: searchQuery }),
                        t("devPortal:components.idp.placeHolders.emptyIDPSearchResults.subtitles.1")
                    ] }
                    data-testid={ `${ testId }-empty-search-results-placeholder` }
                />
            );
        }

        if (list?.totalResults === 0) {
            return (
                <EmptyPlaceholder
                    action={ onEmptyListPlaceholderActionClick && (
                        <PrimaryButton
                            onClick={ onEmptyListPlaceholderActionClick }
                        >
                            <Icon name="add"/>
                            { t("devPortal:components.idp.buttons.addIDP") }
                        </PrimaryButton>
                    ) }
                    image={ EmptyPlaceholderIllustrations.newList }
                    imageSize="tiny"
                    title={ t("devPortal:components.idp.placeHolders.emptyIDPList.title") }
                    subtitle={ [
                        t("devPortal:components.idp.placeHolders.emptyIDPList.subtitles.0"),
                        t("devPortal:components.idp.placeHolders.emptyIDPList.subtitles.1"),
                        t("devPortal:components.idp.placeHolders.emptyIDPList.subtitles.2")
                    ] }
                    data-testid={ `${ testId }-empty-idp-list-placeholder` }
                />
            );
        }

        return null;
    };

    /**
     * Resolves data table columns.
     *
     * @return {TableColumnInterface[]}
     */
    const resolveTableColumns = (): TableColumnInterface[] => {
        return [
            {
                allowToggleVisibility: false,
                dataIndex: "name",
                id: "name",
                key: "name",
                render: (idp: IdentityProviderInterface): ReactNode => (
                    <Header as="h6" image>
                        {
                            idp.image
                                ? (
                                    <AppAvatar
                                        name={ idp.name }
                                        image={ idp.image }
                                        size="mini"
                                        data-testid={ `${ testId }-item-image` }
                                    />
                                )
                                : (
                                    <AnimatedAvatar
                                        name={ idp.name }
                                        size="mini"
                                        data-testid={ `${ testId }-item-image` }
                                    />
                                )
                        }
                        <Header.Content>
                            { idp.name }
                            <Header.Subheader>
                                { idp.description }
                            </Header.Subheader>
                        </Header.Content>
                    </Header>
                ),
                title: t("devPortal:components.idp.list.name")
            },
            {
                allowToggleVisibility: false,
                dataIndex: "action",
                id: "actions",
                key: "actions",
                textAlign: "right",
                title: t("devPortal:components.idp.list.actions")
            }
        ];
    };

    /**
     * Resolves data table actions.
     *
     * @return {TableActionsInterface[]}
     */
    const resolveTableActions = (): TableActionsInterface[] => {
        if (!showListItemActions) {
            return;
        }

        return [
            {
                hidden: (): boolean => false,
                icon: (): SemanticICONS => "pencil alternate",
                onClick: (e: SyntheticEvent, idp: IdentityProviderInterface): void =>
                    handleIdentityProviderEdit(idp.id),
                popupText:(): string => t("common:edit"),
                renderer: "semantic-icon"
            },
            {
                hidden: (idp: IdentityProviderInterface): boolean =>
                    IdentityProviderManagementConstants.DELETING_FORBIDDEN_IDPS.includes(idp.name),
                icon: (): SemanticICONS => "trash alternate",
                onClick: (e: SyntheticEvent, idp: IdentityProviderInterface): void =>
                    handleIdentityProviderDeleteAction(idp.id),
                popupText: (): string => t("common:delete"),
                renderer: "semantic-icon"
            }
        ];
    };

    return (
        <>
            <DataTable<IdentityProviderInterface>
                className="identity-providers-table"
                externalSearch={ advancedSearch }
                isLoading={ isLoading }
                loadingStateOptions={ {
                    count: defaultListItemLimit ?? UIConstants.DEFAULT_RESOURCE_LIST_ITEM_LIMIT,
                    imageType: "square"
                } }
                actions={ resolveTableActions()  }
                columns={ resolveTableColumns() }
                data={ list?.identityProviders?.filter((idp: IdentityProviderInterface) => idp.name !== "LOCAL") }
                onRowClick={ (e: SyntheticEvent, idp: IdentityProviderInterface): void => {
                    handleIdentityProviderEdit(idp.id);
                    onListItemClick(e, idp);
                } }
                placeholders={ showPlaceholders() }
                selectable={ selection }
                showHeader={ false }
                transparent={ !isLoading && (showPlaceholders() !== null) }
                data-testid={ `${ testId }-resource-list` }
            />
            {
                deletingIDP && (
                    <ConfirmationModal
                        onClose={ (): void => setShowDeleteConfirmationModal(false) }
                        type="warning"
                        open={ showDeleteConfirmationModal }
                        assertion={ deletingIDP?.name }
                        assertionHint={ (
                            <p>
                                <Trans
                                    i18nKey="devPortal:components.idp.confirmations.deleteIDP.assertionHint"
                                    tOptions={ { name: deletingIDP?.name } }
                                >
                                    Please type <strong>{ deletingIDP?.name }</strong> to confirm.
                                </Trans>
                            </p>
                        ) }
                        assertionType="input"
                        primaryAction={ t("common:confirm") }
                        secondaryAction={ t("common:cancel") }
                        onSecondaryActionClick={ (): void => setShowDeleteConfirmationModal(false) }
                        onPrimaryActionClick={
                            (): void => handleIdentityProviderDelete(deletingIDP.id)
                        }
                        data-testid={ `${ testId }-delete-confirmation` }
                        closeOnDimmerClick={ false }
                    >
                        <ConfirmationModal.Header>
                            { t("devPortal:components.idp.confirmations.deleteIDP.header") }
                        </ConfirmationModal.Header>
                        <ConfirmationModal.Message attached warning>
                            { t("devPortal:components.idp.confirmations.deleteIDP.message") }
                        </ConfirmationModal.Message>
                        <ConfirmationModal.Content>
                            { t("devPortal:components.idp.confirmations.deleteIDP.content") }
                        </ConfirmationModal.Content>
                    </ConfirmationModal>
                )
            }
        </>
    );
};

/**
 * Default proptypes for the IDP list.
 */
IdentityProviderList.defaultProps = {
    "data-testid": "idp-list",
    selection: true,
    showListItemActions: true
};
