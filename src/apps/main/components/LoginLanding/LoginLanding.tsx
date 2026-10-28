// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Center, Heading, Stack, Text } from "@chakra-ui/react";
import { AuthService, useAuthState } from "@open-pioneer/authentication";
import { useService } from "open-pioneer:react-hooks";
import { LogIn } from "lucide-react";
import { ReactNode } from "react";

/**
 * Renders its children if the user is authenticated.
 * Otherwise a landing page is shown that asks the user to sign in
 * (instead of redirecting to the login page directly, like `ForceAuth` does).
 */
export function RequireLogin(props: { children?: ReactNode }) {
    const authService = useService<AuthService>("authentication.AuthService");
    const state = useAuthState(authService);

    switch (state.kind) {
        case "pending":
            return null;
        case "not-authenticated":
            return <LoginLanding />;
        case "error":
            return (
                <Center py={20}>
                    <Text color="red.600">Authentication failed: {state.error.message}</Text>
                </Center>
            );
        case "authenticated":
            return <>{props.children}</>;
    }
}

export function LoginLanding() {
    const authService = useService<AuthService>("authentication.AuthService");

    const login = () => {
        const behavior = authService.getLoginBehavior();
        if (behavior.kind === "effect") {
            behavior.login();
        }
    };

    return (
        <Center py={20} px={4}>
            <Box bg="white" borderRadius="lg" boxShadow="md" p={10} maxW="xl" w="100%">
                <Stack gap={6} align="center" textAlign="center">
                    <Heading size="2xl" color="#2C7D75">
                        Welcome to the PEOPLE-ECCO Solutions Platform
                    </Heading>
                    <Text fontSize="lg">
                        You need to sign in to access the platform. Please log in with your
                        PEOPLE-ECCO account to continue.
                    </Text>
                    <Button size="lg" bg="#2C7D75" color="white" onClick={login}>
                        <LogIn /> Sign In
                    </Button>
                </Stack>
            </Box>
        </Center>
    );
}
