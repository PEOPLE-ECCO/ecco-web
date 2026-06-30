// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react";
import { Box, Flex, Text, Stack, HStack } from "@chakra-ui/react";

import { MapContainer, MapModel, MapRegistry, SimpleLayer } from "@open-pioneer/map";
import { useService } from "open-pioneer:react-hooks";

import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector.js";
import Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import { Geometry } from "ol/geom";

import { MapInfoControls } from "../../Map/MapInfoControls";
import { MapZoomControls } from "../../Map/MapZoomControl";
import { useServices } from "../../../services/Services";
import { MAP_BOX } from "../../../services";

/** Layer id prefix, so preview layers can be cleaned up on re-fetch / unmount. */
const PREVIEW_LAYER_PREFIX = "PREVIEW_reference_area_";

interface AreaStyle {
    /** Outline colour. */
    color: string;
    /** Fill colour (low opacity so overlapping areas stay readable). */
    fillColor: string;
    /** Human-readable label shown in the legend. */
    label: string;
}

const REFERENCE_AREA_STYLE: AreaStyle = {
    color: "#2C7D75",
    fillColor: "rgba(44, 125, 117, 0.2)",
    label: "Reference area",
};
const RESTORATION_SITE_STYLE: AreaStyle = {
    color: "#C05621",
    fillColor: "rgba(192, 86, 33, 0.2)",
    label: "Restoration site",
};

interface ReferenceAreaMapPreviewProps {
    /** Timeseries id of the selected reference area, if any. */
    referenceAreaId?: number;
    /** Timeseries id of the selected restoration site, if any. */
    restorationSiteId?: number;
    /**
     * Whether the wizard step holding this map is currently shown. The map only
     * fits to the geometries once visible — fitting while the container is hidden
     * (display:none) computes against a zero-size viewport and zooms to the world.
     */
    isVisible: boolean;
}

/**
 * Read-only map showing the spatial extents of the selected reference area and
 * restoration site. The geometries are fetched per id from the timeseries
 * endpoint; nothing here is editable.
 */
export function ReferenceAreaMapPreview({
    referenceAreaId,
    restorationSiteId,
    isVisible,
}: ReferenceAreaMapPreviewProps) {
    const mapService = useService<MapRegistry>("map.MapRegistry");
    const { getTimeseriesById } = useServices();
    const [map, setMap] = useState<MapModel>();
    const [error, setError] = useState<string>();
    // The fetched-and-projected geometries, kept in state so the zoom effect can
    // re-fit them once the step becomes visible (see isVisible).
    const [geometries, setGeometries] = useState<Geometry[]>([]);

    useEffect(() => {
        mapService.expectMapModel(MAP_BOX).then(setMap);
    }, [mapService]);

    // Fetch the selected areas and render them as a read-only layer. This runs
    // whenever the selection changes, regardless of visibility.
    useEffect(() => {
        if (!map) {
            return;
        }

        let cancelled = false;
        setError(undefined);

        const targets: { id: number; style: AreaStyle }[] = [];
        if (referenceAreaId != null) {
            targets.push({ id: referenceAreaId, style: REFERENCE_AREA_STYLE });
        }
        if (restorationSiteId != null) {
            targets.push({ id: restorationSiteId, style: RESTORATION_SITE_STYLE });
        }

        const removePreviewLayers = () => {
            map.layers
                .getLayers()
                .filter((l) => l.id.startsWith(PREVIEW_LAYER_PREFIX))
                .forEach((l) => map.layers.removeLayerById(l.id));
        };

        const render = async () => {
            const format = new GeoJSON();
            const geoms: Geometry[] = [];
            // One layer per area, each with its own (static) flat style — the
            // flat-style object on a VectorLayer is the syntax that renders
            // reliably in this codebase (cf. the draw layer in the create dialog).
            const layers: { id: string; layer: SimpleLayer }[] = [];

            for (const target of targets) {
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
                layers.push({ id, layer: new SimpleLayer({ id, olLayer: vector, title: target.style.label }) });
            }

            if (cancelled) {
                return;
            }

            removePreviewLayers();
            layers.forEach(({ layer }) => map.layers.addLayer(layer));

            setGeometries(geoms);
        };

        render().catch((e) => {
            console.error("Could not load reference area preview", e);
            if (!cancelled) {
                setError("Could not load the selected areas.");
            }
        });

        return () => {
            cancelled = true;
            removePreviewLayers();
            setGeometries([]);
        };
    }, [map, referenceAreaId, restorationSiteId, getTimeseriesById]);

    // Fit to the geometries only once the step is visible. Fitting while the
    // container is hidden (display:none) measures a zero-size viewport and zooms
    // to the whole world; updateSize() forces a re-measure now that it's shown.
    useEffect(() => {
        if (!map || !isVisible || geometries.length === 0) {
            return;
        }
        map.olMap.updateSize();
        map.zoom(geometries, { viewPadding: { top: 50, bottom: 100 } });
    }, [map, isVisible, geometries]);

    return (
        <>
            <Text pt="8" pb="2" textStyle="lg">Selected areas:</Text>
            <Box height="60vh" border="1px solid black">
                <Flex flex="1" height="100%" width="100%" direction="column" overflow="hidden" position="relative">
                    {map &&
                        <MapContainer map={map} role="img" aria-label="Reference area and restoration site preview">
                            <Box bg="white" p="2" m="1" borderRadius="md" boxShadow="sm">
                                {error
                                    ? <Text color="red.600">{error}</Text>
                                    : <Stack gap="1">
                                        <HStack gap="2">
                                            <Box w="3" h="3" borderRadius="sm" bg={REFERENCE_AREA_STYLE.color} />
                                            <Text fontSize="sm">{REFERENCE_AREA_STYLE.label}</Text>
                                        </HStack>
                                        <HStack gap="2">
                                            <Box w="3" h="3" borderRadius="sm" bg={RESTORATION_SITE_STYLE.color} />
                                            <Text fontSize="sm">{RESTORATION_SITE_STYLE.label}</Text>
                                        </HStack>
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
