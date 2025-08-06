// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Box,
    Flex,
    Icon,
    Stack,
    Text,
} from "@chakra-ui/react";

import { ChevronRight } from 'lucide-react';

interface DesktopSubNavProps {
    label: string
    subLabel: string
    href: string
    menu: (v: string) => void;
}
  
export const HeaderSubItem = ({ label, subLabel, href, menu }: DesktopSubNavProps) => {
    const hoverBg = useColorModeValue("pink.50", "gray.900");
    const hoverColor = useColorModeValue("pink.400", "pink.300");

    return (
        <Box
            as="div"
            onClick={() => href && menu(href)}
            role="group"
            p={2}
            rounded="md"
            _hover={{ bg: hoverBg, cursor: "pointer" }}
            tabIndex={0}
        >
            <Stack direction="row" align="center">
                <Box>
                    <Text
                        transition="all .3s ease"
                        _groupHover={{ color: hoverColor }}
                        fontWeight={500}
                    >
                        {label}
                    </Text>
                    {subLabel && (
                        <Text fontSize="sm" color="gray.500">
                            {subLabel}
                        </Text>
                    )}
                </Box>
                <Flex
                    transition="all .3s ease"
                    transform="translateX(-10px)"
                    opacity={0}
                    _groupHover={{ opacity: 1, transform: "translateX(0)" }}
                    justify="flex-end"
                    align="center"
                    flex={1}
                >
                    <ChevronRight />
                </Flex>
            </Stack>
        </Box>
    );
};

