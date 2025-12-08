// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Button, Collapsible, Flex, IconButton } from "@chakra-ui/react";
import { ZoomIn, ZoomOut } from "@open-pioneer/map-navigation";
import { MapAnchor, MapRegistry, SimpleLayer } from "@open-pioneer/map";
import { useService } from "open-pioneer:react-hooks";
import { useState } from "react";
import { ActionButton } from "../Timeseries/ActionButton";
import { LuMap, LuChevronDown } from "react-icons/lu";

interface MapDrawerControlsProps {
    mapId: string;
}

export const MapDrawerControls = () => {
    const mapService = useService<MapRegistry>("map.MapRegistry");
    const [open, setOpen] = useState<boolean>(false);

    return (
        <MapAnchor position="bottom-right" horizontalGap={10} verticalGap={300}>
            <Flex
                role="bottom-right"
                bottom="3%"
                aria-label="Zoom controls"
                direction="column"
                gap={1}
                padding={1}
                colorPalette={"teal"}
            >
                <Button onClick={() => { setOpen(!open); console.log(open); }} />
            </Flex>
        </MapAnchor>
    );
};
