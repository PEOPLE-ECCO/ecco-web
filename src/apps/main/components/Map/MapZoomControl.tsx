// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Flex } from "@chakra-ui/react";
import { ZoomIn, ZoomOut } from "@open-pioneer/map-navigation";
import { MapAnchor } from "@open-pioneer/map";

interface MapZoomControlsProps {
    mapId: string;
}

export const MapZoomControls = ({ mapId }: MapZoomControlsProps) => {
    return (
        <MapAnchor position="bottom-right" horizontalGap={10} verticalGap={30}>
            <Flex
                role="bottom-right"
                aria-label="Zoom controls"
                direction="column"
                gap={1}
                padding={1}
                colorPalette={"teal"}
            >
                <ZoomIn mapId={mapId} />
                <ZoomOut mapId={mapId} />
            </Flex>
        </MapAnchor>
    );
};
