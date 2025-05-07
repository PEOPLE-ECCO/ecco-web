// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { FC, useState } from "react";
import {
    Box,
    Heading,
    Select,
    HStack,
    Text
} from "@open-pioneer/chakra-integration";
import { ActionButton } from "../../components/Timeseries/ActionButton";

const CreateProcessGraph: FC = () => {
    const [selectedOption, setSelectedOption] = useState<string>("");

    const cancel = (buttonType: string) => {
        console.log(`Button clicked: ${buttonType}`);
    };

    const create = (buttonType: string) => {
        console.log(`Button clicked: ${buttonType}`);
    };

    const execute = (buttonType: string) => {
        console.log(`Button clicked: ${buttonType}`);
    };

    return (
        <Box p="4" borderRadius="md" boxShadow="sm" bg="white">
            <Heading size="md" mb={4}>
                Create Process Graph
            </Heading>

            <HStack spacing={4} mb={4}>
                <Select
                    placeholder="Select an option"
                    onChange={(e) => setSelectedOption(e.target.value)}
                    value={selectedOption}
                    width="200px"
                >
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                </Select>

                <Text fontWeight="medium">Selected: {selectedOption || "None"}</Text>
            </HStack>

            <HStack spacing={4}>
                <ActionButton
                    label="Cancel"
                    tooltip="Cancel creation"
                    onClick={() => cancel("cancel")}
                    w={"170px"}
                />
                <ActionButton
                    label="Create"
                    tooltip="Create process graph"
                    onClick={() => create("create")} 
                    w={"170px"}
                />
                <ActionButton
                    label="Create & Execute"
                    tooltip="Create process graph and run"
                    onClick={() => execute("create and run")} 
                    w={"170px"}
                />
            </HStack>
        </Box>
    );
};

export default CreateProcessGraph;
