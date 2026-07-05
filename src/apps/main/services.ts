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
import WebGLTileLayer from "ol/layer/WebGLTile.js";
import OSM from "ol/source/OSM";
import { GeoTIFF } from "ol/source";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS.js";
import WMTSCapabilities from "ol/format/WMTSCapabilities.js";

/**
 * A single legend entry.
 * - `discrete`: one row = one swatch + label (categorical / class values).
 * - `ramp`: a continuous color gradient between the given stops, with the
 *   stop labels shown along the bar (for interpolated continuous layers).
 */
export type LegendEntry =
    | { kind: "discrete"; color: string; label: string }
    | { kind: "ramp"; stops: { color: string; label: string }[] };

/**
 * A fixed additional overlay map served as a Cloud-Optimized GeoTIFF (COG) from S3.
 * These are shown as toggleable, non-basemap layers in the map's TOC.
 */
interface AdditionalCogLayer {
    id: string;
    /** Title shown in the TOC layer list. */
    title: string;
    /** COG URL (S3). Must be CORS-enabled for HTTP range requests. */
    url: string;
    /** Optional OpenLayers WebGL flat style expression applied to the tile layer. */
    style?: object;
    /** Optional nodata value for the GeoTIFF source. */
    nodata?: number;
    /** Optional description; shown in the TOC per-layer menu. */
    description?: string;
    /**
     * Optional human-readable legend, shown when the layer row is expanded.
     * Kept in sync with {@link style} by hand — the colors here should match
     * the style expression's colors.
     */
    legend?: LegendEntry[];
}

/**
 * The fixed list of additional COG overlay maps.
 * Add or remove entries here to change which additional maps are available.
 */
