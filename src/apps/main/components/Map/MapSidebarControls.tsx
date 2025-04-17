// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Box,
    Divider,
    FormControl,
    FormLabel,
    Text
} from "@open-pioneer/chakra-integration";
import { OverviewMap } from "@open-pioneer/overview-map";
import { BasemapSwitcher } from "@open-pioneer/basemap-switcher";
import { MapAnchor } from "@open-pioneer/map";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";

import { useMemo } from "react";

interface MapSidebarControlsProps {
    mapId: string;
}

export const MapSidebarControls = ({ mapId }: MapSidebarControlsProps) => {

    const overviewMapLayer = useMemo(
        () =>
            new TileLayer({
                source: new OSM()
            }),
        []
    );

    return (
        <MapAnchor position="top-right" horizontalGap={5} verticalGap={5}>
            <Box
                backgroundColor="white"
                borderWidth="1px"
                borderRadius="sm"
                padding={2}
                boxShadow="sm"
                role="top-right"
                aria-label="Map sidebar controls"
            >
                <OverviewMap mapId={mapId} olLayer={overviewMapLayer} />
                <Divider mt={2} />
                <FormControl>
                    <FormLabel mt={1}>
                        <Text as="b">Select basemap:</Text>
                    </FormLabel>
                    <BasemapSwitcher mapId={mapId} allowSelectingEmptyBasemap />
                </FormControl>
            </Box>
        </MapAnchor>
    );
};
