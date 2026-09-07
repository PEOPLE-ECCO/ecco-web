// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef, useState } from "react";
import { Box, Flex, Text, Stack, HStack, Button } from "@chakra-ui/react";

import { MapContainer, MapModel, MapRegistry, SimpleLayer } from "@open-pioneer/map";
import { useService } from "open-pioneer:react-hooks";

import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector.js";
import Feature from "ol/Feature";
import Draw from "ol/interaction/Draw.js";
import GeoJSON from "ol/format/GeoJSON";
import { Geometry, Polygon } from "ol/geom";

import { MapInfoControls } from "../../Map/MapInfoControls";
import { MapZoomControls } from "../../Map/MapZoomControl";
import { useServices } from "../../../services/Services";
import { MAP_BOX } from "../../../services";
import { SpatialExtent } from "../../definitions";

/** Layer id prefix, so preview layers can be cleaned up on re-fetch / unmount. */
const PREVIEW_LAYER_PREFIX = "PREVIEW_area_";
/** Layer id for the user-drawn extent. */
const DRAW_LAYER_ID = "PREVIEW_area_draw";

export interface AreaStyle {
    /** Outline colour. */
    color: string;
    /** Fill colour (low opacity so overlapping areas stay readable). */
    fillColor: string;
}

/**
 * Style of the area the drawn extent is validated against. Applied by default,
 * so callers only pass a style to distinguish several context areas.
 */
export const BOUNDING_AREA_STYLE: AreaStyle = {
    color: "#C05621",
    fillColor: "rgba(192, 86, 33, 0.2)",
};
/** Style of a purely informational area shown next to the bounding one. */
export const CONTEXT_AREA_STYLE: AreaStyle = {
    color: "#2C7D75",
    fillColor: "rgba(44, 125, 117, 0.2)",
};
const DRAWN_EXTENT_STYLE: AreaStyle = {
    color: "#3182CE",
    fillColor: "rgba(49, 130, 206, 0.2)",
};
const DRAWN_EXTENT_LABEL = "Selected extent";

/** An area rendered read-only on the preview map, identified by its timeseries id. */
export interface PreviewArea {
    /** Timeseries id whose spatial extent is shown. */
    id: number;
    /** Human-readable label shown in the legend. */
    label: string;
    /** Colours to draw it in. Defaults to {@link CONTEXT_AREA_STYLE}. */
    style?: AreaStyle;
}

/**
 * The area the drawn extent must lie inside. Unlike {@link PreviewArea} its id
 * is optional: the label is needed to tell the user what to select while nothing
 * is selected yet.
 */
export interface BoundingArea extends Omit<PreviewArea, "id"> {
    id?: number;
}

interface AreaMapPreviewProps {
    /**
     * The area bounding the analysis extent. Drawing stays disabled until its
     * geometry is available, and the drawn extent must lie strictly inside it.
     */
    boundingArea: BoundingArea;
    /** Further areas to show for context, e.g. a reference area. */
    contextAreas?: PreviewArea[];
    /**
     * Whether the wizard step holding this map is currently shown. The map only
     * fits to the geometries once visible — fitting while the container is hidden
     * (display:none) computes against a zero-size viewport and zooms to the world.
     */
    isVisible: boolean;
    /**
     * Reports the drawn extent and whether it is valid (strictly inside the
     * bounding area). `extent` is undefined while nothing valid is drawn.
     */
    onExtentChange: (extent: SpatialExtent | undefined, valid: boolean) => void;
}

/** One area to fetch and render, resolved from the props. */
interface Target {
    id: number;
    label: string;
    style: AreaStyle;
    /** Whether this is the area drawn extents are validated against. */
    isBounding: boolean;
}

/** A rendered area, for the legend. */
type RenderedArea = Pick<Target, "id" | "label" | "style">;

/**
 * Returns true when every vertex of `drawn` lies inside `bounds`. This is a
 * lightweight containment check (no geometry library available): for the simple,
 * mostly-convex polygons here, all-vertices-inside is a good proxy for
 * "strictly inside". It can miss a drawn edge that bows outside a concave area,
 * which we accept for now rather than pull in turf/jsts.
 */
