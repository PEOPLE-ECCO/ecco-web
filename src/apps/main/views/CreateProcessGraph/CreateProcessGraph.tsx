// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { FC, useState } from "react";
import {
    Box,
    Button,
    Heading,
    Select,
    HStack,
    Text
} from "@open-pioneer/chakra-integration";

const CreateProcessGraph: FC = () => {
    const [selectedOption, setSelectedOption] = useState<string>("");

    const handleButtonClick = (buttonType: string) => {
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
                <Button 
                    onClick={() => handleButtonClick("Button 1")} 
                    variant="solid"
                    backgroundColor="black"
                    color="white"
                    _hover={{ backgroundColor: "gray.500" }}
                    w={"170px"}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={() => handleButtonClick("Button 2")} 
                    colorScheme="green"
                    variant="solid"
                    backgroundColor="black"
                    color="white"
                    _hover={{ backgroundColor: "gray.500" }}
                    w={"170px"}
                >
                    Create
                </Button>
                <Button 
                    onClick={() => handleButtonClick("Button 3")} 
                    colorScheme="red"
                    variant="solid"
                    backgroundColor="black"
                    color="white"
                    _hover={{ backgroundColor: "gray.500" }}    
                    w={"170px"}
                >
                    Create & Execute
                </Button>
            </HStack>
        </Box>
    );
};

export default CreateProcessGraph;
