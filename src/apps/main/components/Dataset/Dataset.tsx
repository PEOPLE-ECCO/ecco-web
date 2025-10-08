// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Card,
    CardBody,
    CardHeader,
    Center,
    Heading,
    Image,
    Text,
    IconButton,
    Menu,
    MenuItem,
    Box,
    Portal
} from "@chakra-ui/react";
import { Ellipsis } from "lucide-react";
import { FiMoreVertical } from "react-icons/fi"; // Vertical ellipsis icon

export interface Site {
    preview_image: string;
    description: string;
    id: number;
    name: string;
}

export const Dataset = (site: Site) => {

    return (
        <Card.Root
            key={site.id}
            cursor="pointer"
            _hover={{
                bg: "teal.50", // light teal
                transform: "scale(1.02)",
                transition: "all 0.2s ease-in-out"
            }}
            transition="all 0.2s ease-in-out"
            position="relative" // For absolute positioning of the menu
        >
            <Center w="100%" mt="20px" color="white">
                <Image
                    src={site.preview_image}
                    alt={site.name}
                    borderRadius="lg"
                    boxSize="150px"
                    objectFit="cover"
                />
            </Center>
            <CardHeader>
                <Heading size="md">{site.name}</Heading>
            </CardHeader>
            <CardBody>
                <Text>{site.description}</Text>
            </CardBody>

            {/* Vertical Ellipsis Menu Button */}
            <Box position="absolute" bottom="10px" right="10px">
                <Menu.Root>
                    <Menu.Trigger asChild>
                        <IconButton variant="outline" size="sm">
                            <Ellipsis />
                        </IconButton>
                    </Menu.Trigger>
                    <Portal>
                        <Menu.Positioner>
                            <Menu.Content>
                                <Menu.Item value="delete" disabled={true}>Delete</Menu.Item>
                                <Menu.Item value="archive" disabled={true}>Archive</Menu.Item>
                            </Menu.Content>
                        </Menu.Positioner>
                    </Portal>

                </Menu.Root>
            </Box>
        </Card.Root>
    );
};
