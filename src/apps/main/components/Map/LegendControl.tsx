// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, HStack, Stack, Text, useEditable } from "@chakra-ui/react";
import { useServices } from "../../services/Services";
import { useEffect, useState } from "react";
import { LegendElement, Process, LegendAndDescription, Timeseries, GradientStop } from "../definitions";

interface LegendControlProps {
    process?: string;
    timeseries?: Timeseries
}


/**
 * Renders a continuous color scale as an interpolated gradient bar with a
 * tick label under each stop, positioned proportionally along the value range.
 */
const GradientBar = ({ stops }: { stops: GradientStop[] }) => {
    const min = stops[0]!.value;
    const max = stops[stops.length - 1]!.value;
    const range = max - min;

    // Guard against a degenerate (zero-width) range to avoid division by zero.
    const pct = (value: number) => (range === 0 ? 0 : ((value - min) / range) * 100);

    const cssStops = stops.map((s) => `${s.color} ${pct(s.value)}%`).join(", ");

    return (
        <Box>
            <Box
                h="4"
                borderWidth="1px"
                borderRadius="sm"
                style={{ background: `linear-gradient(to right, ${cssStops})` }}
            />
            <Box position="relative" h="5" mt="1">
                {stops.map((s) => (
                    <Text
                        key={s.value}
                        position="absolute"
                        left={`${pct(s.value)}%`}
                        transform="translateX(-50%)"
                        fontSize="xs"
                        whiteSpace="nowrap"
                    >
                        {s.label ?? s.value}
                    </Text>
                ))}
            </Box>
        </Box>
    );
};

export const Legend = ({ process, timeseries }: LegendControlProps) => {

    const [currentLegend, setCurrentLegend] = useState<LegendElement[]>([]);
    const [currentGradient, setCurrentGradient] = useState<GradientStop[]>();
    const [currentDescription, setCurrentDescription] = useState<string>();

    const {getLegend} = useServices();

    useEffect(() => {
        console.log("process changed", process);
        setContent();
    }, [process]);

    const fetchLegend = async (process: string) : Promise<LegendAndDescription> => {
        return getLegend(process, timeseries);
    };


    const setContent = async () => {
        if (process) {
            const legendData = await fetchLegend(process!);
            if (legendData) {
                setCurrentLegend(legendData.entries);
                setCurrentGradient(legendData.gradient);
                setCurrentDescription(legendData.description);
            }
        }
    };


    return (
        <>
            {currentLegend && process != undefined && (
                <>
                    <Box bg="white" p="6" borderWidth="1px" borderRadius="md" boxShadow="sm">
                        <Stack gap="2">
                            <Text fontWeight="semibold"><span style={{fontStyle: "italic"}}>{process}</span></Text>
                            {currentLegend.map((element) =>
                                <HStack key={element.value} gap="6">
                                    <Box w="6" bg={element.color} pt="4" borderWidth="1px" color="black" />
                                    <Text>{element.value}</Text>
                                </HStack>
                            )}
                            {currentGradient && currentGradient.length >= 2 && (
                                <GradientBar stops={currentGradient} />
                            )}
                            <Text>{currentDescription}</Text>
                        </Stack>
                    </Box>
                </>
            )}
        </>
    );
};
