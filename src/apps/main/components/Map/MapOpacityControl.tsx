// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Flex, Slider } from "@chakra-ui/react";
import { MapAnchor, MapRegistry, SimpleLayer } from "@open-pioneer/map";
import { useService } from "open-pioneer:react-hooks";
import { useEffect, useState } from "react";

interface MapOpacityControlsProps {
    mapId: string;
}

export const MapOpacityControl = ({ mapId }: MapOpacityControlsProps) => {
    const mapService = useService<MapRegistry>("map.MapRegistry");

    const [opacity, setOpacity] = useState<number>(100);
    useEffect(() => {
        const updateMap = async () => {
            const map = await mapService.expectMapModel(mapId);
            const layer = map.layers.getLayerById("current") as SimpleLayer;
            if (layer) {
                layer.olLayer.setOpacity(opacity / 100);
            }
        };
        updateMap();
    }, [mapId, opacity]);

    return (
        <MapAnchor position="bottom-right" horizontalGap={10} verticalGap={150}>
            <Flex
                role="bottom-right"
                bottom="3%"
                aria-label="Zoom controls"
                direction="column"
                gap={1}
                padding={1}
                colorPalette={"teal"}
            >
                <Box bg="white" p="4px" rounded="md">
                    <Slider.Root
                        height="200px"
                        orientation="vertical"
                        defaultValue={[100]}
                        value={[opacity]}
                        onValueChange={(e) => setOpacity(e.value[0]!)}
                        onValueChangeEnd={(e) => setOpacity(e.value[0]!)}
                    >
                        <Slider.Label textAlign="center" pb="4px">Opacity</Slider.Label>

                        <Slider.Control>
                            <Slider.Track>
                                <Slider.Range />
                            </Slider.Track>
                            <Slider.Thumbs />
                        </Slider.Control>
                        <Slider.Label textAlign="center" pt="4px">{[opacity]} %</Slider.Label>
                    </Slider.Root>
                </Box>
            </Flex>
        </MapAnchor>
    );
};
