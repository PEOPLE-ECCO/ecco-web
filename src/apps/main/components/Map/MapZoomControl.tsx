// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Flex } from "@open-pioneer/chakra-integration";
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
            >
                <ZoomIn mapId={mapId} />
                <ZoomOut mapId={mapId} />
            </Flex>
        </MapAnchor>
    );
};
