// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useParams } from "react-router";
import { useEffect, useState } from "react";
import {
    Box,
    Card,
    Center,
    Flex,
    Slider
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
import { SliderCircle } from "../../../components/Slider/SliderCircle";
import { Job, JobResult, Timeseries } from "../../../components/definitions";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";
import { computed, effect, Reactive, reactive, reactiveArray, ReactiveArray, ReactiveMap, reactiveMap, ReadonlyReactive, watch, watchValue } from "@conterra/reactivity-core";
import WebGLTileLayer from "ol/layer/WebGLTile.js";
import { MapOpacityControl } from "../../../components/Map/MapOpacityControl";


export interface Events {
    selectedTimeseries: Timeseries;
    toggleJobWithId: string;
}

const _proj3857 = new Projection({ code: "EPSG:3857" });
const _proj32631 = new Projection({ code: "EPSG:32631" });
const _proj32648 = new Projection({ code: "EPSG:32648" });
const _proj32636 = new Projection({ code: "EPSG:32636" });

export function SiteDetails() {
    const { id } = useParams();
    const { getTimeseries } = useServices();
    const [timeseries, setTimeseries] = useState<Timeseries[]>();
    const [selectedTimeseries, setSelectedTimeseries] = useState<Timeseries | undefined>();
    const [viewableJobResults, setViewableJobResults] = useState<ReactiveArray<JobResult>>(reactiveArray());
    const [viewableJobResultsSteps, setViewableJobResultsSteps] = useState<number[]>([]);
    const [activeSliderResult, setActiveSliderResult] = useState<number>(0);
    const mapService = useService<MapRegistry>("map.MapRegistry");
    const [shouldHighlightAndZoom, setShouldHighlightAndZoom] = useState(true);

    const emitter = new EventEmitter<Events>();

    emitter.on("selectedTimeseries",
        (value: Timeseries) => (setSelectedTimeseries(value))
    );

    /*
    emitter.on("toggleJobWithId",
        (value: string) => {
            const currentSliderResults = [];
            console.log("toggleJobWithId");
            console.log(value);
            for (const jobResult of jobResults!) {
                if (jobResult.filename == value) {
                    jobResult.visible = !jobResult.visible;
                }
                if (jobResult.visible == true) {
                    currentSliderResults.push(jobResult);
                }
            }
            setViewableJobResults(currentSliderResults);
        }
    );
    */

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
        console.log("    useEffect(() => {");
        const currentSliderMarks = [];
        for (let i = 0; i in viewableJobResults; i++) {
            currentSliderMarks.push(i);
        }
        setViewableJobResultsSteps(currentSliderMarks);
        showSelectedJobResult(0);
        setActiveSliderResult(0);
    }, [viewableJobResults]);

    async function remove_current_item() {
        console.log("removing");
        console.log(id);
        const map = await mapService.expectMapModel(MAP_ID);
        map.layers.removeLayerById("current");
        map.removeHighlights();
    }

    useReactiveSnapshot(
        () => {
            for (const job of selectedTimeseries?.jobs ?? []) {
                setViewableJobResults(job.results.filter((
                    (val, i) => val.visible.value
                ))
                );
            };
            console.log("shotsnap");
        }, [selectedTimeseries, selectedTimeseries?.jobs]
    );

    async function showSelectedJobResult(id: number) {
        const jobResult = viewableJobResults.get(id);
        if (!jobResult) {
            console.log("result not yet available");
            return;
        }

        const map = await mapService.expectMapModel(MAP_ID);
        await remove_current_item();

        const google = new Projection({ code: "EPSG:3857" });
        const image = new GeoTIFF({
            normalize: false,
            interpolate: false,
            sources: [
                {
                    url: jobResult.href,
                },
            ],
        });

        //TODO: this is really really bad
        const style = JSON.parse(jobResult.style);

        const layer = new SimpleLayer({
            id: "current",
            title: "current",
            olLayer: new TileLayer({
                source: image,
                style: style
            }),
        });
        // layer.olLayer.setOpacity(0.5);
        map.layers.addLayer(layer);

        console.log("map.layers.addLayer(" + id.toString());


        // const bbox = catalog.bbox;
        if (shouldHighlightAndZoom) {
            console.log(jobResult.epsg);
            const stacproj = new Projection({ code: jobResult.epsg });
            const bbox = (await image.getView()).extent;
            map.highlightAndZoom(
                [
                    new Point([bbox[0]!, bbox[1]!]).transform(stacproj, google),
                    new Point([bbox[2]!, bbox[3]!]).transform(stacproj, google)
                ]
            );
        }
    }


    return (
        <Flex>
            <Box width="450px" p="2">
                <TimeseriesItem timeseries={timeseries} eventListener={emitter} />
            </Box>

            <Box h="88vh" flexGrow="1" p="2">
                <MapContainer
                    mapId={MAP_ID}
                    role="main"
                    aria-label=""
                >
                    <MapSidebarControls mapId={MAP_ID} />
                    <MapInfoControls mapId={MAP_ID} />
                    {/* <MapSwitcherControls isChecked={shouldHighlightAndZoom} onToggle={setShouldHighlightAndZoom} /> */}
                    <MapZoomControls mapId={MAP_ID}/>
                    <MapOpacityControl mapId={MAP_ID}/>
                    <Box>
                        {selectedTimeseries &&
                            <Box
                                position="absolute"
                                bottom="3%"
                                left="40%"
                                transform="translateX(-50%)"
                                width="80%"
                                padding="4"
                                zIndex="10"
                                pointerEvents="auto"
                            >
                                {viewableJobResults.length > 1 && (
                                    <Card.Root w="100%" padding={4}>
                                        <Card.Body>
                                            <Center w="100%">
                                                <Slider.Root
                                                    size="lg"
                                                    colorPalette={"teal"}
                                                    w="80%"
                                                    step={1}
                                                    max={viewableJobResults.length - 1}
                                                    defaultValue={[0]}
                                                    onValueChangeEnd={(val) => {
                                                        console.log("onValueChangeEnd");
                                                        console.log(val.value[0]!);
                                                        showSelectedJobResult(val.value[0]!);
                                                        setActiveSliderResult(val.value[0]!);
                                                    }}
                                                >
                                                    <Slider.Control>
                                                        {viewableJobResults.map((jobResult, index) => (
                                                            <>
                                                                <Slider.Marker key={index} value={index} pt={12} w={"100%"}>
                                                                    {jobResult.name}
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