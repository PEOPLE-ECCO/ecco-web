// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Flex, HStack } from "@chakra-ui/react";
import { CoordinateViewer } from "@open-pioneer/coordinate-viewer";
import { ScaleBar } from "@open-pioneer/scale-bar";
import { MapAnchor, MapModel } from "@open-pioneer/map";

interface MapInfoControlsProps {
    map: MapModel;
}

export const MapInfoControls = ({ map }: MapInfoControlsProps) => {
    return (
        <MapAnchor position="bottom-left" horizontalGap={15} verticalGap={0}>
            <Flex
                role="bottom-left"
                aria-label="Map info controls"
                direction="column"
                gap={1}
                padding={1}
            >
                <HStack>
                    <CoordinateViewer map={map} precision={2} />
                    <ScaleBar map={map} />
                </HStack>
            </Flex>
        </MapAnchor>
    );
};
