// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Flex, Slider } from "@chakra-ui/react";
import { EventEmitter } from "@open-pioneer/core";
import { MapModel, MapRegistry, SimpleLayer } from "@open-pioneer/map";
import { useService } from "open-pioneer:react-hooks";
import { useEffect, useState } from "react";
import { Events } from "../../views/Sites/SiteDetails/SiteDetails";

interface MapOpacityControlsProps {
    map: MapModel;
    currentResultType: string;
    responsibleResultType: string;
    eventListener: EventEmitter<Events>;
}

export const MapOpacityControl = ({ map, responsibleResultType, currentResultType, eventListener }: MapOpacityControlsProps) => {
    const [layerOpacity, setLayerOpacity] = useState<number>(100);

    useEffect(() => {
        if (responsibleResultType == currentResultType) {
            updateMap();
        }
    }, [map, layerOpacity, responsibleResultType, currentResultType]);

    const updateMap = async () => {
        const layer = map?.layers.getLayerById("current") as SimpleLayer;
        // eventListener.emit("layerOpacity", layerOpacity);

        if (layer) {
            layer.olLayer.setOpacity(layerOpacity / 100);
        }
    };

    return (
        <Flex
            aria-label="Zoom controls"
            direction="column"
            gap={1}
            padding={1}
            colorPalette={"teal"}
            align="center"
        >
            <Box p="4px" rounded="md">
                <Slider.Root
                    width="250px"
                    orientation="horizontal"
                    defaultValue={[layerOpacity]}
                    value={[layerOpacity]}
                    onValueChange={(e) => setLayerOpacity(e.value[0]!)}
                //onValueChangeEnd={(e) => setLayerOpacity(e.value[0]!)}
                >
                    <Flex align="center" gap="4" justify="space-between">
                        <Slider.Label>Opacity:</Slider.Label>
                        <Slider.Control>
                            <Slider.Track>
                                <Slider.Range />
                            </Slider.Track>
                            <Slider.Thumbs />
                        </Slider.Control>
                        <Slider.Label>{[layerOpacity]}%</Slider.Label>
                    </Flex>
                </Slider.Root>
            </Box>
        </Flex>
    );
};
