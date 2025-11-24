// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useParams } from "react-router";
import { useEffect, useState } from "react";
import {
    Box,
    Card,
    Center,
    Flex,
    Slider,
    Icon,
    Circle,
    Text
} from "@chakra-ui/react";

import { MapRegistry, MapContainer, SimpleLayer } from "@open-pioneer/map";
import { EventEmitter } from "@open-pioneer/core";
import { useService } from "open-pioneer:react-hooks";

import { Projection } from "ol/proj";
import { Point } from "ol/geom";
import { GeoTIFF } from "ol/source";
import TileLayer from "ol/layer/WebGLTile.js";

import { useServices } from "../../../services/Services";
import { MAP_ID } from "../../../services";

import { MapZoomControls } from "../../../components/Map/MapZoomControl";
import { MapInfoControls } from "../../../components/Map/MapInfoControls";
import { MapSidebarControls } from "../../../components/Map/MapSidebarControls";
import { TimeseriesItem } from "../../../components/Timeseries/Timeseries";
import { MapSwitcherControls } from "../../../components/Map/MapSwitcherControls";
import { SliderCircle } from "../../../components/Slider/SliderCircle";
import { Job, JobResult, Timeseries } from "../../../components/definitions";
import { TimeseriesControl } from "../../../components/Timeseries/TimeseriesControl";
import { TimeseriesIcons } from "../../../components/Timeseries/TimeseriesIcons";
import { TimeseriesSlider } from "../../../components/Timeseries/TimeseriesSlider";


export interface Events {
    selectedTimeseries: Timeseries;
    toggleJobWithId: string;
}

const _proj3857 = new Projection({ code: "EPSG:3857" });
const _proj32631 = new Projection({ code: "EPSG:32631" });

