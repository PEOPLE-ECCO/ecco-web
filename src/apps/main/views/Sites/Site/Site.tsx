// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Card,
    CardBody,
    CardHeader,
    Center,
    Heading,
    Image,
    Text
} from "@open-pioneer/chakra-integration";
import { useNavigate } from "react-router-dom";

export interface Site {
    preview_image: string;
    description: string;
    id: number;
    name: string;
}

export const Site = (site: Site) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/sites/${site.id}`);
    };

    return (
        <Card
            key={site.id}
            cursor="pointer"
            onClick={handleClick}
            _hover={{
                bg: "#abebc6", // light green
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
        </Card>
    );
};
