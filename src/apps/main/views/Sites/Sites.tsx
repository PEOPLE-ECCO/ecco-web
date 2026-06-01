// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { FC, useEffect, useRef, useState } from "react";
import { Flex, Box } from "@chakra-ui/react";

import { fromEPSGCode, register } from "ol/proj/proj4.js";
import proj4 from "proj4";
import { useServices } from "../../services/Services";
import { Site } from "./Site/Site";
import { MapContainer, MapModel, MapRegistry, Highlight } from "@open-pioneer/map";
import { MAP_SiteView } from "../../services";
import GeoJSON from "ol/format/GeoJSON";
import { Projection } from "ol/proj";
import { useService } from "open-pioneer:react-hooks";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { MapZoomControls } from "../../components/Map/MapZoomControl";
import { MapInfoControls } from "../../components/Map/MapInfoControls";
import { Point } from "ol/geom";
import { fromExtent } from "ol/geom/Polygon";
import Feature, { FeatureLike } from "ol/Feature";
import { Fill, Stroke, Style } from "ol/style";
import { StyleFunction } from "ol/style/Style";


register(proj4);

// We need to register in advance else we run into race conditions later
fromEPSGCode("EPSG:32631");
fromEPSGCode("EPSG:3857");
fromEPSGCode("EPSG:32635");
fromEPSGCode("EPSG:32648");
fromEPSGCode("EPSG:25830");
fromEPSGCode("EPSG:32636");


export const Sites: FC = () => {
    const { getScenarios } = useServices();
    const [sites, setSites] = useState<[Site]>();
    const mapService = useService<MapRegistry>("map.MapRegistry");
    const [map, setMap] = useState<MapModel>();

    const geojson = new Projection({ code: "EPSG:4326" });
    const google = new Projection({ code: "EPSG:3857" });

    let bboxSource : VectorSource | undefined = undefined;
    let bboxLayer : VectorLayer | undefined = undefined;

    useEffect(() => {
        const fetchScenarios = async () => {
            try {
                const data = await getScenarios();
                setSites(data);
            } catch (error) {
                console.error(error);
            }
        };
        const getMap = async () => {
            setMap(await mapService.expectMapModel(MAP_SiteView));
        };

        getMap();
        fetchScenarios();
    }, []);

    useEffect(() => {
        if (map) {
            map.zoom(
                [
                    new Point([850000, 6793120])
                ],
                { pointZoom: 1 }
            );
            map.removeHighlights();
        }
    }, [map]);


    useEffect(() => {
        if (!map || !sites) {
            return;
        }


        const adaptiveStyleFunction : StyleFunction = function (feature: FeatureLike, resolution: number): Style | undefined {
            // Default styling rules for close-up inspections
            let strokeWidth = 2;
            const strokeColor = [0, 120, 0, 1.0]; // Brighten edge to high-vis green
            const fillColor = [0, 200, 0, 0.2];

            // Check if the map is zoomed out globally
            if (resolution > 2400) { // High resolution = World scale view
                strokeWidth = 6;     // Thicken the border significantly
            } else if (resolution > 600) { // Mid-scale overview
                strokeWidth = 4;
            }

            return new Style({
                fill: new Fill({ color: fillColor }),
                stroke: new Stroke({ color: strokeColor, width: strokeWidth })
            });
        };

        for (const site of sites) {
            const bboxExtent = [site.bbox[0]!, site.bbox[1]!, site.bbox[2]!, site.bbox[3]!];

            if (!bboxSource) {
                bboxSource = new VectorSource();
                bboxLayer = new VectorLayer({
                    source: bboxSource,
                    properties: { id: "sites-overlay-layer" },
                    style: adaptiveStyleFunction
                });
                
                // Append the layer directly to the OpenLayers map instance
                map.olMap.addLayer(bboxLayer);
            }

            const bboxPolygon = fromExtent(bboxExtent).transform(geojson, google);
            const bboxFeature = new Feature({
                geometry: bboxPolygon,
            });
            bboxFeature.setId(site.id);

            bboxSource.addFeature(bboxFeature);
        };
    }, [map, sites]);

    const contentHeightCalc = "calc(100vh - var(--header-height) - var(--footer-height))";

    // 2. Use a ref to store the highlight handle across renders without re-triggering state cycles
    const highlightHandleRef = useRef<Highlight>(null);

    const handleMouseEnter = (site: Site) => {
        if (!map || !sites) return;

        const bboxExtent = [site.bbox[0]!, site.bbox[1]!, site.bbox[2]!, site.bbox[3]!];

        //remove highlgiht
        if (highlightHandleRef.current) {
            highlightHandleRef.current.destroy();
            highlightHandleRef.current = null;
        }

        //construct the OpenLayers feature for the area bounding box
        const bboxPolygon = fromExtent(bboxExtent).transform(geojson, google);

        //trigger the high-level highlight method and save the disposal handle
        highlightHandleRef.current = map.highlight([bboxPolygon]);
    };

    const handleMouseLeave = () => {
        // 5. Instantly wipe the bounding box off the screen when the mouse leaves the Box
        if (highlightHandleRef.current) {
            highlightHandleRef.current.destroy();
            highlightHandleRef.current = null;
        }
    };

    return (
        <>
            <Flex gap="4" p="4" direction="row" maxHeight={contentHeightCalc}>
                <Box overflow={"auto"}>
                    <Flex gap="4" direction="row" wrap="wrap" justify="center">
                        {sites && sites.map((site) =>
                            <>
                                <Box w="40%" flexGrow="1"
                                    onMouseEnter={() => handleMouseEnter(site)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <Site key={site.id} {...site} />
                                </Box>
                            </>
                        )}
                    </Flex>
                </Box>
                <Box color="black" w="75%">
                    {map && 
                        <MapContainer
                            map={map}
                            role="siteview"
                            aria-label=""
                        >
                            <MapInfoControls map={map} />
                            <MapZoomControls map={map} position="bottom-right" horizontalGap={10} verticalGap={30} />
                        </MapContainer>
                    }
                </Box>
            </Flex>
        </>
    );
};
