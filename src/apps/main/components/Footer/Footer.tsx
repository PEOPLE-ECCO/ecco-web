// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Text, Flex, Link, HStack } from "@open-pioneer/chakra-integration";
import { Code } from "lucide-react";

export const Footer = () => {
    return (
        <Box bg="#1f2229" color="white" py="6" mt="auto">
            <Container maxW="80%">
                <Flex
                    direction={{ base: "column", md: "row" }}
                    justify="space-between"
                    align="center"
                    gap="4"
                >
                    <Text fontSize="sm">Funded by European Space Agency (ESA)</Text>

                    <Link
                        href="https://github.com/PEOPLE-ECCO"
                        isExternal
                        fontSize="sm"
                        _hover={{ textDecoration: "underline" }}
                    >
                        <HStack spacing="2" align="center">
                            <Code size={16} />
                            <Text>GitHub</Text>
                        </HStack>
                    </Link>

                    <Link
                        href="https://www.people-ecco.eu/"
                        isExternal
                        fontSize="sm"
                        _hover={{ textDecoration: "underline" }}
                    >
                        About People-Ecco
                    </Link>
                </Flex>
            </Container>
        </Box>
    );
};
