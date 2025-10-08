// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Avatar,
    Box,
    Button,
    Center,
    Menu,
    Stack,
    HStack,
    Portal
} from "@chakra-ui/react";

import { AuthService, ForceAuth, LoginEffect, useAuthState } from "@open-pioneer/authentication";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";
import { useService } from "open-pioneer:react-hooks";

export const Profile = () => {
    const authService = useService<AuthService>("authentication.AuthService");
    const authState = useAuthState(authService);
    const sessionInfo = authState.kind == "authenticated" ? authState.sessionInfo : undefined;

    const userName = sessionInfo?.attributes?.userName as string;
    const givenName = sessionInfo?.attributes?.givenName as string;
    const familyName = sessionInfo?.attributes?.familyName as string;

    const authenticated = useReactiveSnapshot(() => {
        return authService.getAuthState().kind == "authenticated";
    }, [authService]);

    const accountSettings = [
        {
            title: "Account Settings",
            href: "https://people-ecco.dev.52north.org/auth/realms/people-ecco/account"
        }];

    return (
        <>
            {!authenticated &&
                <Stack
                    flex={{ base: 1, md: 0 }}
                    justify={"flex-end"}
                    direction={"row"}>
                    <Button asChild 
                        as={"a"} 
                        fontSize={"lg"} 
                        color={"#2C7D75"} 
                        fontWeight={"semibold"} 
                        colorPalette={"white"} 
                        variant={"subtle"} 
                        onClick={() => (authService.getLoginBehavior() as LoginEffect).login()}
                        >
                        <a href={"#"}>Sign In</a>
                    </Button>
                </Stack>
            }
            {authenticated &&
                <>
                    <ForceAuth>
                        <Menu.Root>
                            <Menu.Trigger asChild
                                cursor={"pointer"}
                                minW={0}
                                _hover={{ textDecoration: "none" }}
                            >
                                <Button 
                                    as={"a"} 
                                    fontSize={"lg"} 
                                    color={"#2C7D75"} 
                                    fontWeight={"semibold"} 
                                    colorPalette={"white"} 
                                    variant={"subtle"}
                                    >
                                    <HStack>
                                        <Avatar.Root
                                            size={"xs"}
                                        >
                                            <Avatar.Image src="https://52north.org/wp-content/uploads/2016/06/logo-main.png"></Avatar.Image>
                                        </Avatar.Root>
                                    </HStack>
                                    {familyName}
                                </Button>
                            </Menu.Trigger>

                            <Portal>
                                <Menu.Positioner>
                                    <Menu.Content zIndex={10000}>
                                        <Menu.ItemGroup alignItems={"center"} zIndex={99}>
                                            <Box backgroundColor="white">
                                                <br />
                                                <Center>
                                                    <Avatar.Root size={"2xl"}>
                                                        <Avatar.Fallback name={givenName + " " + familyName} />
                                                        <Avatar.Image src="https://52north.org/wp-content/uploads/2016/06/logo-main.png" />
                                                    </Avatar.Root>
                                                </Center>
                                                <br />
                                                <Center>
                                                    <p>{userName} <br /> {givenName} {familyName}</p>
                                                </Center>
                                                <br />
                                                <Menu.Separator />
                                                    {accountSettings.map((link) => (
                                                        <Menu.Item key={link.href} asChild value={link.title}>
                                                            <a href={link.href} target="_blank" rel="noreferrer">
                                                                {link.title}
                                                            </a>
                                                        </Menu.Item>
                                                    ))}
                                                <Menu.Item value="logout" onClick={() => authService.logout()}>Logout</Menu.Item>
                                            </Box>
                                        </Menu.ItemGroup>
                                    </Menu.Content>
                                </Menu.Positioner>
                            </Portal>
                        </Menu.Root>
                    </ForceAuth>
                </>
            }
        </>
    );
};