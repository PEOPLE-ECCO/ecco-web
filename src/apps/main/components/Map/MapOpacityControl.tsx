// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Flex, Slider } from "@chakra-ui/react";
import { EventEmitter } from "@open-pioneer/core";
import { MapModel, SimpleLayer } from "@open-pioneer/map";
import { useEffect, useState } from "react";
import { Events } from "../../views/Sites/SiteDetails/SiteDetails";

interface MapOpacityControlsProps {
    responsibleResultType: string;
    value: number;
    onChange: (resultType: string, opacity: number) => void;
}

export const MapOpacityControl = ({ responsibleResultType, value, onChange }: MapOpacityControlsProps) => {

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
                    defaultValue={[value]}
                    value={[value]}
                    onValueChange={(e) => onChange(responsibleResultType, e.value[0]!)}
                >
                    <Flex align="center" gap="4" justify="space-between">
                        <Slider.Label>Opacity:</Slider.Label>
                        <Slider.Control>
                            <Slider.Track>
                                <Slider.Range />
                            </Slider.Track>
                            <Slider.Thumbs />
                        </Slider.Control>
                        <Slider.Label>{[value]}%</Slider.Label>
                    </Flex>
                </Slider.Root>
            </Box>
        </Flex>
    );
};
