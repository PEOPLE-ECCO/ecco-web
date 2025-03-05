// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { FC, useEffect, useState } from "react";

import { Box, Button, Divider, Flex, FormControl, FormLabel, GridItem, HStack, Link, Spinner, Table, Tbody, Td, Text, Th, Thead, Tr } from "@open-pioneer/chakra-integration";
import { MapAnchor, MapContainer, MapRegistry, SimpleLayer } from "@open-pioneer/map";
import { HttpService, } from "@open-pioneer/http";
import { ScaleBar } from "@open-pioneer/scale-bar";
import { InitialExtent, ZoomIn, ZoomOut } from "@open-pioneer/map-navigation";
import { useIntl, useService } from "open-pioneer:react-hooks";
import { CoordinateViewer } from "@open-pioneer/coordinate-viewer";
import { ScaleViewer } from "@open-pioneer/scale-viewer";
import { Geolocation } from "@open-pioneer/geolocation";
import { OverviewMap } from "@open-pioneer/overview-map";
import { MAP_ID } from "./services";
import { useMemo } from "react";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { BasemapSwitcher } from "@open-pioneer/basemap-switcher";
import { Point } from "ol/geom";
import STAC from "ol-stac";
import { Projection } from "ol/proj";
import proj4 from "proj4";
import {register} from "ol/proj/proj4.js";

register(proj4);

export const ExploreUI: FC = () => {
    const mapService = useService<MapRegistry>("map.MapRegistry");

    const intl = useIntl();
    const overviewMapLayer = useMemo(
        () =>
            new TileLayer({
                source: new OSM()
            }),
        []
    );

    return (
        <>
            <GridItem colSpan={6} rowSpan={10} borderWidth="1px" margin="1%" padding="1%">
                <Box borderWidth="1px">
                    {ResourceList(mapService)}
                </Box>
            </GridItem>
            <GridItem colSpan={6} rowSpan={10} borderWidth="1px" margin="1%" padding="1%">
                <Box height="85vh">
                    <Flex height="100%" direction="column" overflow="hidden">
                        <Flex flex="1" direction="column" position="relative">
                            <MapContainer
                                mapId={MAP_ID}
                                role="main"
                                aria-label={intl.formatMessage({ id: "ariaLabel.map" })}
                            >
                                <MapAnchor position="top-right" horizontalGap={5} verticalGap={5}>
                                    <Box
                                        backgroundColor="white"
                                        borderWidth="1px"
                                        borderRadius="lg"
                                        padding={2}
                                        boxShadow="lg"
                                        role="top-right"
                                        aria-label={intl.formatMessage({ id: "ariaLabel.topRight" })}
                                    >
                                        <OverviewMap mapId={MAP_ID} olLayer={overviewMapLayer} />
                                        <Divider mt={4} />
                                        <FormControl>
                                            <FormLabel mt={2}>
                                                <Text as="b">
                                                    {intl.formatMessage({ id: "basemapLabel" })}
                                                </Text>
                                            </FormLabel>
                                            <BasemapSwitcher mapId={MAP_ID} allowSelectingEmptyBasemap />
                                        </FormControl>
                                    </Box>
                                </MapAnchor>
                                <MapAnchor position="bottom-right" horizontalGap={10} verticalGap={30}>
                                    <Flex
                                        role="bottom-right"
                                        aria-label={intl.formatMessage({ id: "ariaLabel.bottomRight" })}
                                        direction="column"
                                        gap={1}
                                        padding={1}
                                    >
                                        <Geolocation mapId={MAP_ID} />
                                        <InitialExtent mapId={MAP_ID} />
                                        <ZoomIn mapId={MAP_ID} />
                                        <ZoomOut mapId={MAP_ID} />
                                    </Flex>
                                </MapAnchor>
                            </MapContainer>
                        </Flex>
                        <Flex
                            role="region"
                            aria-label={intl.formatMessage({ id: "ariaLabel.footer" })}
                            gap={3}
                            alignItems="center"
                            justifyContent="center"
                        >
                            <CoordinateViewer mapId={MAP_ID} precision={2} />
                            <ScaleBar mapId={MAP_ID} />
                            <ScaleViewer mapId={MAP_ID} />
                        </Flex>
                    </Flex>
                </Box>
            </GridItem>
        </>
    );
};


