// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Flex } from "@chakra-ui/react";
import { ZoomIn, ZoomOut } from "@open-pioneer/map-navigation";
import { MapAnchor, MapAnchorPosition, MapModel, MapRegistry, SimpleLayer } from "@open-pioneer/map";
import { useService } from "open-pioneer:react-hooks";

interface MapZoomControlsProps {
    map: MapModel;
    position?: MapAnchorPosition | "bottom-right";
    horizontalGap?: number | 10;
    verticalGap?: number | 30;
}

export const MapZoomControls = ({ map, position, horizontalGap, verticalGap }: MapZoomControlsProps) => {
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
                <ZoomIn map={map} />
                <ZoomOut map={map} />
            </Flex>
        </MapAnchor>
    );
};
