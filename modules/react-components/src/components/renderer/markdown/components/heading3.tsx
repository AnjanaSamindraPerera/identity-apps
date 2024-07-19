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

import Typography from "@oxygen-ui/react/Typography";
import { MarkdownCustomComponentPropsInterface } from "@wso2is/react-components";
import classNames from "classnames";
import React, { FunctionComponent, ReactElement } from "react";
import { childRenderer } from "./utils";
import "./heading.scss";

/**
 * Props interface for the `Heading3` component.
 */
interface Heading3Props extends MarkdownCustomComponentPropsInterface<"h3"> {
    /**
     * Custom attributes supplied by the 'rehype-attr' plugin.
     */
    "data-config"?: {
        /**
         * Flag to determine if the heading includes a number.
         */
        numbered?: boolean;
        /**
         * Content of the number element.
         */
        content?: string;
        /**
         * Enable indentation for child elements.
         * By default indentation is enabled.
         */
        indent?: boolean;
    };
}

/**
 * Markdown custom component for the h3 element.
 *
 * @param Props - Props to be injected into the component.
 */
const Heading3: FunctionComponent<Heading3Props> = ({
    children,
    "data-config": dataConfig,
    "data-componentid": componentId = "custom-markdown-heading3"
}: Heading3Props): ReactElement => {

    if (!children) {
        return null;
    }

    const resolveContent = (): ReactElement => {
        if (dataConfig?.numbered) {
            return (
                <>
                    <span className="markdown-heading-number markdown-heading3-number">
                        {
                            dataConfig?.content?.toString()?.length > 2
                                ? dataConfig?.content?.toString()?.substring(0,2)
                                : dataConfig?.content
                        }
                    </span>
                    <span>
                        {
                            typeof children === "string" ? (
                                children
                            ): (
                                childRenderer({ children })
                            )
                        }
                    </span>
                </>
            );
        } else {
            return (
                <>
                    {
                        typeof children === "string" ? (
                            children
                        ): (
                            childRenderer({ children })
                        )
                    }
                </>
            );
        }
    };

    const classes: string = classNames({
        "markdown-heading-container": dataConfig?.numbered,
        "markdown-heading3-children-indent": dataConfig?.indent === false ? false : true
    });

    return (
        <Typography className={ classes } variant="h4" component="h3" data-componentid={ componentId }>
            { resolveContent() }
        </Typography>
    );
};

export { Heading3 as h3 };
