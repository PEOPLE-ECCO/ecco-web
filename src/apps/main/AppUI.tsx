// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { ForceAuth } from "@open-pioneer/authentication";
import { Notifier } from "@open-pioneer/notifier";
import { Box, ChakraProvider, Container, Flex } from "@open-pioneer/chakra-integration";

import { useMeasure } from "react-use";

import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Header from "./components/Header/Header";
import { Sites } from "./views/Sites/Sites";
import { DataInventory } from "./views/DataInventory/DataInventory";
import { Documentation } from "./views/Documentation/Documentation";
import { SiteDetails } from "./views/Sites/SiteDetails/SiteDetails";
import { Footer } from "./components/Footer/Footer";

const basePath = "/";

const router = createBrowserRouter([
    {
        path: `${basePath}`,
        element: <Layout />,
        children: [
            {
                path: ``,
                element: <Sites />
            },
            {
                path: `sites`,
                element: <Sites />
            },
            {
                path: `site/:id`,
                element: <SiteDetails />
            },
            {
                path: `dataInventory`,
                element: <DataInventory />
            },
            {
                path: `documentation`,
                element: <Documentation />
            }
        ]
    }
]);

export function AppUI() {
    return <RouterProvider router={router} />;
}

export function Layout() {
    const [headerRef, { height }] = useMeasure<HTMLElement>();

    return (
        <ChakraProvider>
            <Notifier />

            <Flex direction="column" minH="100vh">

                <Flex
                    as="header"
                    position="fixed"
                    w="100%"
                    bg="white"
                    zIndex="1001"
                    ref={headerRef}
                >
                    <Container maxW="100%" paddingLeft="0px" paddingRight="0px">
                        <Header />
                    </Container>
                </Flex>

                <Box as="main" flex="1" pt={height + 15} bg="#EFEAEA">
                    <ForceAuth>
                        <Outlet />
                    </ForceAuth>
                </Box>

                <Footer />
            </Flex>
        </ChakraProvider>
    );
}

