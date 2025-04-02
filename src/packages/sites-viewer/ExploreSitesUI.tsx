// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { FC, useEffect, useMemo, useState } from "react";
import { useIntl, useService } from "open-pioneer:react-hooks";
import { Box, Card, CardHeader, CardBody, CardFooter, Button, Heading, Text, SimpleGrid, GridItem, Image, Center, Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, ListItem, UnorderedList, Divider, Flex, FormControl, FormLabel, Slider, SliderThumb, SliderTrack, SliderMark, HStack, Icon } from "@open-pioneer/chakra-integration";
import { HttpService, } from "@open-pioneer/http";
import { MAP_ID } from "./services";
import { BasemapSwitcher } from "@open-pioneer/basemap-switcher";
import { CoordinateViewer } from "@open-pioneer/coordinate-viewer";
import { MapRegistry, MapContainer, MapAnchor, SimpleLayer } from "@open-pioneer/map";
import { ZoomIn, ZoomOut } from "@open-pioneer/map-navigation";
import { OverviewMap } from "@open-pioneer/overview-map";
import { ScaleBar } from "@open-pioneer/scale-bar";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import { Point } from "ol/geom";
import { register } from "ol/proj/proj4.js";
import STAC from "ol-stac";
import { Projection } from "ol/proj";
import proj4 from "proj4";


register(proj4);

export interface Scenario {
    preview_image: string
    description: string
    id: number
    name: string
}
export interface Timeseries {
    id: number
    scenario_id: number
    name: string
    description: string
    jobs: Job[]
}
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

interface Link {
    rel: string
    href: string
}

interface StacCatalog {
    id: string
    links: Link[]
}

interface Asset {
    href: string
}

interface AssetWrap {
    asset: Asset
}

interface STACProperties {
    "proj:bbox": number[]
    "proj:epsg": number
}
interface Item {
    assets: AssetWrap;
    id: string
    bbox: number[]
    properties: STACProperties
}



