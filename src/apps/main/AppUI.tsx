// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Notifier } from "@open-pioneer/notifier";
import { Box, Container, Flex } from "@chakra-ui/react";

import { useMeasure } from "react-use";

import { createBrowserRouter, Outlet, RouterProvider } from "react-router";
import Header from "./components/Header/Header";
import { Sites } from "./views/Sites/Sites";
import { DataInventory } from "./views/DataInventory/DataInventory";
import { Documentation } from "./views/Documentation/Documentation";
import { SiteDetails } from "./views/Sites/SiteDetails/SiteDetails";
import { Footer } from "./components/Footer/Footer";
import CreateTimeseries from "./views/CreateTimeseries/CreateTimeseries";
import CreateJob from "./views/CreateJob/CreateJobUI";

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
                path: `sites/:id`,
                element: <SiteDetails />
            },
            {
                path: `dataInventory`,
                element: <DataInventory />
            },
            {
                path: `sites/:id/createTimeseries`,
                element: <CreateTimeseries />
            },
            {
                path: `sites/:id/timeseries/:ts_id/createJob`,
                element: <CreateJob />
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
    const [headerRef, { height }] = useMeasure<HTMLDivElement>();

    return (
        <>
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

                <Box as="main" flex="1" pt={height} bg="#EFEAEA">
                    <Outlet />
                </Box>

                <Footer />
            </Flex>
        </>
    );
}

