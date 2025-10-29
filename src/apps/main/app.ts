// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { KeycloakProperties } from "@open-pioneer/authentication-keycloak";
import { createCustomElement } from "@open-pioneer/runtime";
import * as appMetadata from "open-pioneer:app";
import { AppUI } from "./AppUI";
import { NotifierProperties } from "@open-pioneer/notifier";

const mainUI = createCustomElement({
    component: AppUI,
    appMetadata,
    advanced: {
        enableShadowRoot: false
    },
    config: {
        properties: {
            "@open-pioneer/authentication-keycloak": {
                keycloakOptions: {
                    refreshOptions: {
                        autoRefresh: true,
                        interval: 6000,
                        timeLeft: 70
                    },
                    keycloakInitOptions: {
                        onLoad: "check-sso",
                        pkceMethod: "S256"
                        // additional configuration, for example:
                        // scope: "openid address phone"
                    },
                    keycloakConfig: {
                        url: "https://people-ecco.dev.52north.org/auth",
                        realm: "people-ecco",
                        clientId: "ecco-proxy"
                    }
                }
            } satisfies KeycloakProperties, // for auto completion / validation
            "@open-pioneer/notifier": {
                position: "bottom-right"
            } satisfies NotifierProperties
        }
    }
});
customElements.define("main-app", mainUI);