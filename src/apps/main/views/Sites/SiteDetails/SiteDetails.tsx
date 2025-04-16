// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useServices } from "../../../services/Services";

import { MAP_ID } from "../../../services";
import { BasemapSwitcher } from "@open-pioneer/basemap-switcher";
import { CoordinateViewer } from "@open-pioneer/coordinate-viewer";
import { ZoomIn, ZoomOut } from "@open-pioneer/map-navigation";
import { OverviewMap } from "@open-pioneer/overview-map";
import { ScaleBar } from "@open-pioneer/scale-bar";
import { Box, Card, CardHeader, CardBody, CardFooter, Button, Heading, Text, SimpleGrid, GridItem, Image, Center, Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, ListItem, UnorderedList, Divider, Flex, FormControl, FormLabel, Slider, SliderThumb, SliderTrack, SliderMark, HStack, Icon, Grid } from "@open-pioneer/chakra-integration";
import { MapRegistry, MapContainer, MapAnchor, SimpleLayer } from "@open-pioneer/map";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";

export interface Job {
    credits: number
    executionTimeEnd: string
    executionTimeStart: string
    id: number
    timeseries_id: number
    log: string
    catalog: string
    scheduleTime: string
    status: string
}

export interface Timeseries {
    id: number
    scenario_id: number
    name: string
    description: string
    jobs: Job[]
}

export function SiteDetails() {
    const { id } = useParams();
    const { getTimeseries } = useServices();
    const [timeseries, setTimeseries] = useState<[Timeseries]>();
    const [SelectedTimeseries, setSelectedTimeseries] = useState<Timeseries | undefined>();
    const [SelectedJob, setSelectedJob] = useState<number | undefined>();

    const overviewMapLayer = useMemo(
        () =>
            new TileLayer({
                source: new OSM()
            }),
        []
    );

    useEffect(() => {
        const fetchScenarios = async () => {
            if (!id)
                return;
            try {
                const data = await getTimeseries(id);
                console.log(data);
                setTimeseries(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchScenarios();
    }, []);

    return (
        <Grid templateColumns="repeat(12, 1fr)" gap={2}>
            <GridItem colSpan={2} rowSpan={12} borderWidth="1px" margin="2px" padding="2px">
                <Accordion>
                    {timeseries && timeseries.map((ts, key) =>
                        <AccordionItem key={key}>
                            <h2>
                                <AccordionButton>
                                    <Box as='span' flex='1' textAlign='left'>
                                        {ts.name}
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                                <UnorderedList>
                                    <ListItem>ID: {ts.id}</ListItem>
                                    <ListItem>Description: {ts.description}</ListItem>
                                </UnorderedList>
                                <Button onClick={() => { setSelectedTimeseries(ts); }}>View on Map</Button>
                            </AccordionPanel>
                        </AccordionItem>
                    )}
                </Accordion>
            </GridItem>
            <GridItem colSpan={10} rowSpan={12} margin="2px" padding="2px">
                <Box height="85vh">
                    <Flex height="100%" direction="column" overflow="hidden">
                        <Flex flex="1" direction="column" position="relative">
                            <MapContainer
                                mapId={MAP_ID}
                                role="main"
                                aria-label=""
                            >
                                <MapAnchor position="top-right" horizontalGap={5} verticalGap={5}>
                                    <Box
                                        backgroundColor="white"
                                        borderWidth="1px"
                                        borderRadius="sm"
                                        padding={2}
                                        boxShadow="sm"
                                        role="top-right"
                                        aria-label=""
                                    >
                                        <OverviewMap mapId={MAP_ID} olLayer={overviewMapLayer} />
                                        <Divider mt={2} />
                                        <FormControl>
                                            <FormLabel mt={1}>
                                                <Text as="b">
                                                    text
                                                </Text>
                                            </FormLabel>
                                            <BasemapSwitcher mapId={MAP_ID} allowSelectingEmptyBasemap />
                                        </FormControl>

                                    </Box>
                                </MapAnchor>

                                <MapAnchor position="top-left" horizontalGap={0} verticalGap={0}>
                                    <Flex
                                        role="top-left"
                                        aria-label=""
                                        direction="column"
                                        gap={1}
                                        padding={1}
                                    >
                                        <HStack>
                                            <CoordinateViewer mapId={MAP_ID} precision={2} />
                                            <ScaleBar mapId={MAP_ID} />
                                        </HStack>
                                    </Flex>
                                </MapAnchor>

                                <MapAnchor position="bottom-right" horizontalGap={10} verticalGap={30}>
                                    <Flex
                                        role="bottom-right"
                                        aria-label=""
                                        direction="column"
                                        gap={1}
                                        padding={1}
                                    >
                                        <ZoomIn mapId={MAP_ID} />
                                        <ZoomOut mapId={MAP_ID} />
                                    </Flex>
                                </MapAnchor>
                            </MapContainer>
                        </Flex>
                    </Flex>
                </Box>
            </GridItem>
        </Grid>
    );
}
