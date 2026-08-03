// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Card,
    CardBody,
    CardHeader,
    Center,
    Heading,
    Image,
    Text
} from "@chakra-ui/react";
import { useNavigate } from "react-router";

export interface Site {
    preview_image: string;
    description: string;
    id: number;
    name: string;
    bbox: number[];
}

export const Site = (site: Site) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/sites/${site.id}`);
    };

    return (
        <Card.Root
            key={site.id}
            cursor="pointer"
            onClick={handleClick}
            _hover={{
                bg: "teal.50", // light teal
                transform: "scale(1.02)",
                transition: "all 0.2s ease-in-out"
            }}
            transition="all 0.2s ease-in-out"
        >
            <Center w="100%" mt="20px" color="white">
                <Image
                    src={site.preview_image}
                    alt={site.name}
                    borderRadius="lg"
                    boxSize="250px"
                    objectFit="cover"
                />
            </Center>
            <Center >
            <CardHeader>
                <Heading size="md">{site.name}</Heading>
            </CardHeader>
            </Center>
            <CardBody>
                <Text>{site.description}</Text>
            </CardBody>
        </Card.Root>
    );
};