interface Link {
    rel: string 
    href: string
}

interface StacCatalog {
    id: string
    links: Link[]
}

interface Asset {
    href: string 
}

interface AssetWrap {
    asset: Asset
}

interface STACProperties {
    "proj:bbox": number[4] 
    "proj:epsg": number 
}
interface Item {
    assets: AssetWrap;
    id: string
    bbox: number[]
    properties: STACProperties
}

function ResourceList(mapService: MapRegistry): JSX.Element {
    const httpService = useService<HttpService>("http.HttpService");

    const [catalog, setCatalog] = useState<StacCatalog>();
    const [items] = useState<Map<string, Item>>(new Map());
    const [render, setRender] = useState<number>(0);

    useEffect(() => {
        httpService
            .fetch("http://localhost:5000/stac")
            .then(async res => {
                return setCatalog(await res.json());
            });
    }, [httpService]);

    useEffect(() => {
        if (catalog != undefined) {
            for (const link of catalog.links.filter(link => link.rel=="item")) {
                setRender(r => r + 1);
                httpService.fetch(link.href)
                    .then(async res => {
                        const raw = await res.json();
                        items.set(raw.id, raw);
                        setRender(r => r-1);
                    });
            }
        }

    }, [httpService, items, catalog]);

    const itemlist = [];
    for (const [k, v] of items) {
        itemlist.push(FormatItem(k,v, mapService));
    }
    return (
        <>
            {itemlist}
            {render > 0 &&
                <Spinner></Spinner>
            }
        </>
    );
}



function FormatItem(k: string, v:Item, mapService: MapRegistry): JSX.Element {

    async function viewOnMap() {
        const map = await mapService.expectMapModel("main");

        // remove old layer
        map.layers.removeLayerById("current_item");

        const google = new Projection({code: "EPSG:3857"});
        //const stacproj = new Projection({code: "EPSG:" + v.properties["proj:epsg"]});
        const stacproj = new Projection({code: "EPSG:4326"});

        console.log(k);
        console.log(stacproj);

        const layer = new SimpleLayer({
            id: "current_item",
            title: v.id,
            olLayer: new STAC({
                data: v,
                displayGeoTiffByDefault: true
            })
        });
        map.layers.addLayer(layer);
        
        // const bbox = v.properties["proj:bbox"];
        const bbox = v.bbox;
        //console.log([new Point([bbox[0]!, bbox[1]!]).transform(stacproj, google), new Point([bbox[2]!, bbox[3]!]).transform(stacproj, google)]);
        map.highlightAndZoom([new Point([bbox[0]!, bbox[1]!]).transform(stacproj, google), new Point([bbox[2]!, bbox[3]!]).transform(stacproj, google)]);
    }

    return (
        <Box key={k}>
            <HStack margin="1%" padding="1%">
                <Text mt={2} fontSize="xl" fontWeight="semibold" lineHeight="short">
                    {v.id}
                </Text>
                <Button onClick={() => viewOnMap()}> View on Map! </Button>
            </HStack>
            <Table variant='simple'>
                <Thead>
                    <Tr>
                        <Th>Property</Th>
                        <Th>Value</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    <Tr>
                        <Td>id</Td>
                        <Td>{v.id}</Td>
                    </Tr>
                    <Tr>
                        <Td>bbox</Td>
                        <Td>
                            <ul>
                                <li>{v.bbox[0]}</li>
                                <li>{v.bbox[1]}</li>
                                <li>{v.bbox[2]}</li>
                                <li>{v.bbox[3]}</li>
                            </ul>
                        </Td>
                    </Tr>
                </Tbody>
            </Table>
        </Box>);
}
