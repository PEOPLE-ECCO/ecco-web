// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Box,
    Flex,
    GridItem,
    IconButton,
    Image,
    useColorModeValue,
    useDisclosure
} from "@open-pioneer/chakra-integration";

import {
    CloseIcon,
    HamburgerIcon
} from "@chakra-ui/icons";

import { useState } from "react";

import logo from "../../assets/logo.avif";
import { Profile } from "./Profile";
import { HeaderItem, HeaderProps } from "./HeaderItem";

export default function Header({ view }: HeaderProps) {
    const { isOpen, onToggle } = useDisclosure();
    const [activeHref, setActiveHref] = useState<string>("sites");

    const bgColor = useColorModeValue("#2C7D75", "gray.800");
    const textColor = useColorModeValue("gray.600", "white");
    const borderColor = useColorModeValue("gray.200", "gray.900");

    const handleView = (href: string) => {
        setActiveHref(href);
        view(href);
    };
  
    return (
        <GridItem colSpan={12} rowSpan={1}>
            <Box>
                <Flex
                    bg={bgColor}
                    color={textColor}
                    minH={"86px"}
                    py={{ base: 2 }}
                    px={{ base: 4 }}
                    borderBottom={1}
                    borderStyle={"solid"}
                    borderColor={borderColor}
                    align={"center"}>
                    <Flex
                        flex={{ base: 1, md: "auto" }}
                        ml={{ base: -2 }}
                        display={{ base: "flex", md: "none" }}>
                        <IconButton
                            onClick={onToggle}
                            icon={isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
                            variant="ghost"
                            aria-label="Toggle Navigation"
                            aria-expanded={isOpen}
                        />
                    </Flex>
                    <Flex flex={1} align="center">
                        <Image src={logo} htmlWidth="148px" height="82px" />
                    </Flex>

                    <Flex
                        display={{ base: "none", md: "flex" }}
                        align="center"
                        justify="flex-end"
                        mr={20}
                    >
                        <HeaderItem view={handleView} activeHref={activeHref} />
                    </Flex>

                    <Profile />
                </Flex>
            </Box>
        </GridItem>
    );
}
