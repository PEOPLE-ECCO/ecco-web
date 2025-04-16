// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    i18n: ["en"],
    services:
    {
        TokenInterceptor: {
            provides: "http.Interceptor",
            references: {
                "authService": "authentication.AuthService"
            }
        },
        MainMapProvider: {
            provides: "map.MapConfigProvider"
        }
    },
    ui: {
        references: [
            "authentication.AuthService",
            "http.HttpService",
            "map.MapRegistry"
        ]
    }
});
