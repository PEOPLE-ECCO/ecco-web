// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, HStack, Stack, Text } from "@chakra-ui/react";

interface LegendControlProps {
    process?: string;
}

export const Legend = ({ process }: LegendControlProps) => {
    const DHILegend = [{ value: "Corals", color: "red" }, { value: "SAV", color: "green" }, { value: "No Data", color: "white" }];
    const R80PLegend = [{ value: "much vegetation", color: "black" }, { value: "some vegetation", color: "gray" }, { value: "no vegetation", color: "white" }];
    return (
        <Box bg="white" p="4" borderWidth="1px" borderRadius="md" boxShadow="sm">
            <Stack gap="2" p="4">
            <Text fontWeight="semibold">{process} Legend</Text>
            {process == "DHI" && (
                <>
                    {DHILegend.map((element) =>
                        <HStack key={element.value} gap="6">
                            <Box w="6" bg={element.color} pt="4" borderWidth="1px" color="black"/>
                            <Text>{element.value}</Text>
                        </HStack>
                    )}
                </>
            )}
            {process == "R80P" && (
                <>
                    {R80PLegend.map((element) =>
                        <HStack key={element.value} gap="6">
                            <Box w="6" bg={element.color} pt="4" borderWidth="1px" color="black"/>
                            <Text>{element.value}</Text>
                        </HStack>
                    )}
                </>
            )}
        </Stack>
        </Box>
    );
};
