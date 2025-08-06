// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import {
    Card,
    Center,
    Icon,
    Text,
    VStack
} from "@chakra-ui/react";

import { NotificationService, Notifier } from "@open-pioneer/notifier";

import { FiPlus } from "react-icons/fi";
import { useRef } from "react";
import { useService } from "open-pioneer:react-hooks";

export function UploadDataset() {
    const inputRef = useRef<HTMLInputElement>(null);

    const notificationService = useService<NotificationService>("notifier.NotificationService");

    const handleClick = () => {
        inputRef.current?.click(); // Trigger file input click
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            notificationService.notify({
                title: "File selected",
                message: file.name,
                level: "info",
                displayDuration: 3000,
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
            <Card.Root
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
                    <VStack>
                        <Icon as={FiPlus} boxSize="50px" color="gray.500" />
                        <Text fontSize="lg" color="gray.600">
                            Upload Dataset
                        </Text>
                    </VStack>
                </Center>
            </Card.Root>
        </>
    );
}
