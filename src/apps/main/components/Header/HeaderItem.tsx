// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Box,
    Popover,
    Stack
} from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router";

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
    // {
    //     label: "Data Inventory",
    //     href: "/dataInventory",
    // },
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

    // const linkHoverColor = useColorModeValue("gray.800", "white");
    //const popoverContentBgColor = useColorModeValue("white", "gray.800");

    const redirect = (href: string) => navigate(href);

    return (
        <Stack direction={"row"}>
            {NAV_ITEMS.map((navItem) => {
                const isActive =
                    location.pathname === navItem.href ||
                    (location.pathname === "/" && navItem.href === "/sites") ||
                    (navItem.href && location.pathname.startsWith(navItem.href));

                return (
                    
                    <Box key={navItem.label} alignContent={"center"}>
                        <Popover.Root trigger={"hover"} placement={"bottom-start"}>
                            <Popover.Trigger>
                                <Box
                                    as="a"
                                    p={2}
                                    onClick={() => navItem.href && redirect(navItem.href)}
                                    fontSize={"x-large"}
                                    fontWeight={isActive ? 700 : 500}
                                    color={isActive ? "teal.50" : "white"}
                                    borderBottom={isActive ? "2px solid" : "none"}
                                    borderColor={isActive ? "teal.50" : "transparent"}
                                    _hover={{
                                        textDecoration: "none",
                                        color: "gray.800",
                                        cursor: "pointer",
                                    }}
                                >
                                    {navItem.label}
                                </Box>
                            </Popover.Trigger>

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
                        </Popover.Root>
                    </Box>
                );
            })}
        </Stack>
    );
};
