// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Avatar,
    Box,
    Button,
    Center,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    Stack,
    HStack
} from "@open-pioneer/chakra-integration";

import { AuthService, ForceAuth, useAuthState } from "@open-pioneer/authentication";

import { useEffect, useState } from "react";
import { useService } from "open-pioneer:react-hooks";

export const Profile = () => {
    const [authenticated, setAuthenticated] = useState(false);
    
    const authService = useService<AuthService>("authentication.AuthService");
    const authState = useAuthState(authService);
    const sessionInfo = authState.kind == "authenticated" ? authState.sessionInfo : undefined;

    useEffect(() => {
        setAuthenticated(sessionInfo != undefined);
    }, [authService, authState, sessionInfo]);

    const userName = sessionInfo?.attributes?.userName as string;
    const givenName = sessionInfo?.attributes?.givenName as string;
    const familyName = sessionInfo?.attributes?.familyName as string;

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
                            minW={0}
                            _hover={{ textDecoration: "none" }}
                        >
                            <HStack spacing={3}>
                                <Avatar
                                    size={"sm"}
                                    src={"https://52north.org/wp-content/uploads/2016/06/logo-main.png"}
                                />
                                <Box
                                    fontSize={"x-large"}
                                    fontWeight={500}
                                    color={"white"}
                                >
                                    {familyName}
                                </Box>
                            </HStack>
                        </MenuButton>
                        <MenuList zIndex={100} alignItems={"center"}>
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
                                <br></br>
                                <p>{givenName} {familyName}</p>
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