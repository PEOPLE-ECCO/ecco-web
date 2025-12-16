// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Flex } from "@chakra-ui/react";
import { ZoomIn, ZoomOut } from "@open-pioneer/map-navigation";
import { MapAnchor, MapAnchorPosition, MapRegistry, SimpleLayer } from "@open-pioneer/map";
import { useService } from "open-pioneer:react-hooks";

interface MapZoomControlsProps {
    mapId: string;
    position?: MapAnchorPosition | "bottom-right";
    horizontalGap?: number | 10;
    verticalGap?: number | 30;
}

export const MapZoomControls = ({ mapId, position, horizontalGap, verticalGap }: MapZoomControlsProps) => {
    const mapService = useService<MapRegistry>("map.MapRegistry");

    return (
        <MapAnchor position={position} horizontalGap={horizontalGap} verticalGap={verticalGap}>
            <Flex
                role={position}
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
