// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { AuthService } from "@open-pioneer/authentication";
import { ServiceOptions } from "@open-pioneer/runtime";
import { Interceptor, BeforeRequestParams } from "@open-pioneer/http";

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
import WebGLTileLayer from "ol/layer/WebGLTile";
import { GeoTIFF } from "ol/source";

export const MAP_ID = "main";
export class MainMapProvider implements MapConfigProvider {
    mapId = MAP_ID;

    async getMapConfig(): Promise<MapConfig> {
        return {
            initialView: {
                kind: "position",
                center: { x: 850000, y: 6793120 },
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
                }),
                /*
                new SimpleLayer({
                    id: "right",
                    title: "Mean Temperature (2000-01)",
                    olLayer: new WebGLTileLayer({
                        source: new GeoTIFF({
                            normalize: false,
                            sources: [
                                {
                                    url: "https://s3.people-ecco.dev.52north.org/tangerine-chupacabra//tmp/52_North_Examples/Lebanon/41R1_S1_S2_deltaIR_NBR_SSS.tif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=GKcee6e50255a82b471f712fea%2F20251130%2Fgarage%2Fs3%2Faws4_request&X-Amz-Date=20251130T161723Z&X-Amz-Expires=7200&X-Amz-SignedHeaders=host&X-Amz-Signature=41f828efc52697329d9576cb5786f37bb4d4eb0802d859b2c7ca5a3cd0542026",
                                    nodata: -9999
                                }
                            ]
                        }),
                        properties: { title: "Mean Temperature (2000-01)" }
                    }),
                    isBaseLayer: false
                }),
                */
            ]
        };
    }
}

export const MAP_BOX = "boxselection";
export class BoxMapProvider implements MapConfigProvider {
    mapId = MAP_BOX;

    async getMapConfig(): Promise<MapConfig> {
        return {
            initialView: {
                kind: "position",
                center: { x: 850000, y: 6793120 },
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



export const MAP_SiteView = "siteview";
export class SiteViewMapProvider implements MapConfigProvider {
    mapId = MAP_SiteView;

    async getMapConfig(): Promise<MapConfig> {
        return {
            initialView: {
                kind: "position",
                center: { x: 850000, y: 6793120 },
                zoom: 1
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
                }),
              ]
        };
    }
}