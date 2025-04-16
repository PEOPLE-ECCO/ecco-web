// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { AuthService } from "@open-pioneer/authentication";
import { ServiceOptions} from "@open-pioneer/runtime";
import { Interceptor, BeforeRequestParams} from "@open-pioneer/http";

interface References {
    authService: AuthService;
}

export class TokenInterceptor implements Interceptor {
    private authService: AuthService;

    constructor(options: ServiceOptions<References>) {
        this.authService = options.references.authService;
    }

    beforeRequest({ target, options }: BeforeRequestParams): void {
        const authState = this.authService.getAuthState();
        const sessionInfo = authState.kind == "authenticated" ? authState.sessionInfo : undefined;
        const keycloak = sessionInfo?.attributes?.keycloak;
        if (keycloak) {
            const token = (keycloak as { token: string }).token;
            if (target.href.startsWith(import.meta.env.VITE_API_ROOT) && token) {
                options.headers.set("Authorization", "Bearer " + token);
            }
        }
    }
}

import { MapConfig, MapConfigProvider, SimpleLayer } from "@open-pioneer/map";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";

export const MAP_ID = "main";
export class MainMapProvider implements MapConfigProvider {
    mapId = MAP_ID;

    async getMapConfig(): Promise<MapConfig> {
        return {
            initialView: {
                kind: "position",
                center: { x: 850000, y: 6793120},
                zoom: 10
            },
            projection: "EPSG:3857",
            layers: [
                new SimpleLayer({
                    title: "OpenStreetMap",
                    olLayer: new TileLayer({
                        source: new OSM(),
                        properties: { title: "OSM" }
                    }),
                    isBaseLayer: true
                })
            ]
        };
    }    
}