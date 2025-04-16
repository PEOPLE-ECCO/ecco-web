// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Box,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Stack,
    useColorModeValue
} from "@open-pioneer/chakra-integration";

import { HeaderSubItem } from "./HeaderSubItem";

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
        href: "sites",
    },
    {
        label: "Data Inventory",
        href: "dataInventory",
    },
    {
        label: "Documentation",
        href: "documentation",
    },
];


interface NavItem {
    label: string
    subLabel?: string
    children?: Array<NavItem>
    href?: string
}

export interface HeaderProps {
    view: (v: string) => void;
    activeHref: string;
}

export const HeaderItem = (props: HeaderProps) => {
    const linkHoverColor = useColorModeValue("gray.800", "white");
    const popoverContentBgColor = useColorModeValue("white", "gray.800");
    const {view, activeHref} = props;
  
    return (
        <Stack direction={"row"} spacing={4}>
            {NAV_ITEMS.map((navItem) => {
                const isActive = activeHref === navItem.href;

                return (
                    <Box key={navItem.label} alignContent={"center"}>
                        <Popover trigger={"hover"} placement={"bottom-start"}>
                            <PopoverTrigger>
                                <Box
                                    as="a"
                                    p={2}
                                    onClick={() => navItem.href && view(navItem.href)}
                                    fontSize={"x-large"}
                                    color={isActive ? "yellow.300" : "white"}
                                    borderBottom={isActive ? "2px solid" : "none"}
                                    borderColor={isActive ? "yellow.300" : "transparent"}
                                    _hover={{
                                        textDecoration: "none",
                                        color: linkHoverColor,
                                        cursor: "pointer",
                                    }}>
                                    {navItem.label}
                                </Box>
                            </PopoverTrigger>

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
                                                menu={view}
                                            />
                                        ))}
                                    </Stack>
                                </PopoverContent>
                            )}
                        </Popover>
                    </Box>
                );
            })}
        </Stack>
    );
};