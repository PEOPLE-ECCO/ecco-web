// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Card,
    Center,
    Icon,
    Text,
    VStack,
    useToast
} from "@open-pioneer/chakra-integration";
import { FiPlus } from "react-icons/fi";
import { useRef } from "react";

export function UploadDataset() {
    const inputRef = useRef<HTMLInputElement>(null);
    const toast = useToast();

    const handleClick = () => {
        inputRef.current?.click(); // Trigger file input click
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            toast({
                title: "File selected",
                description: file.name,
                status: "info",
                duration: 3000,
                isClosable: true
            });

            // You can now upload this file to your server or process it
            console.log("Selected file:", file);
        }
    };

    return (
        <>
            <input
                type="file"
                ref={inputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
            />
            <Card
                cursor="pointer"
                min-height="250px"
                onClick={handleClick}
                _hover={{
                    bg: "#e8f6f3",
                    transform: "scale(1.03)",
                    transition: "all 0.2s ease-in-out"
                }}
                transition="all 0.2s ease-in-out"
                border="2px dashed #ccc"
            >
                <Center w="100%" h="100%">
                    <VStack spacing={3}>
                        <Icon as={FiPlus} boxSize="50px" color="gray.500" />
                        <Text fontSize="lg" color="gray.600">
                            Upload Dataset
                        </Text>
                    </VStack>
                </Center>
            </Card>
        </>
    );
}