const ADDITIONAL_COG_LAYERS: AdditionalCogLayer[] = [
    {
        id: "tree-cover-density-2021",
        title: "Tree Cover Density (2021)",
        description: "Copernicus Tree Cover Density, reference year 2021.",
        url: "https://s3.people-ecco.dev.52north.org/auxdata/clipped_tcd_2021.tif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=GKcee6e50255a82b471f712fea%2F20260702%2Fgarage%2Fs3%2Faws4_request&X-Amz-Date=20260702T181525Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=aff72dcefb5b6c5af73d885c7e2118eccc1a94b3da81bc2241f33d87357a2294",
        // TCD is a single band of percentage values (0-100). Color-ramp it from
        // bare (light) to dense canopy (dark green); render nodata transparent.
        nodata: 255,
        style: {
            color: [
                "interpolate",
                ["linear"],
                ["band", 1],
                0, "#ffffe5",
                25, "#c2e699",
                50, "#78c679",
                75, "#31a354",
                100, "#006837"
            ]
        },
        legend: [
            {
                kind: "ramp",
                stops: [
                    { color: "#ffffe5", label: "0%" },
                    { color: "#c2e699", label: "25%" },
                    { color: "#78c679", label: "50%" },
                    { color: "#31a354", label: "75%" },
                    { color: "#006837", label: "100%" }
                ]
            }
        ]
    },
    {
        id: "crop-type",
        title: "Crop Type",
        description: "Clipped crop type classification.",
        url: "https://s3.people-ecco.dev.52north.org/auxdata/clilpped_crop_type.tif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=GKcee6e50255a82b471f712fea%2F20260702%2Fgarage%2Fs3%2Faws4_request&X-Amz-Date=20260702T184809Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=52d5825ebe817bfc3ae18458bacd448111663946c0cfad1487c900828e218255",
        // Categorical layer using a 4-digit hierarchical code system. Colors are grouped
        // by category: cereals = warm yellows/browns, vegetables/pulses = greens,
        // root crops = pinks/purples, oilseeds/fibre = oranges, permanent crops = distinct
        // saturated hues, unclassified = greys. 0 and no-data are rendered transparent.
        nodata: 0,
        style: {
            color: [
                "match",
                ["band", 1],
                // Arable & annual crops — cereals (1100s): warm ramp
                1110, "#8c510a", // Wheat
                1120, "#bf812d", // Barley
                1130, "#dfc27d", // Maize
                1140, "#f6e8c3", // Rice
                1150, "#d9b365", // Other cereals
                // Vegetables & pulses (1200s): greens
                1210, "#41ab5d", // Fresh Vegetables
                1220, "#a1d99b", // Dry Pulses
                // Root crops (1300s): pinks/purples
                1310, "#c994c7", // Potatoes
                1320, "#dd3497", // Sugar Beet
                // Oilseeds & fibre (1400s): oranges/reds
                1410, "#fec44f", // Sunflower
                1420, "#fe9929", // Soybeans
                1430, "#ec7014", // Rapeseed
                1440, "#cc4c02", // Flax, cotton, hemp
                // Permanent crops (2000s): distinct saturated hues
                2100, "#6a51a3", // Grapes (Vineyards)
                2200, "#807dba", // Olives
                2310, "#e31a1c", // Fruits (Orchards)
                2320, "#b15928", // Nuts
                // Unclassified & system masks
                3100, "#969696", // Unclassified annual crop
                3200, "#525252", // Unclassified permanent crop
                // 0 (no cropland) and 65535/253-255 (no data) fall through to transparent
                "#00000000"
            ]
        },
        legend: [
            { kind: "discrete", color: "#8c510a", label: "Wheat" },
            { kind: "discrete", color: "#bf812d", label: "Barley" },
            { kind: "discrete", color: "#dfc27d", label: "Maize" },
            { kind: "discrete", color: "#f6e8c3", label: "Rice" },
            { kind: "discrete", color: "#d9b365", label: "Other cereals" },
            { kind: "discrete", color: "#41ab5d", label: "Fresh Vegetables" },
            { kind: "discrete", color: "#a1d99b", label: "Dry Pulses" },
            { kind: "discrete", color: "#c994c7", label: "Potatoes" },
            { kind: "discrete", color: "#dd3497", label: "Sugar Beet" },
            { kind: "discrete", color: "#fec44f", label: "Sunflower" },
            { kind: "discrete", color: "#fe9929", label: "Soybeans" },
            { kind: "discrete", color: "#ec7014", label: "Rapeseed" },
            { kind: "discrete", color: "#cc4c02", label: "Flax, cotton & hemp" },
            { kind: "discrete", color: "#6a51a3", label: "Grapes (Vineyards)" },
            { kind: "discrete", color: "#807dba", label: "Olives" },
            { kind: "discrete", color: "#e31a1c", label: "Fruits (Orchards)" },
            { kind: "discrete", color: "#b15928", label: "Nuts" },
            { kind: "discrete", color: "#969696", label: "Unclassified annual crop" },
            { kind: "discrete", color: "#525252", label: "Unclassified permanent crop" }
            // 0 (no cropland) and no-data (65535 / 253-255) render transparent, omitted here.
        ]
    },
    {
        id: "mowing-events",
        title: "Mowing Events",
        description: "Clipped mowing events (count per pixel).",
        url: "https://s3.people-ecco.dev.52north.org/auxdata/clilpped_mowing_events.tif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=GKcee6e50255a82b471f712fea%2F20260702%2Fgarage%2Fs3%2Faws4_request&X-Amz-Date=20260702T184809Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=69757f812ab185d8ef59ffdf80e68655665770d456ce7957053d1b95aa5cd3ee",
        // 5 discrete classes: 0-4 mowing events, each with its own color.
        style: {
            color: [
                "match",
                ["band", 1],
                0, "#00000000",
                1, "#c2e699",
                2, "#78c679",
                3, "#31a354",
                4, "#006837",
                "#00000000"
            ]
        },
        legend: [
            { kind: "discrete", color: "#00000000", label: "0 events" },
            { kind: "discrete", color: "#c2e699", label: "1 event" },
            { kind: "discrete", color: "#78c679", label: "2 events" },
            { kind: "discrete", color: "#31a354", label: "3 events" },
            { kind: "discrete", color: "#006837", label: "4 events" }
        ]
    },
    {
        id: "total-prod",
        title: "Total Production",
        description: "Clipped total production.",
        url: "https://s3.people-ecco.dev.52north.org/auxdata/clipped_TotalPROD.tif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=GKcee6e50255a82b471f712fea%2F20260702%2Fgarage%2Fs3%2Faws4_request&X-Amz-Date=20260702T184809Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=a5a88a1745696c859ab5c3b63a6885723d6ac835e02a612e252c12a149bd48b9",
        // TODO: continuous layer — guessed range 0-1000. Adjust once the real min/max
        // (available in the .aux.xml sidecar statistics) are known.
        nodata: 0,
        style: {
            color: [
                "interpolate",
                ["linear"],
                ["band", 1],
                0, "#fff7ec",
                250, "#fdbb84",
                500, "#ef6548",
                750, "#d7301f",
                1000, "#7f0000"
            ]
        },
        // TODO: labels reflect the guessed 0-1000 range; update with real min/max.
        legend: [
            {
                kind: "ramp",
                stops: [
                    { color: "#fff7ec", label: "0" },
                    { color: "#fdbb84", label: "250" },
                    { color: "#ef6548", label: "500" },
                    { color: "#d7301f", label: "750" },
                    { color: "#7f0000", label: "1000" }
                ]
            }
        ]
    },
    {
        id: "grasslands-2021",
        title: "Grasslands (2021)",
        description: "Clipped grasslands, reference year 2021.",
        url: "https://s3.people-ecco.dev.52north.org/auxdata/clipped_grasslands_2021.tif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=GKcee6e50255a82b471f712fea%2F20260702%2Fgarage%2Fs3%2Faws4_request&X-Amz-Date=20260702T184809Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=8dd1b255a542ac6181868651dae921c142ea1fe7f1b2df5c3ffa61109f388eae",
        // TODO: likely a binary/categorical grassland mask. Generic single-class fill for now.
        nodata: 0,
        style: {
            color: [
                "interpolate",
                ["linear"],
                ["band", 1],
                0, "#f7fcb9",
                1, "#31a354"
            ]
        },
        legend: [
            { kind: "discrete", color: "#31a354", label: "Grassland" }
        ]
    },
    {
        id: "ploughing",
        title: "Ploughing",
        description: "Clipped ploughing.",
        url: "https://s3.people-ecco.dev.52north.org/auxdata/clipped_ploughing.tif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=GKcee6e50255a82b471f712fea%2F20260702%2Fgarage%2Fs3%2Faws4_request&X-Amz-Date=20260702T184809Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=b88d6b213c3ffa17db090776e94b66cb2830426d53078a3d697abd054476617e",
        // Categorical layer. 0-4 = years since last detected ploughing (ordinal ramp);
        // 100 = herbaceous cover change without ploughing; 253 = coastal/water mask.
        style: {
            color: [
                "match",
                ["band", 1],
                // 0-4: years since ploughing, dark (recent) -> light (older)
                0, "#993404",
                1, "#d95f0e",
                2, "#fe9929",
                3, "#fec44f",
                4, "#fee391",
                // special classes
                100, "#3182bd",
                253, "#00000000",
                "#00000000"
            ]
        },
        legend: [
            { kind: "discrete", color: "#993404", label: "Ploughed this year" },
            { kind: "discrete", color: "#d95f0e", label: "1 year since ploughing" },
            { kind: "discrete", color: "#fe9929", label: "2 years since ploughing" },
            { kind: "discrete", color: "#fec44f", label: "3 years since ploughing" },
            { kind: "discrete", color: "#fee391", label: "4 years since ploughing" },
            { kind: "discrete", color: "#3182bd", label: "Herbaceous change (no ploughing)" }
            // 253 (coastal/water mask) is rendered transparent, so it is omitted here.
        ]
    }
];

