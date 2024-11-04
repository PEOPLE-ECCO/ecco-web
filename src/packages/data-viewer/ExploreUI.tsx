// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { FC } from "react";

import { Box, Divider, Flex, FormControl, FormLabel, Text } from "@open-pioneer/chakra-integration";
import { MapAnchor, MapContainer } from "@open-pioneer/map";
import { ScaleBar } from "@open-pioneer/scale-bar";
import { InitialExtent, ZoomIn, ZoomOut } from "@open-pioneer/map-navigation";
import { useIntl } from "open-pioneer:react-hooks";
import { CoordinateViewer } from "@open-pioneer/coordinate-viewer";
import { ScaleViewer } from "@open-pioneer/scale-viewer";
import { Geolocation } from "@open-pioneer/geolocation";
import { OverviewMap } from "@open-pioneer/overview-map";
import { MAP_ID } from "./services";
import { useMemo } from "react";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { BasemapSwitcher } from "@open-pioneer/basemap-switcher";

export const ExploreUI: FC = () => {
    const intl = useIntl();
    const overviewMapLayer = useMemo(
        () =>
            new TileLayer({
                source: new OSM()
            }),
        []
    );

    return (
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
    );
};