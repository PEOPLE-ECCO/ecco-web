// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { KeycloakProperties } from "@open-pioneer/authentication-keycloak";
import { createCustomElement } from "@open-pioneer/runtime";
import * as appMetadata from "open-pioneer:app";
import { AppUI } from "./AppUI";

const element = createCustomElement({
    component: AppUI,
    appMetadata,
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
                        url: "https://people-ecco.local/auth",
                        realm: "ecco",
                        clientId: "ecco-proxy"
                    }
                }
            } satisfies KeycloakProperties // for auto completion / validation
        }
    }
    // ...
});

customElements.define("empty-app", element);
