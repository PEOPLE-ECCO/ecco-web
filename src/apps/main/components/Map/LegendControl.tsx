// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, HStack, Stack, Text, useEditable } from "@chakra-ui/react";
import { useServices } from "../../services/Services";
import { useEffect, useState } from "react";
import { LegendElement, Process } from "../definitions";

interface LegendControlProps {
    process?: string;
}

export const Legend = ({ process }: LegendControlProps) => {
    const DHILegend = [{ value: "Corals", color: "red" }, { value: "SAV", color: "green" }, { value: "No Data", color: "white" }];
    const R80PLegend = [{ value: "much vegetation", color: "black" }, { value: "some vegetation", color: "gray" }, { value: "no vegetation", color: "white" }];
    const deltaIRLegend = [{ value: "much plant health", color: "black" }, { value: "some plant health", color: "gray" }, { value: "no plant health", color: "white" }];
    const DHIDescription = "Algorithm for Corals";
    const R80PDescription = "Algorithm for vegetation";
    const deltaIRDescription = "Algorithm for plant health";

    const [currentLegend, setCurrentLegend] = useState<LegendElement[]>([]);
    const [currentDescription, setCurrentDescription] = useState<string>();

    useEffect(() => {
        console.log("process changed", process);
        setContent();
    }, [process]);

    const setContent = () => {
        if (process == "DHI") {
            setCurrentLegend(DHILegend);
            setCurrentDescription(DHIDescription);
        }
        if (process == "R80P") {
            setCurrentLegend(R80PLegend);
            setCurrentDescription(R80PDescription);
        }
        if (process == "deltaIR") {
            setCurrentLegend(deltaIRLegend);
            setCurrentDescription(deltaIRDescription);
        }
        if (process == undefined) {
            setCurrentLegend([]);
            setCurrentDescription("");
        }
    };

    return (
        <>
            {currentLegend && process != undefined && (
                <>
                    <Box bg="white" p="6" borderWidth="1px" borderRadius="md" boxShadow="sm">
                        <Stack gap="2">
                            <Text fontWeight="semibold">Legend {process}</Text>
                            {currentLegend.map((element) =>
                                <HStack key={element.value} gap="6">
                                    <Box w="6" bg={element.color} pt="4" borderWidth="1px" color="black" />
                                    <Text>{element.value}</Text>
                                </HStack>
                            )}
                        </Stack>
                    </Box>
                    <Box bg="white" p="6" mt="2" borderWidth="1px" borderRadius="md" boxShadow="sm">
                        <Text fontWeight="semibold">Description {process}</Text>
                        <Text>{currentDescription}</Text>

                    </Box>
                </>
            )}
        </>
    );
};
