// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, HStack, Stack, Text, useEditable } from "@chakra-ui/react";
import { useServices } from "../../services/Services";
import { useEffect, useState } from "react";
import { LegendElement, Process, LegendAndDescription } from "../definitions";

interface LegendControlProps {
    process?: string;
}


export const Legend = ({ process }: LegendControlProps) => {

    const [currentLegend, setCurrentLegend] = useState<LegendElement[]>([]);
    const [currentDescription, setCurrentDescription] = useState<string>();

    useEffect(() => {
        console.log("process changed", process);
        setContent();
    }, [process]);

    const fetchLegendDummy = async (process: string) : Promise<LegendAndDescription> => {
        return new Promise((resolve, reject) => {
            let result : LegendAndDescription | undefined = undefined;
            const lowered = process?.trim().toLowerCase();
            switch (lowered) {
                case "openeo raw files":
                    console.log("Handling OpenEO Raw Files...");
                    result = {
                        processName: lowered,
                        entries: [{ value: "Red", color: "red" }, { value: "Green", color: "green" }, { value: "Blue", color: "blue " }],
                        description: "Raw openEO scenes, rendered as pseudo-color composites for visualisation pruposes."
                    };
                    break;

                case "overall probability":
                    console.log("Handling Overall Probability...");
                    result = {
                        processName: lowered,
                        entries: [{ value: "Corals", color: "red" }, { value: "SAV", color: "green" }, { value: "Water/other", color: "blue" }],
                        description: "Probabilities for single scenes. The coloring follows a gradient: e.g. intensive red shows a high coral probability, light red a lower value."
                    };
                    break;

                case "aggregated probability":
                    console.log("Handling Aggregated Probability...");
                    result = {
                        processName: lowered,
                        entries: [{ value: "Corals", color: "red" }, { value: "SAV", color: "green" }, { value: "Water/other", color: "blue" }],
                        description: "Probabilities aggregated over all scenes. The coloring follows a gradient: e.g. intensive red shows a high coral probability, light red a lower value."
                    };
                    break;

                case "sav probability":
                    console.log("Handling SAV Probability...");
                    result = {
                        processName: lowered,
                        entries: [{ value: "No SAV", color: "red" }, { value: "SAV", color: "green" }, { value: "No Data", color: "white" }],
                        description: "Submerged aquatic vegetation probabilities aggregated over all scenes"
                    };
                    break;

                case "coral probability":
                    console.log("Handling Coral Probability...");
                    result = {
                        processName: lowered,
                        entries: [{ value: "No Corals", color: "red" }, { value: "Corals", color: "green" }, { value: "No Data", color: "white" }],
                        description: "Coral probabilities aggregated over all scenes"
                    };
                    break;

                case "prediction":
                    console.log("Handling Prediction...");
                    result = {
                        processName: lowered,
                        entries: [{ value: "Corals", color: "red" }, { value: "SAV", color: "green" }, { value: "No Data", color: "white" }],
                        description: "Prediction results, following a binary classifcation."
                    };
                    break;

                case "geojson-sav":
                    console.log("Handling GeoJSON SAV...");
                    result = {
                        processName: lowered,
                        entries: [{ value: "SAV patch", color: "lightcyan" }, { value: "Selected patch", color: "red" }, { value: "Neighour patch", color: "green" }],
                        description: "Patches of SAV classification, including information on topology. Selecting a patch also marks its neighbours."
                    };
                    break;

                case "geojson-coral":
                    console.log("Handling GeoJSON Coral...");
                    result = {
                        processName: lowered,
                        entries: [{ value: "Coral patch", color: "lightcyan" }, { value: "Selected patch", color: "red" }, { value: "Neighour patch", color: "green" }],
                        description: "Patches of Coral classification, including information on topology. Selecting a patch also marks its neighbours."
                    };
                    break;
            }

            if (!result) {
                result = {
                    processName: lowered,
                    entries: [],
                    description: "No legend available"
                };
            }
            
            resolve(result!);
        });
    };


    const setContent = async () => {
        console.log("LEGEND: "+process);
        if (process) {
            const legendData = await fetchLegendDummy(process!);
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