export const ExploreSitesUI: FC = () => {
    const httpService = useService<HttpService>("http.HttpService");

    const [Scenarios, setScenarios] = useState<[Scenario]>();
    const [SelectedScenario, setSelectedScenario] = useState<Scenario | undefined>();
    const [Timeseries, setTimeseries] = useState<[Timeseries]>();
    const [SelectedTimeseries, setSelectedTimeseries] = useState<Timeseries | undefined>();
    const [jobs] = useState<Map<string, Item>>(new Map());
    const [SelectedJob, setSelectedJob] = useState<number | undefined>();

    const mapService = useService<MapRegistry>("map.MapRegistry");

    const intl = useIntl();
    const overviewMapLayer = useMemo(
        () =>
            new TileLayer({
                source: new OSM()
            }),
        []
    );

    useEffect(() => {
        setSelectedScenario(undefined);
        setSelectedTimeseries(undefined);
        setSelectedJob(undefined);
        httpService
            .fetch(import.meta.env.VITE_API_ROOT + "/scenarios/")
            .then(async res => {
                return setScenarios(await res.json());
            });
    }, [httpService]);

    useEffect(() => {
        if (SelectedScenario) {
            setSelectedTimeseries(undefined);
            setSelectedJob(undefined);
            httpService
                .fetch(import.meta.env.VITE_API_ROOT + "/scenarios/" + SelectedScenario?.id + "/timeseries/")
                .then(async res => {
                    return setTimeseries(await res.json());
                });
        }
    }, [SelectedScenario]);

    useEffect(() => {
        if (SelectedTimeseries != undefined) {
            setSelectedJob(undefined);
            for (const job of SelectedTimeseries.jobs) {
                httpService
                    .fetch(job.catalog)
                    .then(async res => {
                        const cat = await res.json();
                        jobs.set(job.id.toString(), cat);
                    })
                    .then(() => { setSelectedJob(job.id); });
            }
        }
    }, [httpService, SelectedTimeseries]);

    useEffect(() => {
        if (SelectedJob) {
            viewOnMap(jobs.get(SelectedJob.toString())!);
        }
    }, [SelectedJob]);


    async function viewOnMap(catalog: Item) {
        const map = await mapService.expectMapModel("main");

        // remove old layer
        map.layers.removeLayerById("current_item");

        const google = new Projection({ code: "EPSG:3857" });
        //const stacproj = new Projection({code: "EPSG:" + v.properties["proj:epsg"]});
        const stacproj = new Projection({ code: "EPSG:4326" });

        const layer = new SimpleLayer({
            id: "current_item",
            title: catalog.id,
            olLayer: new STAC({
                data: catalog,
                displayGeoTiffByDefault: true
            })
        });
        map.layers.addLayer(layer);

        // const bbox = v.properties["proj:bbox"];
        const bbox = catalog.bbox;
        //console.log([new Point([bbox[0]!, bbox[1]!]).transform(stacproj, google), new Point([bbox[2]!, bbox[3]!]).transform(stacproj, google)]);
        map.highlightAndZoom([new Point([bbox[0]!, bbox[1]!]).transform(stacproj, google), new Point([bbox[2]!, bbox[3]!]).transform(stacproj, google)]);
    }

    return (
        <>
            {!SelectedScenario &&
                <GridItem colSpan={12} rowSpan={12} margin="2px" padding="2px">
                    <SimpleGrid spacing={4} templateColumns='repeat(auto-fill, minmax(200px, 1fr))'>
                        {Scenarios && Scenarios.map(Scenario =>
                            <Card key={Scenario.id}>
                                <Center w='100%' mt='20px' color='white'>
                                    <Image
                                        src={Scenario.preview_image}
                                        alt={Scenario.name}
                                        borderRadius='lg'
                                        boxSize='150px'
                                        objectFit='cover'
                                    />
                                </Center>
                                <CardHeader>
                                    <Heading size='md'> {Scenario.name}</Heading>
                                </CardHeader>
                                <CardBody>
                                    <Text>{Scenario.description}</Text>
                                </CardBody>
                                <CardFooter>
                                    <Button onClick={() => setSelectedScenario(Scenario)}>View here</Button>
                                </CardFooter>
                            </Card>
                        )}
                    </SimpleGrid>
                </GridItem>
            }
            {SelectedScenario &&
                <>
                    <GridItem colSpan={2} rowSpan={12} borderWidth="1px" margin="2px" padding="2px">
                        <Accordion>
                            {Timeseries && Timeseries.map(Timeseries =>
                                <AccordionItem key={Timeseries.id}>
                                    <h2>
                                        <AccordionButton>
                                            <Box as='span' flex='1' textAlign='left'>
                                                {Timeseries.name}
                                            </Box>
                                            <AccordionIcon />
                                        </AccordionButton>
                                    </h2>
                                    <AccordionPanel pb={4}>
                                        <UnorderedList>
                                            <ListItem>ID: {Timeseries.id}</ListItem>
                                            <ListItem>Description: {Timeseries.description}</ListItem>
                                        </UnorderedList>
                                        <Button onClick={() => { console.log(Timeseries); setSelectedTimeseries(Timeseries); }}>View on Map</Button>
                                    </AccordionPanel>
                                </AccordionItem>
                            )}
                        </Accordion>
                    </GridItem>
                    <GridItem colSpan={10} rowSpan={12} margin="2px" padding="2px">
                        <Flex height="100%" direction="column" overflow="hidden">
                            <Flex flex="1" direction="column" position="relative">
                                <MapContainer
                                    mapId={MAP_ID}
                                    role="main"
                                    aria-label={intl.formatMessage({ id: "ariaLabel.map" })}
                                >
                                    <MapAnchor position="top-right" horizontalGap={5} verticalGap={5}>
                                        <Box
                                            backgroundColor="white"
                                            borderWidth="1px"
                                            borderRadius="sm"
                                            padding={2}
                                            boxShadow="sm"
                                            role="top-right"
                                            aria-label={intl.formatMessage({ id: "ariaLabel.topRight" })}
                                        >
                                            <OverviewMap mapId={MAP_ID} olLayer={overviewMapLayer} />
                                            <Divider mt={2} />
                                            <FormControl>
                                                <FormLabel mt={1}>
                                                    <Text as="b">
                                                        {intl.formatMessage({ id: "basemapLabel" })}
                                                    </Text>
                                                </FormLabel>
                                                <BasemapSwitcher mapId={MAP_ID} allowSelectingEmptyBasemap />
                                            </FormControl>

                                        </Box>
                                    </MapAnchor>

                                    <MapAnchor position="top-left" horizontalGap={0} verticalGap={0}>
                                        <Flex
                                            role="top-left"
                                            aria-label={intl.formatMessage({ id: "ariaLabel.topLeft" })}
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
                                            aria-label={intl.formatMessage({ id: "ariaLabel.bottomRight" })}
                                            direction="column"
                                            gap={1}
                                            padding={1}
                                        >
                                            <ZoomIn mapId={MAP_ID} />
                                            <ZoomOut mapId={MAP_ID} />
                                        </Flex>
                                    </MapAnchor>

                                    {SelectedTimeseries &&
                                        <MapAnchor className="full-width" position="bottom-left" horizontalGap={5} verticalGap={5}>
                                            <Box
                                                backgroundColor="white"
                                                borderWidth="1px"
                                                borderRadius="sm"
                                                padding={4}
                                                role="top-right"
                                                aria-label={intl.formatMessage({ id: "ariaLabel.bottomLeft" })}>
                                                {SelectedTimeseries.jobs.length == 1 &&
                                                    <Slider aria-label='slider-ex-1' value={50} isReadOnly={true}>
                                                        <SliderMark mt='5' ml='-120' key={50} value={50}>{SelectedTimeseries.jobs[0]!.scheduleTime}</SliderMark>
                                                        <SliderTrack>
                                                        </SliderTrack>
                                                        <SliderThumb />
                                                    </Slider>
                                                }
                                                {SelectedTimeseries.jobs.length > 1 &&
                                                    <Center w="100%">
                                                        <Slider w="80%" aria-label='slider-ex-1' step={1} max={SelectedTimeseries.jobs.length - 1} defaultValue={0} onChangeEnd={(val) => setSelectedJob(SelectedTimeseries.jobs[val]?.id)}>
                                                            {SelectedTimeseries.jobs.map((Job, i) =>
                                                                <>
                                                                    <SliderMark fontSize="0.5em" ml='-10em' key={Job.id} value={i}>{Job.scheduleTime}</SliderMark>
                                                                    <SliderMark zIndex='98' ml='-0.5em' mt='-0.9em' key={Job.id + "mark"} value={i}>
                                                                        <Icon viewBox='0 0 200 200'>
                                                                            <circle cx="100" cy="100" r="75" fill='black'></circle>
                                                                        </Icon>
                                                                    </SliderMark>
                                                                </>
                                                            )}
                                                            <SliderTrack>
                                                            </SliderTrack>
                                                            <SliderThumb zIndex='99'>
                                                                <Icon viewBox='0 0 200 200'>
                                                                    <circle cx="100" cy="100" r="100" fill='orange'></circle>
                                                                </Icon>
                                                            </SliderThumb>

                                                        </Slider>
                                                    </Center>
                                                }
                                            </Box>
                                            {SelectedJob &&
                                                <Card>
                                                    <CardHeader>
                                                        <Heading size='md'>Name: {jobs.get(SelectedJob!.toString())!.id}</Heading>
                                                    </CardHeader>
                                                    <CardBody>
                                                    </CardBody>
                                                </Card>
                                            }
                                        </MapAnchor>
                                    }
                                </MapContainer>

                            </Flex>

                        </Flex>
                    </GridItem>
                </>
            }
        </>
    );
};