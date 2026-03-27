// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Box,
    Flex,
    GridItem,
    IconButton,
    Image,
    useDisclosure
} from "@chakra-ui/react";

// import { useColorModeValue } from "@chakra-ui/react/col"

import {
    Menu,
    SquareChevronUp
} from "lucide-react";

import { useNavigate } from "react-router";

import logo from "../../assets/logo.png";
import { Profile } from "./Profile";
import { HeaderItem } from "./HeaderItem";

export default function Header() {
    const { open, onToggle } = useDisclosure();
    const navigate = useNavigate();
 
    return (
        <GridItem colSpan={12} rowSpan={1}>
            <Box>
                <Flex
                    bg={"#2C7D75"}
                    color={"#d0ffff"}
                    minH="var(--header-height)"
                    maxH="var(--header-height)"
                    py={0}
                    px={2}
                    borderBottom={1}
                    borderStyle={"solid"}
                    borderColor={"gray.200"}
                    align={"center"}
                >
                    <Flex
                        flex={{ base: 1, md: "auto" }}
                        ml={{ base: -2 }}
                        display={{ base: "flex", md: "none" }}>
                        <IconButton
                            onClick={onToggle}
                            variant="ghost"
                            aria-label="Toggle Navigation"
                            aria-expanded={open}
                        >
                            <Menu></Menu>
                        </IconButton>

                    </Flex>
                    <Flex flex={1} align="center">
                        <Box onClick={() => navigate("/")} cursor="pointer">
                            <Image src={logo} htmlWidth="198px" height="74px" />
                        </Box>
                        <Box fontSize={"28px"} fontWeight={"bold"}>
                            PEOPLE-ECCO Solutions Platform
                        </Box>
                    </Flex>
                    

                    <Flex
                        display={{ base: "none", md: "flex" }}
                        align="center"
                        justify="flex-end"
                        mr={20}
                    >
                        <HeaderItem />
                    </Flex>

                    <Profile />
                </Flex>
            </Box>
        </GridItem>
    );
}