/** Ids of the additional COG overlay layers, in TOC order. Used to enforce
 * at-most-one-visible exclusivity among these layers. */
export const ADDITIONAL_COG_LAYER_IDS: string[] = ADDITIONAL_COG_LAYERS.map((l) => l.id);

/** Legend entries per additional COG layer id, for rendering in the sidebar. */
export const ADDITIONAL_COG_LAYER_LEGENDS: Record<string, LegendEntry[]> =
    Object.fromEntries(
        ADDITIONAL_COG_LAYERS.filter((l) => l.legend != null).map((l) => [l.id, l.legend!])
    );

/**
 * Layer attribute key holding a direct download URL for an operational layer.
 * Read by the map sidebar layer list to render a download link.
 */
export const DOWNLOAD_URL_ATTRIBUTE = "downloadUrl";

/** Build a hidden overlay SimpleLayer for an additional COG map. */
function buildCogLayer(cfg: AdditionalCogLayer): SimpleLayer {
    return new SimpleLayer({
        id: cfg.id,
        title: cfg.title,
        description: cfg.description,
        visible: false, // off by default; the user opts in via the TOC
        isBaseLayer: false,
        attributes: { [DOWNLOAD_URL_ATTRIBUTE]: cfg.url },
        olLayer: new WebGLTileLayer({
            source: new GeoTIFF({
                normalize: false,
                interpolate: false,
                sources: [
                    {
                        url: cfg.url,
                        ...(cfg.nodata != null ? { nodata: cfg.nodata } : {})
                    }
                ]
            }),
            ...(cfg.style ? { style: cfg.style } : {})
        })
    });
}

export const MAP_ID = "main";
export class MainMapProvider implements MapConfigProvider {
    mapId = MAP_ID;

    async getMapConfig(): Promise<MapConfig> {

        const parser = new WMTSCapabilities();
        const response = await fetch("https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/WMTS/1.0.0/WMTSCapabilities.xml");
        const responseText = await response.text();

        const result = parser.read(responseText);
        const options = optionsFromCapabilities(result, {
            layer: "World_Imagery",
            matrixSet: "EPSG:3857",
        });

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


                new SimpleLayer({
                    title: "SatelliteImage",
                    olLayer: new TileLayer({
                        opacity: 1,
                        source: new WMTS(options!),
                        maxZoom: 17
                    }),
                    isBaseLayer: true,
                }),

                // Fixed additional COG overlay maps (toggleable via the TOC).
                ...ADDITIONAL_COG_LAYERS.map(buildCogLayer)
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