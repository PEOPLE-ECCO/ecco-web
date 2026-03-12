// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { FC, useEffect, useState } from "react";
import { Flex, Box } from "@chakra-ui/react";

import { fromEPSGCode, register } from "ol/proj/proj4.js";
import proj4 from "proj4";
import { useServices } from "../../services/Services";
import { Site } from "./Site/Site";
import { MapContainer, MapModel, MapRegistry, SimpleLayer } from "@open-pioneer/map";
import { MAP_SiteView } from "../../services";
import GeoJSON from "ol/format/GeoJSON";
import { Projection } from "ol/proj";
import { useService } from "open-pioneer:react-hooks";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { MapZoomControls } from "../../components/Map/MapZoomControl";
import { MapInfoControls } from "../../components/Map/MapInfoControls";
import { Point } from "ol/geom";


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

    useEffect(() => {
        const fetchScenarios = async () => {
            try {
                const data = await getScenarios();
                setSites(data);
                showScenarios(data);
            } catch (error) {
                console.error(error);
            }
        };
        const getMap = async () => {
            setMap(await mapService.expectMapModel(MAP_SiteView));
        };
        
        getMap().then(() => {
            fetchScenarios();
        });
    }, []);

    useEffect(() => {
        if (map) {
            map.zoom(
                [
                    new Point([850000, 6793120])
                ],
                { pointZoom: 1 }
            );
        }
    }, [map]);

    async function showScenarios(sites: [Site]) {
        if (!map) {
            return;
        }
        const geojson = new Projection({ code: "EPSG:4326" });
        const google = new Projection({ code: "EPSG:3857" });
        for (const site of sites) {
            map.highlight([
                new Point([site.bbox[0]!, site.bbox[1]!]).transform(geojson, google),
                new Point([site.bbox[2]!, site.bbox[3]!]).transform(geojson, google)
            ]);
        };
    };

    return (
        <>
            <Flex gap="4" p="4" direction="row">
                <Box>
                    <Flex gap="4" direction="row" wrap="wrap" justify="center">
                        {sites && sites.map((site) =>
                            <>
                                <Box w="40%" flexGrow="1">
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