function isStrictlyInside(drawn: Polygon, bounds: Geometry): boolean {
    // Outer ring only; the draw interaction never produces holes.
    const ring = drawn.getCoordinates()[0] ?? [];
    return ring.length > 0 && ring.every((coord) => bounds.intersectsCoordinate(coord));
}

/**
 * Build the backend `SpatialExtent` (GeoJSON feature in EPSG:4326 + bbox) from a
 * map-projection (EPSG:3857) feature. Shared by the draw handler and the
 * "use whole area" button.
 */
function toSpatialExtent(feature: Feature<Geometry>): SpatialExtent {
    const bbox = feature.getGeometry()!.getExtent();
    const geometry = new GeoJSON().writeFeatureObject(feature, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857",
    });
    return { geometry, bbox: [bbox[0]!, bbox[1]!, bbox[2]!, bbox[3]!] };
}

/**
 * Map for processes whose extent is implied by their parameters: shows the
 * spatial extents of the selected areas (fetched per timeseries id), and lets
 * the user draw the analysis extent. The drawn extent must lie strictly inside
 * the bounding area; drawing is disabled until that geometry is available.
 */
export function AreaMapPreview({
    boundingArea,
    contextAreas,
    isVisible,
    onExtentChange,
}: AreaMapPreviewProps) {
    const mapService = useService<MapRegistry>("map.MapRegistry");
    const { getTimeseriesById } = useServices();
    const [map, setMap] = useState<MapModel>();
    const [error, setError] = useState<string>();
    // The fetched-and-projected geometries, kept in state so the zoom effect can
    // re-fit them once the step becomes visible (see isVisible).
    const [geometries, setGeometries] = useState<Geometry[]>([]);
    // The areas that actually rendered — an id may resolve to a timeseries
    // without an extent, and only rendered areas get a legend row.
    const [renderedAreas, setRenderedAreas] = useState<RenderedArea[]>([]);
    // The bounding geometry (map projection) that drawn extents are validated
    // against. Undefined while unavailable — drawing is blocked then.
    const [boundingGeometry, setBoundingGeometry] = useState<Geometry>();
    // The currently drawn extent and whether it passed the containment check.
    const [drawnExtent, setDrawnExtent] = useState<SpatialExtent>();
    const [drawValid, setDrawValid] = useState(true);

    // onExtentChange is called from the draw handler; keep a ref so the draw
    // effect doesn't need it as a dependency (which would re-create the draw
    // interaction on every parent render).
    const onExtentChangeRef = useRef(onExtentChange);
    onExtentChangeRef.current = onExtentChange;
    // The vector source backing the drawn-extent layer, shared by the draw
    // interaction and the "use whole area" button so both render into it.
    const drawSourceRef = useRef<VectorSource | undefined>(undefined);
    // The draw interaction, so the "use whole area" button can abort any
    // in-progress sketch (which lives on the interaction's overlay, not the
    // source, so clearing the source alone would leave it on the map).
    const drawRef = useRef<Draw | undefined>(undefined);

    const targets: Target[] = [];
    if (boundingArea.id != null) {
        targets.push({
            id: boundingArea.id,
            label: boundingArea.label,
            style: boundingArea.style ?? BOUNDING_AREA_STYLE,
            isBounding: true,
        });
    }
    for (const area of contextAreas ?? []) {
        targets.push({
            id: area.id,
            label: area.label,
            style: area.style ?? CONTEXT_AREA_STYLE,
            isBounding: false,
        });
    }
    // The parent rebuilds the area props on every render, so the fetch effect
    // keys off the targets' contents rather than the (always new) array
    // identity, which would otherwise re-fetch endlessly.
    const targetsKey = JSON.stringify(targets);

    useEffect(() => {
        mapService.expectMapModel(MAP_BOX).then(setMap);
    }, [mapService]);

    // Fetch the selected areas and render them as read-only layers. This runs
    // whenever the selection changes, regardless of visibility.
    useEffect(() => {
        if (!map) {
            return;
        }

        let cancelled = false;
        setError(undefined);

        const currentTargets = JSON.parse(targetsKey) as Target[];

        const removePreviewLayers = () => {
            map.layers
                .getLayers()
                .filter((l) => l.id.startsWith(PREVIEW_LAYER_PREFIX) && l.id !== DRAW_LAYER_ID)
                .forEach((l) => map.layers.removeLayerById(l.id));
        };

        const render = async () => {
            const format = new GeoJSON();
            const geoms: Geometry[] = [];
            const rendered: RenderedArea[] = [];
            let bounds: Geometry | undefined;
            // One layer per area, each with its own (static) flat style — the
            // flat-style object on a VectorLayer is the syntax that renders
            // reliably in this codebase (cf. the draw layer in the create dialog).
            const layers: { id: string; layer: SimpleLayer }[] = [];

            for (const target of currentTargets) {
                const ts = await getTimeseriesById(String(target.id));
                const rawGeometry = ts.extent?.geometry;
                if (!rawGeometry) {
                    continue;
                }
                // The endpoint returns the geometry as a GeoJSON *geometry* (not a
                // Feature), and as a JSON string rather than an object. Parse it,
                // read it as a geometry, and project it to the map's projection.
                const geoJson =
                    typeof rawGeometry === "string" ? JSON.parse(rawGeometry) : rawGeometry;
                const geom = format.readGeometry(geoJson, {
                    dataProjection: "EPSG:4326",
                    featureProjection: "EPSG:3857",
                });
                geoms.push(geom);
                rendered.push({ id: target.id, label: target.label, style: target.style });
                if (target.isBounding) {
                    bounds = geom;
                }

                const source = new VectorSource({ features: [new Feature({ geometry: geom })] });
                const vector = new VectorLayer({
                    source,
                    style: {
                        "fill-color": target.style.fillColor,
                        "stroke-color": target.style.color,
                        "stroke-width": 2,
                    },
                });
                const id = PREVIEW_LAYER_PREFIX + target.id;
                layers.push({ id, layer: new SimpleLayer({ id, olLayer: vector, title: target.label }) });
            }

            if (cancelled) {
                return;
            }

            removePreviewLayers();
            layers.forEach(({ layer }) => map.layers.addLayer(layer));

            setGeometries(geoms);
            setRenderedAreas(rendered);
            setBoundingGeometry(bounds);
        };

        render().catch((e) => {
            console.error("Could not load area preview", e);
            if (!cancelled) {
                setError("Could not load the selected areas.");
            }
        });

        return () => {
            cancelled = true;
            removePreviewLayers();
            setGeometries([]);
            setRenderedAreas([]);
            setBoundingGeometry(undefined);
        };
    }, [map, targetsKey, getTimeseriesById]);

    // The bounding area is the containment reference; if it changes, any
    // previously drawn extent no longer necessarily applies. Clear it so the
    // user re-draws against the new area.
    useEffect(() => {
        setDrawnExtent(undefined);
        setDrawValid(true);
        onExtentChangeRef.current(undefined, false);
    }, [boundingGeometry]);

    // Draw interaction: only active once the step is visible and a bounding
    // geometry exists to validate against. Re-created if that area changes.
    useEffect(() => {
        if (!map || !isVisible || !boundingGeometry) {
            return;
        }

        const source = new VectorSource();
        drawSourceRef.current = source;
        const vector = new VectorLayer({
            source,
            style: {
                "fill-color": DRAWN_EXTENT_STYLE.fillColor,
                "stroke-color": DRAWN_EXTENT_STYLE.color,
                "stroke-width": 2,
                "circle-radius": 7,
                "circle-fill-color": DRAWN_EXTENT_STYLE.color,
            },
        });
        const drawLayer = new SimpleLayer({ id: DRAW_LAYER_ID, olLayer: vector, title: DRAWN_EXTENT_LABEL });
        map.layers.addLayer(drawLayer);

        const draw = new Draw({ source, type: "Polygon" });
        drawRef.current = draw;
        map.olMap.addInteraction(draw);

        draw.on("drawstart", () => {
            source.clear();
        });

        draw.on("drawend", (e) => {
            const feature = e.feature;
            const polygon = feature.getGeometry() as Polygon;
            const valid = isStrictlyInside(polygon, boundingGeometry);

            draw.abortDrawing();

            if (!valid) {
                setDrawnExtent(undefined);
                setDrawValid(false);
                onExtentChangeRef.current(undefined, false);
                return;
            }

            const extent = toSpatialExtent(feature);
            setDrawnExtent(extent);
            setDrawValid(true);
            onExtentChangeRef.current(extent, true);
        });

        return () => {
            map.olMap.removeInteraction(draw);
            map.layers.removeLayerById(DRAW_LAYER_ID);
            drawSourceRef.current = undefined;
            drawRef.current = undefined;
        };
    }, [map, isVisible, boundingGeometry]);

    // "Use whole area" — reuses the bounding geometry as the extent without
    // drawing. Renders it into the same draw layer so it shows on the map and
    // can still be replaced by drawing.
    const selectWholeArea = () => {
        if (!boundingGeometry || !drawSourceRef.current) {
            return;
        }
        // Discard any in-progress sketch first — it lives on the interaction's
        // overlay, so clearing the source alone would leave it on the map.
        drawRef.current?.abortDrawing();
        const feature = new Feature({ geometry: boundingGeometry.clone() });
        drawSourceRef.current.clear();
        drawSourceRef.current.addFeature(feature);

        const extent = toSpatialExtent(feature);
        setDrawnExtent(extent);
        setDrawValid(true);
        onExtentChangeRef.current(extent, true);
    };

    // Fit to the bounding area once the step is visible — that is the area the
    // user draws inside, so it should fill the view. Fall back to all geometries
    // if it is not present. Fitting while the container is hidden
    // (display:none) measures a zero-size viewport and zooms to the whole world;
    // updateSize() forces a re-measure now that it's shown.
    useEffect(() => {
        if (!map || !isVisible) {
            return;
        }
        const fitTo = boundingGeometry ? [boundingGeometry] : geometries;
        if (fitTo.length === 0) {
            return;
        }
        map.olMap.updateSize();
        map.zoom(fitTo, { viewPadding: { top: 50, bottom: 100 } });
    }, [map, isVisible, boundingGeometry, geometries]);

    const canDraw = boundingGeometry != null;

    return (
        <>
            <Text pt="8" pb="2" textStyle="lg">Selected areas:</Text>
            <Box height="60vh" border="1px solid black">
                <Flex flex="1" height="100%" width="100%" direction="column" overflow="hidden" position="relative">
                    {map &&
                        <MapContainer map={map} role="img" aria-label="Selected areas and analysis extent preview">
                            <Box bg="white" p="2" m="1" borderRadius="md" boxShadow="sm" maxW="sm">
                                {error
                                    ? <Text color="red.600">{error}</Text>
                                    : <Stack gap="2">
                                        <Stack gap="1">
                                            {renderedAreas.map((area) => (
                                                <HStack gap="2" key={area.id}>
                                                    <Box w="3" h="3" borderRadius="sm" bg={area.style.color} />
                                                    <Text fontSize="sm">{area.label}</Text>
                                                </HStack>
                                            ))}
                                            {drawnExtent &&
                                                <HStack gap="2">
                                                    <Box w="3" h="3" borderRadius="sm" bg={DRAWN_EXTENT_STYLE.color} />
                                                    <Text fontSize="sm">{DRAWN_EXTENT_LABEL}</Text>
                                                </HStack>
                                            }
                                        </Stack>
                                        {canDraw
                                            ? <Stack gap="2" align="flex-start">
                                                <Text fontSize="xs" color={drawValid ? "fg.muted" : "red.600"}>
                                                    {drawValid
                                                        ? `Draw the analysis extent on the map, or use the whole area. It must lie strictly inside the area where data is available (${boundingArea.label}).`
                                                        : `The drawn extent must lie strictly inside the area where data is available (${boundingArea.label}). Please draw again inside it.`}
                                                </Text>
                                                <Button
                                                    size="xs"
                                                    variant="outline"
                                                    color="black"
                                                    border="1px solid #2C7D75"
                                                    _hover={{ bg: "teal.50" }}
                                                    onClick={selectWholeArea}>
                                                    Use whole area
                                                </Button>
                                            </Stack>
                                            : <Text fontSize="xs" color="fg.muted">
                                                Nothing to draw inside yet — select {boundingArea.label} in the
                                                parameters step first.
                                            </Text>
                                        }
                                    </Stack>
                                }
                            </Box>
                            <MapInfoControls map={map} />
                            <MapZoomControls map={map} />
                        </MapContainer>
                    }
                </Flex>
            </Box>
        </>
    );
}
