// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useServices } from "../../../services/Services";

import { MAP_ID } from "../../../services";
import {
    Box, Card, CardHeader, CardBody, Heading, GridItem, Center, Flex,
    Slider, SliderThumb, SliderTrack, SliderMark, Icon, Grid
} from "@open-pioneer/chakra-integration";
import { MapRegistry, MapContainer, SimpleLayer } from "@open-pioneer/map";

import { Projection } from "ol/proj";
import { Point } from "ol/geom";
import STAC from "ol-stac";
import { useService } from "open-pioneer:react-hooks";
import { MapZoomControls } from "../../../components/Map/MapZoomControl";
import { MapInfoControls } from "../../../components/Map/MapInfoControls";
import { MapSidebarControls } from "../../../components/Map/MapSidebarControls";
import { Timeseries } from "../../../components/Timeseries/Timeseries";
import { TimeseriesActions } from "../../../components/Timeseries/TimeseriesActions";
import { TimeseriesIcons } from "../../../components/Timeseries/TimeseriesIcons";

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

export function SiteDetails() {
    const { id } = useParams();
    const { getTimeseries, getJob } = useServices();
    const [timeseries, setTimeseries] = useState<[Timeseries]>();
    const [selectedTimeseries, setSelectedTimeseries] = useState<Timeseries | undefined>();
    const [selectedJob, setSelectedJob] = useState<number | undefined>();
    const [jobs] = useState<Map<string, Item>>(new Map());
    const mapService = useService<MapRegistry>("map.MapRegistry");

    useEffect(() => {
        const fetchTimeseries = async () => {
            if (!id)
                return;
            try {
                const data = await getTimeseries(id);
                setTimeseries(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchTimeseries();
    }, []);

    useEffect(() => {
        if (selectedJob) {
            viewOnMap(jobs.get(selectedJob.toString())!);
        }
    }, [selectedJob]);

    useEffect(() => {
        const fetchJobs = async () => {
            if (!selectedTimeseries)
                return;
            try {
                for (const job of selectedTimeseries.jobs) {
                    const data = await getJob(job);
                    jobs.set(job.id.toString(), data);
                    setSelectedJob(job.id);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchJobs();
    }, [selectedTimeseries]);

    async function remove_current_item() {
        const map = await mapService.expectMapModel(MAP_ID);
        map.layers.removeLayerById("current_item");
        map.removeHighlights();
    }

    async function viewOnMap(catalog: Item) {
        const map = await mapService.expectMapModel(MAP_ID);
        await remove_current_item();

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
        map.highlightAndZoom([new Point([bbox[0]!, bbox[1]!]).transform(stacproj, google), new Point([bbox[2]!, bbox[3]!]).transform(stacproj, google)], {maxZoom: 11});
    }

    return (
        <Grid templateColumns="repeat(12, 1fr)" gap={2}>
            <GridItem colSpan={2} rowSpan={12} borderWidth="1px" margin="2px" padding="2px">
                <Timeseries timeseries={timeseries} onSelect={setSelectedTimeseries} />
            </GridItem>
            <GridItem colSpan={10} rowSpan={12} margin="2px" padding="2px">
                <Box height="85vh">
                    <Flex flex="1" height="100%" direction="column" overflow="hidden" position="relative">
                        <MapContainer
                            mapId={MAP_ID}
                            role="main"
                            aria-label=""
                        >
                            <MapSidebarControls mapId={MAP_ID} />
                            <MapInfoControls mapId={MAP_ID} />
                            <MapZoomControls mapId={MAP_ID} />

                            {selectedTimeseries &&
                                <Box
                                    position="absolute"
                                    bottom="0"
                                    left="25%"
                                    transform="translateX(-50%)"
                                    width="50%"
                                    padding="4"
                                    zIndex="10"
                                    pointerEvents="auto"
                                >
                                    <Card w="100%" padding={4}>
                                        <CardBody>
                                            {selectedTimeseries.jobs.length === 1 && (
                                                <Slider aria-label="slider-ex-1" value={50} isReadOnly={true}>
                                                    <SliderMark mt="5" ml="-120" key={50} value={50}>
                                                        {selectedTimeseries.jobs[0]!.scheduleTime}
                                                    </SliderMark>
                                                    <SliderThumb zIndex="99">
                                                        <Icon viewBox="0 0 200 200">
                                                            <circle cx="100" cy="100" r="100" fill="orange" />
                                                        </Icon>
                                                    </SliderThumb>
                                                </Slider>
                                            )}

                                            {selectedTimeseries.jobs.length > 1 && (
                                                <Center w="100%">
                                                    <Slider
                                                        w="75%"
                                                        aria-label="slider-ex-1"
                                                        step={1}
                                                        max={selectedTimeseries.jobs.length - 1}
                                                        defaultValue={0}
                                                        onChangeEnd={(val) =>
                                                            setSelectedJob(selectedTimeseries.jobs[val]?.id)
                                                        }
                                                    >
                                                        {selectedTimeseries.jobs.map((Job, i) => (
                                                            <>
                                                                <SliderMark key={Job.id} value={i} pt={3} ml="-110" w={"100%"}>
                                                                    {Job.scheduleTime}
                                                                </SliderMark>
                                                                <SliderMark
                                                                    zIndex="98"
                                                                    ml="-0.5em"
                                                                    mt="-0.9em"
                                                                    key={Job.id + "mark"}
                                                                    value={i}
                                                                >
                                                                    <Icon viewBox="0 0 200 200">
                                                                        <circle cx="100" cy="100" r="75" fill="black" />
                                                                    </Icon>
                                                                </SliderMark>
                                                            </>
                                                        ))}
                                                        <SliderTrack />
                                                        <SliderThumb zIndex="99">
                                                            <Icon viewBox="0 0 200 200">
                                                                <circle cx="100" cy="100" r="100" fill="orange" />
                                                            </Icon>
                                                        </SliderThumb>
                                                    </Slider>
                                                </Center>
                                            )}
                                        </CardBody>
                                    </Card>

                                    {selectedJob && (
                                        <Card marginTop="2%" w="100%">
                                            <CardHeader paddingBottom="2" paddingX="5" paddingTop="2">
                                                <Flex justify="space-between" align="center">
                                                    <Heading size="md">
                                                        Name: {jobs.get(selectedJob!.toString())!.id}
                                                    </Heading>
                                                    <TimeseriesIcons
                                                        onDocumentClick={() => console.log("Document clicked")}
                                                        onInfoClick={() => console.log("Info clicked")}
                                                        onLocateClick={() => console.log("Locate clicked")}
                                                    />
                                                </Flex>
                                            </CardHeader>
                                            <CardBody>
                                                <TimeseriesActions
                                                    onDownloadAll={() => console.log("Downloading all")}
                                                    onDownloadCurrent={() => console.log("Downloading current")}
                                                    onExecute={() => console.log("Executing")}
                                                />
                                            </CardBody>
                                        </Card>
                                    )}
                                </Box>
                            }
                        </MapContainer>
                    </Flex>
                </Box>
            </GridItem>
        </Grid>
    );
}
