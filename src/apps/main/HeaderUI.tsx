// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { Avatar, Box, Button, Center, Flex, Icon, IconButton, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Popover, PopoverContent, PopoverTrigger, Stack, Text, useBreakpointValue, useColorModeValue, useDisclosure } from "@open-pioneer/chakra-integration";
import {
    HamburgerIcon,
    CloseIcon,
    ChevronRightIcon
} from "@chakra-ui/icons";
import { AuthService, ForceAuth, useAuthState } from "@open-pioneer/authentication";
import { useService } from "open-pioneer:react-hooks";
import { useEffect, useState } from "react";

const NAV_ITEMS: Array<NavItem> = [
    {
        label: "Explore",
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
    },
    {
        label: "Upload Data",
        href: "upload",
    },
    {
        label: "Documentation",
        href: "docs",
    },
];


interface NavItem {
    label: string
    subLabel?: string
    children?: Array<NavItem>
    href?: string
}

interface HeaderProps {
    view: (v: string) => void;
}

export default function Header(props: HeaderProps) {
    const { isOpen, onToggle } = useDisclosure();
  
    return (
        <Box>
            <Flex
                bg={useColorModeValue("white", "gray.800")}
                color={useColorModeValue("gray.600", "white")}
                minH={"60px"}
                py={{ base: 2 }}
                px={{ base: 4 }}
                borderBottom={1}
                borderStyle={"solid"}
                borderColor={useColorModeValue("gray.200", "gray.900")}
                align={"center"}>
                <Flex
                    flex={{ base: 1, md: "auto" }}
                    ml={{ base: -2 }}
                    display={{ base: "flex", md: "none" }}>
                    <IconButton
                        onClick={onToggle}
                        icon={isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
                        variant={"ghost"}
                        aria-label={"Toggle Navigation"}
                    />
                </Flex>
                <Flex flex={{ base: 1 }} justify={{ base: "center", md: "start" }}>
                    <Text
                        textAlign={useBreakpointValue({ base: "center", md: "left" })}
                        fontFamily={"heading"}
                        color={useColorModeValue("gray.800", "white")}>
              Logo
                    </Text>
  
                    <Flex display={{ base: "none", md: "flex" }} ml={10}>
                        <DesktopNav view={props.view} />
                    </Flex>
                </Flex>
  
                <Profile></Profile>
            </Flex>
        </Box>
    );
}

const DesktopNav = (props: HeaderProps) => {
    const linkColor = useColorModeValue("gray.600", "gray.200");
    const linkHoverColor = useColorModeValue("gray.800", "white");
    const popoverContentBgColor = useColorModeValue("white", "gray.800");
  
    return (
        <Stack direction={"row"} spacing={4}>
            {NAV_ITEMS.map((navItem) => (
                <Box key={navItem.label}>
                    <Popover trigger={"hover"} placement={"bottom-start"}>
                        <PopoverTrigger>
                            <Box
                                as="a"
                                p={2}
                                onClick={() => props.view(navItem.href!)}
                                fontSize={"sm"}
                                fontWeight={500}
                                color={linkColor}
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
                                        <DesktopSubNav key={child.label}  label={child.label} href={child.href!} subLabel={child.subLabel!} menu={props.view}/>
                                    ))}
                                </Stack>
                            </PopoverContent>
                        )}
                    </Popover>
                </Box>
            ))}
        </Stack>
    );
};

interface DesktopSubNavProps {
    label: string
    subLabel: string
    href: string
    menu: (v: string) => void;
}
  
const DesktopSubNav = (props: DesktopSubNavProps) => {
    const {label, subLabel, href, menu} = props;
    return (
        <Box
            as="a"
            onClick={() => menu(href!)}
            role={"group"}
            display={"block"}
            p={2}
            rounded={"md"}
            _hover={{ bg: useColorModeValue("pink.50", "gray.900") }}>
            <Stack direction={"row"} align={"center"}>
                <Box>
                    <Text
                        transition={"all .3s ease"}
                        _groupHover={{ color: "pink.400" }}
                        fontWeight={500}>
                        {label}
                    </Text>
                    <Text fontSize={"sm"}>{subLabel}</Text>
                </Box>
                <Flex
                    transition={"all .3s ease"}
                    transform={"translateX(-10px)"}
                    opacity={0}
                    _groupHover={{ opacity: "100%", transform: "translateX(0)" }}
                    justify={"flex-end"}
                    align={"center"}
                    flex={1}>
                    <Icon color={"pink.400"} w={5} h={5} as={ChevronRightIcon} />
                </Flex>
            </Stack>
        </Box>
    );
};


const Profile = () => {
    const [authenticated, setAuthenticated] = useState(false);
    
    const authService = useService<AuthService>("authentication.AuthService");
    const authState = useAuthState(authService);
    const sessionInfo = authState.kind == "authenticated" ? authState.sessionInfo : undefined;

    useEffect(() => {   
        setAuthenticated(sessionInfo != undefined);
    }, [authService, authState, sessionInfo]);
    const userName = sessionInfo?.attributes?.userName as string;

    authService.on("changed", () => {
        setAuthenticated(false);
    });

    return (
        <>
            {!authenticated &&
            <Stack
                flex={{ base: 1, md: 0 }}
                justify={"flex-end"}
                direction={"row"}
                spacing={6}>
                <Button as={"a"} fontSize={"sm"} fontWeight={400} variant={"link"} href={"#"} onClick={() => setAuthenticated(true)}>
                    Sign In
                </Button>
            </Stack>
            }
            {authenticated &&
            <>
                <ForceAuth>
                    <Menu>
                        <MenuButton
                            as={Button}
                            rounded={"full"}
                            variant={"link"}
                            cursor={"pointer"}
                            minW={0}>
                            <Avatar
                                size={"sm"}
                                src={"https://52north.org/wp-content/uploads/2016/06/logo-main.png"}
                            />
                        </MenuButton>
                        <MenuList alignItems={"center"}>
                            <br />
                            <Center>
                                <Avatar
                                    size={"2xl"}
                                    src={"https://52north.org/wp-content/uploads/2016/06/logo-main.png"}
                                />
                            </Center>
                            <br />
                            <Center>
                                <p>{userName}</p>
                            </Center>
                            <br />
                            <MenuDivider />
                            <MenuItem>Account Settings (tbd)</MenuItem>
                            <MenuItem onClick={() => authService.logout()}>Logout</MenuItem>
                        </MenuList>
                    </Menu>
                </ForceAuth>
            </>
            }
        </>
    );
};