// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
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
    MenuButton,
    MenuList,
    MenuItem,
    Box
} from "@open-pioneer/chakra-integration";
import { FiMoreVertical } from "react-icons/fi"; // Vertical ellipsis icon

export interface Site {
    preview_image: string;
    description: string;
    id: number;
    name: string;
}

export const Dataset = (site: Site) => {

    return (
        <Card
            key={site.id}
            cursor="pointer"
            _hover={{
                bg: "#abebc6", // light green
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
                <Menu>
                    <MenuButton
                        as={IconButton}
                        icon={<FiMoreVertical />}
                        variant="ghost"
                        aria-label="More options"
                    />
                    <MenuList>
                        <MenuItem>Archive</MenuItem>
                        <MenuItem color="red.500">Delete</MenuItem>
                    </MenuList>
                </Menu>
            </Box>
        </Card>
    );
};
