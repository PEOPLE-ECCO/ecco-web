// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Box,
    Button,
    Collapsible,
    Field,
    HStack,
    IconButton,
    Separator,
    Spacer,
    Stack,
    Text,
    VStack
} from "@chakra-ui/react";
import { OverviewMap } from "@open-pioneer/overview-map";
import { BasemapSwitcher } from "@open-pioneer/basemap-switcher";
import { MapAnchor } from "@open-pioneer/map";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";

import { useMemo, useState } from "react";
import { LuChevronDown, LuMap } from "react-icons/lu";

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
        <MapAnchor position="top-right" horizontalGap={8} verticalGap={0}>
            <Box
                backgroundColor="white"
                borderWidth="1px"
                borderRadius="md"
                padding="2"
                boxShadow="sm"
                role="top-right"
                aria-label="Map sidebar controls"
            >
                <Collapsible.Root defaultOpen>
                    <Collapsible.Trigger
                        paddingY="1"
                        display="flex"
                        gap="2"
                        alignItems="center"
                    >
                        <IconButton variant="plain" w="100%" size="2xs">
                            <LuMap />
                            <Collapsible.Indicator
                                transition="transform 0.2s"
                                _open={{ transform: "rotate(180deg)" }}
                            >
                                <LuChevronDown />
                            </Collapsible.Indicator>
                        </IconButton>
                    </Collapsible.Trigger>
                    <Collapsible.Content>
                        <OverviewMap mapId={mapId} olLayer={overviewMapLayer} ></OverviewMap>
                        <Separator mt={2} colorPalette="gray" />
                        <Field.Root>
                            <Field.Label mt={1}>
                                <Text as="b">Select basemap:</Text>
                            </Field.Label>
                            <BasemapSwitcher mapId={mapId} allowSelectingEmptyBasemap />
                        </Field.Root>
                    </Collapsible.Content>
                </Collapsible.Root>
            </Box>
        </MapAnchor >
    );
};
