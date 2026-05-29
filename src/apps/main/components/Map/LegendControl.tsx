// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, HStack, Stack, Text, useEditable } from "@chakra-ui/react";
import { useServices } from "../../services/Services";
import { useEffect, useState } from "react";
import { LegendElement, Process, LegendAndDescription, Timeseries } from "../definitions";

interface LegendControlProps {
    process?: string;
    timeseries?: Timeseries
}


export const Legend = ({ process, timeseries }: LegendControlProps) => {

    const [currentLegend, setCurrentLegend] = useState<LegendElement[]>([]);
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
        console.log("LEGEND: "+process);
        if (process) {
            const legendData = await fetchLegend(process!);
            console.log(legendData);
            if (legendData) {
                setCurrentLegend(legendData.entries);
                setCurrentDescription(legendData.description);
            }
        }
        

        // if (process == "DHI") {
        //     setCurrentLegend(DHILegend);
        //     setCurrentDescription(DHIDescription);
        // }
        // if (process == "R80P") {
        //     setCurrentLegend(R80PLegend);
        //     setCurrentDescription(R80PDescription);
        // }
        // if (process == "deltaIR") {
        //     setCurrentLegend(deltaIRLegend);
        //     setCurrentDescription(deltaIRDescription);
        // }
        // if (process == undefined) {
        //     setCurrentLegend([]);
        //     setCurrentDescription("");
        // }


    };


    return (
        <>
            {currentLegend && process != undefined && (
                <>
                    <Box bg="white" p="6" borderWidth="1px" borderRadius="md" boxShadow="sm">
                        <Stack gap="2">
                            <Text fontWeight="semibold">Legend <span style={{fontStyle: "italic"}}>{process}</span></Text>
                            {currentLegend.map((element) =>
                                <HStack key={element.value} gap="6">
                                    <Box w="6" bg={element.color} pt="4" borderWidth="1px" color="black" />
                                    <Text>{element.value}</Text>
                                </HStack>
                            )}
                        </Stack>
                    </Box>
                    <Box bg="white" p="6" mt="2" borderWidth="1px" borderRadius="md" boxShadow="sm">
                        <Text fontWeight="semibold">Description</Text>
                        <Text>{currentDescription}</Text>
                    </Box>
                </>
            )}
        </>
    );
};
