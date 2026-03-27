// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Image, Text, Flex, Link, HStack, Spacer } from "@chakra-ui/react";
import { Code } from "lucide-react";

import esa from "../../assets/esa.png";
import partners from "../../assets/partners.png";

export const Footer = () => {
    return (
        <Box bg="#1f2229" color="white" py="1" mt="auto" minH="var(--footer-height)" maxH="var(--footer-height)" overflow="hidden">
            <Container maxW="100%">
                <Flex
                    direction={{ base: "column", md: "row" }}
                    justify="space-between"
                    align="center"
                    gap="6"
                >
                    <HStack>
                        <Link href="https://www.esa.int/" target="_blank">
                            <Image src={esa} height="22px" />
                        </Link>
                        <Text fontSize="sm">Funded by the European Space Agency (ESA)</Text>
                    </HStack>

                    <Spacer />


                    <Link
                        color="white"
                        href="https://github.com/PEOPLE-ECCO"
                        isExternal
                        fontSize="sm"
                        target="_blank"
                        _hover={{ textDecoration: "underline" }}
                    >
                        <HStack spacing="2" align="center">
                            <Code size={16} />
                            <Text>GitHub</Text>
                        </HStack>
                    </Link>

                    <Link
                        color="white"
                        href="https://www.people-ecco.eu/"
                        isExternal
                        fontSize="sm"
                        target="_blank"
                        _hover={{ textDecoration: "underline" }}
                    >
                        About PEOPLE-ECCO
                    </Link>
                </Flex>
            </Container>
        </Box>
    );
};
