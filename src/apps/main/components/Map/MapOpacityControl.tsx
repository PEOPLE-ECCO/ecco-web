// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Flex, HStack, Slider } from "@chakra-ui/react";
import { MapAnchor, MapRegistry, SimpleLayer } from "@open-pioneer/map";
import { useService } from "open-pioneer:react-hooks";
import { useEffect, useState } from "react";

interface MapOpacityControlsProps {
    mapId: string;
}

export const MapOpacityControl = ({ mapId }: MapOpacityControlsProps) => {
    const mapService = useService<MapRegistry>("map.MapRegistry");
    const [opacity, setOpacity] = useState<number | undefined>(100);

    useEffect(() => {
        const updateMap = async () => {
            const map = await mapService.expectMapModel(mapId);
            const layer = map.layers.getLayerById("current") as SimpleLayer;
            if (layer) {
                if (opacity == undefined) {
                    setOpacity(layer.olLayer.getOpacity() * 100);
                } else {
                    layer.olLayer.setOpacity(opacity / 100);
                }
            }
        };
        updateMap();
    }, [mapId, opacity]);

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
                    //defaultValue={[100]}
                    value={[opacity]}
                    onValueChange={(e) => setOpacity(e.value[0]!)}
                    onValueChangeEnd={(e) => setOpacity(e.value[0]!)}
                >
                    <Flex align="center" gap="4" justify="space-between">
                        <Slider.Label>Opacity:</Slider.Label>
                        <Slider.Control>
                            <Slider.Track>
                                <Slider.Range />
                            </Slider.Track>
                            <Slider.Thumbs />
                        </Slider.Control>
                        <Slider.Label>{[opacity]}%</Slider.Label>
                    </Flex>
                </Slider.Root>
            </Box>
        </Flex>
    );
};