export function SiteDetails() {
    const { id } = useParams();
    const { getTimeseries, getJobsByTimeseriesId, getJobResult } = useServices();
    const [timeseries, setTimeseries] = useState<Timeseries[]>();
    const [selectedTimeseries, setSelectedTimeseries] = useState<Timeseries | undefined>();
    const [jobs, setJobs] = useState<Job[]>();
    const [jobResults, setJobResults] = useState<JobResult[]>([]);
    const [viewableJobResults, setViewableJobResults] = useState<JobResult[]>([]);
    const [viewableJobResultsSteps, setViewableJobResultsSteps] = useState<number[]>([]);
    const [activeSliderResult, setActiveSliderResult] = useState<number>(0);
    const mapService = useService<MapRegistry>("map.MapRegistry");
    const [shouldHighlightAndZoom, setShouldHighlightAndZoom] = useState(true);

    const emitter = new EventEmitter<Events>();

    emitter.on("selectedTimeseries",
        (value: Timeseries) => (setSelectedTimeseries(value))
    );

    emitter.on("toggleJobWithId",
        (value: string) => {
            const currentSliderResults = [];
            for (const jobResult of jobResults!) {
                if (jobResult.job == value) {
                    jobResult.visible = !jobResult.visible;
                }
                if (jobResult.visible == true) {
                    currentSliderResults.push(jobResult);
                }
            }
            setViewableJobResults(currentSliderResults);
        }
    );

    useEffect(() => {
        fetchTimeseries();
    }, []);

    useEffect(() => {
        fetchJobs();
        setActiveSliderResult(0);
    }, [selectedTimeseries]);

    // useEffect(() => {
    //     fetchJobs();
    // }, [selectedTimeseries?.jobs?.length]); // should react on jobs length change selectedTimeseries?.jobs.length

    useEffect(() => {
        if (jobResults.length == 0) {
            return;
        };
    }, [jobResults]);

    useEffect(() => {
        showSelectedJobResult(0);
        const currentSliderMarks = [];
        for (let i = 0; i in viewableJobResults; i++) {
            currentSliderMarks.push(i);
        }
        setViewableJobResultsSteps(currentSliderMarks);
    }, [viewableJobResults]);


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

    const fetchJobs = async () => {
        if (!selectedTimeseries) return;
        try {
            const jobs = await getJobsByTimeseriesId(id!, selectedTimeseries.id!);
            selectedTimeseries.jobs = jobs;
            selectedTimeseries.children = selectedTimeseries.jobs;

            for (const ts of timeseries!) {
                if (ts.id === selectedTimeseries.id) {
                    ts.jobs = jobs;
                }
            }
            setJobs(jobs);
            console.log(jobs);
            await fetchResult(jobs);
        } catch (error) {
            console.error(error);
        }
    };

    async function fetchResult(newjobs: Job[]) {
        if (!newjobs) return;
        const fetchedJobs = [];
        const fetchedJobResults = [];
        for (const job of newjobs!) {
            const cat = await getJobResult(job);
            if (cat) {
                // Catalog might not be ready yet (e.g. because processing is still ongoing)
                job.result = cat;
                job.children = cat;
                fetchedJobs.push(job);
                for (const result of cat) {
                    fetchedJobResults.push(result);
                }
            }
        }
        setViewableJobResults(fetchedJobResults);
        setJobResults(fetchedJobResults);
        setJobs(fetchedJobs);
    }

    async function remove_current_item(id: string) {
        const map = await mapService.expectMapModel(MAP_ID);
        map.layers.removeLayerById(id);
        map.removeHighlights();
    }

    async function showSelectedJobResult(id: number) {
        if (jobResults.length == 0 || viewableJobResults == undefined) {
            return;
        }
        const jobResult = viewableJobResults[id]!;

        const map = await mapService.expectMapModel(MAP_ID);

        remove_current_item(activeSliderResult.toString());

        const google = new Projection({ code: "EPSG:3857" });
        const stacproj = new Projection({ code: "EPSG:32631" });
        // const stacproj = new Projection({ code: "EPSG:4326" });

        const image = new GeoTIFF({
            sources: [
                {
                    url: jobResult.href,
                },
            ],
        });

        const layer = new SimpleLayer({
            id: id.toString(),
            title: "current",
            olLayer: new TileLayer({
                source: image,
            }),
        });
        map.layers.addLayer(layer);

        // const bbox = catalog.bbox;
        if (shouldHighlightAndZoom) {
            const bbox = (await image.getView()).extent;
            map.highlightAndZoom(
                [
                    new Point([bbox[0]!, bbox[1]!]).transform(stacproj, google),
                    new Point([bbox[2]!, bbox[3]!]).transform(stacproj, google)
                ],
                { maxZoom: 11 }
            );
        }
    }


    return (
        <Flex>
            <Box width="450px" p="2">
                <TimeseriesItem timeseries={timeseries} eventListener={emitter} jobResults={jobResults} />
            </Box>

            <Box h="88vh" flexGrow="1" p="2">
                <MapContainer
                    mapId={MAP_ID}
                    role="main"
                    aria-label=""
                >
                    <MapSidebarControls mapId={MAP_ID} />
                    <MapInfoControls mapId={MAP_ID} />
                    <MapSwitcherControls isChecked={shouldHighlightAndZoom} onToggle={setShouldHighlightAndZoom} />
                    <MapZoomControls mapId={MAP_ID} />
                    <Box>
                        {selectedTimeseries &&
                            <Box
                                position="absolute"
                                bottom="0%"
                                left="40%"
                                transform="translateX(-50%)"
                                width="80%"
                                padding="4"
                                zIndex="10"
                                pointerEvents="auto"
                            >
                                {jobs && viewableJobResults.length > 0 && (
                                    <Card.Root w="100%" padding={4}>
                                        <Card.Body>
                                            <Center w="100%">
                                                <Slider.Root
                                                    size="lg"
                                                    colorPalette={"teal"}
                                                    w="75%"
                                                    step={1}
                                                    max={viewableJobResults.length - 1}
                                                    defaultValue={[0]}
                                                    onValueChangeEnd={(val) => {
                                                        console.log("onChangeEnd " + val.value);
                                                        showSelectedJobResult(val.value[0]!);
                                                        setActiveSliderResult(val.value[0]!);
                                                    }}
                                                >
                                                    <Slider.Control>
                                                        {viewableJobResults.map((jobResult, index) => (
                                                            <>
                                                                <Slider.Marker key={index} value={index} pt={12} ml="-50" w={"100%"}>
                                                                    {jobResult.name.split("/")[2]}
                                                                </Slider.Marker>
                                                                <Slider.Marks marks={viewableJobResultsSteps} pt="-10" />
                                                            </>
                                                        ))}
                                                        <Slider.Track >
                                                            <Slider.Range />
                                                        </Slider.Track>
                                                        <SliderCircle />
                                                    </Slider.Control>
                                                </Slider.Root>
                                            </Center>
                                        </Card.Body>
                                    </Card.Root>
                                )}
                                {/* <TimeseriesControl
                                    Timeseries={selectedTimeseries!}
                                /> */}
                            </Box>
                        }
                    </Box>
                </MapContainer>
            </Box>
        </Flex>
    );
}