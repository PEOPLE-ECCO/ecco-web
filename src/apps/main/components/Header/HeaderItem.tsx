// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Box,
    Popover,
    //PopoverContent,
    PopoverTrigger,
    Stack,
    useColorModeValue
} from "@open-pioneer/chakra-integration";
import { useNavigate, useLocation } from "react-router-dom";

//import { HeaderSubItem } from "./HeaderSubItem";

const NAV_ITEMS: Array<NavItem> = [
    {
        label: "Sites",
        children: [
            {
                label: "Explore Processes",
                subLabel: "Processes and Workflows",
                href: "explore-processes",
            },
            {
                label: "Explore Data",
                subLabel: "",
                href: "explore-data",
            },
        ],
        href: "/sites",
    },
    {
        label: "Data Inventory",
        href: "/dataInventory",
    },
    {
        label: "Documentation",
        href: "/documentation",
    },
];

interface NavItem {
    label: string;
    subLabel?: string;
    children?: Array<NavItem>;
    href?: string;
}

export const HeaderItem = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const linkHoverColor = useColorModeValue("gray.800", "white");
    //const popoverContentBgColor = useColorModeValue("white", "gray.800");

    const redirect = (href: string) => navigate(href);

    return (
        <Stack direction={"row"} spacing={4}>
            {NAV_ITEMS.map((navItem) => {
                const isActive =
                    location.pathname === navItem.href ||
                    (location.pathname === "/" && navItem.href === "/sites") ||
                    (navItem.href && location.pathname.startsWith(navItem.href));

                return (
                    <Box key={navItem.label} alignContent={"center"}>
                        <Popover trigger={"hover"} placement={"bottom-start"}>
                            <PopoverTrigger>
                                <Box
                                    as="a"
                                    p={2}
                                    onClick={() => navItem.href && redirect(navItem.href)}
                                    fontSize={"x-large"}
                                    fontWeight={isActive ? 700 : 500}
                                    color={isActive ? "yellow.300" : "white"}
                                    borderBottom={isActive ? "2px solid" : "none"}
                                    borderColor={isActive ? "yellow.300" : "transparent"}
                                    _hover={{
                                        textDecoration: "none",
                                        color: linkHoverColor,
                                        cursor: "pointer",
                                    }}
                                >
                                    {navItem.label}
                                </Box>
                            </PopoverTrigger>

                            {/* Uncomment if needed:
                            {navItem.children && (
                                <PopoverContent
                                    border={0}
                                    boxShadow={"xl"}
                                    bg={popoverContentBgColor}
                                    p={4}
                                    rounded={"xl"}
                                    minW={"sm"}>
                                    <Stack>
                                        {navItem.children.map((child) => (
                                            <HeaderSubItem
                                                key={child.label}
                                                label={child.label}
                                                href={child.href!}
                                                subLabel={child.subLabel!}
                                                menu={redirect}
                                            />
                                        ))}
                                    </Stack>
                                </PopoverContent>
                            )} */}
                        </Popover>
                    </Box>
                );
            })}
        </Stack>
    );
};
