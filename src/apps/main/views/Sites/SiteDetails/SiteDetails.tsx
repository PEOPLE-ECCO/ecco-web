// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import {
    Box,
    Button,
    Circle,
    Collapsible,
    Flex,
    HStack,
    Icon,
    Slider,
    Stack,
    Tabs,
    Text,
    useCollapsible,
    VStack
} from "@chakra-ui/react";
import { LuInfo, LuFolderTree, LuMap, LuRuler, LuDatabase, LuChevronDown, LuChevronUp, LuArrowBigLeft } from "react-icons/lu";

import { MapRegistry, MapContainer, SimpleLayer, MapAnchor, MapModel, GroupLayer } from "@open-pioneer/map";
import { EventEmitter } from "@open-pioneer/core";
import { useService } from "open-pioneer:react-hooks";
import { Measurement } from "@open-pioneer/measurement";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";
import { Toc } from "@open-pioneer/toc";
import { reactiveArray, ReactiveArray } from "@conterra/reactivity-core";

import { Projection } from "ol/proj";
import { Point } from "ol/geom";
import { GeoTIFF } from "ol/source";
import TileLayer from "ol/layer/WebGLTile.js";
import { Fill, Stroke, Style } from "ol/style";

import { useServices } from "../../../services/Services";
import { MAP_ID } from "../../../services";
import { Site } from "../Site/Site";
import { MapZoomControls } from "../../../components/Map/MapZoomControl";
import { MapInfoControls } from "../../../components/Map/MapInfoControls";
import { MapSidebarControls } from "../../../components/Map/MapSidebarControls";
import { TimeseriesItem } from "../../../components/Timeseries/Timeseries";
import { SliderCircle } from "../../../components/Slider/SliderCircle";
import { JobResult, Timeseries } from "../../../components/definitions";
import { MapOpacityControl } from "../../../components/Map/MapOpacityControl";
import { Tooltip } from "../../../components/tooltip";
import { Legend } from "../../../components/Map/LegendControl";



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
    const { getTimeseries, getScenario } = useServices();
    const [timeseries, setTimeseries] = useState<Timeseries[]>();
    const [scenario, setScenario] = useState<Site>();
    const [selectedTimeseries, setSelectedTimeseries] = useState<Timeseries | undefined>();
    const [viewableJobResults, setViewableJobResults] = useState<ReactiveArray<JobResult>>(reactiveArray());
    const [activeSliderResult, setActiveSliderResult] = useState<number>(0);
    const mapService = useService<MapRegistry>("map.MapRegistry");
    const [shouldHighlightAndZoom, setShouldHighlightAndZoom] = useState(true);
    const [dataViewOpen, setDataViewOpen] = useState(true);
    const [infoViewOpen, setInfoViewOpen] = useState(false);
    const [map, setMap] = useState<MapModel>();
    const collapsible = useCollapsible();
    const navigate = useNavigate();


    const emitter = new EventEmitter<Events>();

    emitter.on("selectedTimeseries",
        (value: Timeseries) => (setSelectedTimeseries(value))
    );

    const BLACK_STYLE = new Style({
        stroke: new Stroke({
            color: "teal",
            width: 4
        }),
        fill: new Fill({
            color: "rgba(255, 255, 255, 0.25)"
        })
    });

    const RED_STYLE = new Style({
        stroke: new Stroke({
            color: "teal",
            width: 4
        }),
        fill: new Fill({
            color: "rgba(110, 150, 168, 0.25)"
        })
    });

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
        const fetchScenario = async () => {
            if (!id)
                return;
            try {
                const scenario = await getScenario(id);
                setScenario(scenario);
            } catch (error) {
                console.error(error);
            }
        };
        fetchTimeseries();
        fetchScenario();
        zoomToInitialView();
    }, []);

    useEffect(() => {
        if (!selectedTimeseries) {
            remove_current_item();
        }
    }, [selectedTimeseries]);

    useEffect(() => {
        console.log("    useEffect(() => {");
        for (let i = 0; i < viewableJobResults.length; i++) {
            showSelectedJobResult(i);
        }
        setActiveSliderResult(0);
    }, [viewableJobResults]);

    async function zoomToInitialView() {
        const map = await mapService.expectMapModel(MAP_ID);
        map.zoom(
            [
                // should be scenario.extent later
                new Point([850000, 6793120])
            ],
            { pointZoom: 10 }
        );
        setMap(map);
    }

    async function remove_current_item(id: string) {
        console.log("removing");
        console.log(id);
        const map = await mapService.expectMapModel(MAP_ID);
        map.layers.removeLayerById(id);
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
        }, [selectedTimeseries, selectedTimeseries?.jobs]
    );

    async function showSelectedJobResult() {
        const map = await mapService.expectMapModel(MAP_ID);

        selectedTimeseries?.results.value.forEach((results, resultType) => {

            const groupLayer = new GroupLayer({
                id: resultType,
                title: resultType,
                layers: results.map(res => {
                    const image = new GeoTIFF({
                        normalize: false,
                        interpolate: false,
                        sources: [
                            {
                                url: res.href,
                            },
                        ],
                    });
                    const style = JSON.parse(res.style);
                    return new SimpleLayer({
                        id: res.name,
                        title: res.name,
                        olLayer: new TileLayer({
                            source: image,
                            style: style
                        }),
                    });
                })
            });
            map.layers.addLayer(groupLayer);
        });

        /*
        const jobResult = viewableJobResults.get(id);
        if (!jobResult) {
            console.log("result not yet available");
            return;
        }

        
        await remove_current_item(id.toString());
        */
        


        //TODO: this is really really bad


        // layer.olLayer.setOpacity(0.5);

        // const bbox = catalog.bbox;
        /*
        if (shouldHighlightAndZoom) {
            const google = new Projection({ code: "EPSG:3857" });
            const stacproj = new Projection({ code: jobResult.epsg });
            // bbox should be selectedTimeseries.extent from TS creation later
            const bbox = (await image.getView()).extent;
            map.highlightAndZoom(
                [
                    new Point([bbox[0]!, bbox[1]!]).transform(stacproj, google),
                    new Point([bbox[2]!, bbox[3]!]).transform(stacproj, google)
                ],
                { viewPadding: { top: 50, bottom: 100 } }
            );
        }
        */
    }


    return (
        <Flex>
            {dataViewOpen &&
                <Box h="88vh" width="450px" p="2" bg="teal.50">
                    <Box p="2" colorPalette="teal">
                        <HStack>
                            <Button onClick={() => navigate("..")}>
                                <LuArrowBigLeft></LuArrowBigLeft>
                                Sites
                            </Button>
                            <Text fontSize="lg" fontWeight="bold">{scenario?.name}</Text>
                        </HStack>
                    </Box>
                    <Tabs.Root defaultValue="timeseries" colorPalette="teal">
                        <Tabs.List>
                            <Tabs.Trigger value="timeseries">
                                <LuMap />
                                Timeseries View
                                <Tooltip content="This view shows different timestamps of one process and area and provides a time-slider to swicht the results">
                                    <Button size="xs" variant="ghost">
                                        <LuInfo />
                                    </Button>
                                </Tooltip>
                            </Tabs.Trigger>
                            <Tabs.Trigger value="layer">
                                <LuDatabase />
                                Layer View
                                <Tooltip content="This view shows all results in a tree and enables comparisons between results and timeseries">
                                    <Button size="xs" variant="ghost">
                                        <LuInfo />
                                    </Button>
                                </Tooltip>
                            </Tabs.Trigger>
                        </Tabs.List>

                        <Tabs.Content value="timeseries">
                            <TimeseriesItem timeseries={timeseries} eventListener={emitter} />
                        </Tabs.Content>
                        <Tabs.Content value="layer">
                            View Layers as Groups
                            <Box bg="white" p="4" borderWidth="1px" borderRadius="md" boxShadow="sm">
                                {map &&
                                    <Toc map={map} showTools={true} showBasemapSwitcher={false} collapsibleGroups={true} initiallyCollapsed={false} />
                                }
                                {timeseries?.map((element) =>
                                    <HStack key={element.name} gap="6">
                                    </HStack>
                                )}
                            </Box>
                        </Tabs.Content>
                    </Tabs.Root>
                </Box>
            }
            <Box h="88vh" flexGrow="1" >
                <MapContainer
                    mapId={MAP_ID}
                    role="main"
                    aria-label=""
                >
                    <MapInfoControls mapId={MAP_ID} />
                    {/* <MapSwitcherControls isChecked={shouldHighlightAndZoom} onToggle={setShouldHighlightAndZoom} /> */}
                    <MapZoomControls mapId={MAP_ID} position="top-right" horizontalGap={10} verticalGap={60} />
                    <MapAnchor position="top-right" horizontalGap={0} verticalGap={10}>
                        <Flex
                            role="top-right"
                            bottom="3%"
                            aria-label="Data View controls"
                            direction="column"
                            colorPalette="teal"
                        >
                            <Button onClick={() => { setInfoViewOpen(!infoViewOpen); }} >
                                <LuInfo />
                            </Button>
                        </Flex>
                    </MapAnchor>
                    <MapAnchor position="top-left" horizontalGap={0} verticalGap={10}>
                        <Flex
                            role="top-left"
                            bottom="3%"
                            aria-label="Info controls"
                            direction="column"
                            colorPalette="teal"
                        >
                            <Button onClick={() => { setDataViewOpen(!dataViewOpen); }} >
                                <LuFolderTree />
                            </Button>
                        </Flex>
                    </MapAnchor>
                    <Box>
                        {selectedTimeseries && viewableJobResults.length > 0 &&
                            <Box
                                position="absolute"
                                bottom="14"
                                left="55%"
                                transform="translateX(-50%)"
                                width="90%"
                                zIndex="10"
                                pointerEvents="auto"
                            >
                                {viewableJobResults.length == 1 && (
                                    <Slider.Root
                                        size="lg"
                                        colorPalette="teal"
                                        w="90%"
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
                                                    <Slider.Marker zIndex="9" pt="6" key={index} value={index} w={"100%"}>
                                                        <Circle h="3" w="3" bg="teal"></Circle>
                                                        <Text>{jobResult.name}</Text>
                                                    </Slider.Marker>
                                                </>
                                            ))}
                                            <Slider.Track>
                                                <Slider.Range />
                                            </Slider.Track>
                                            <SliderCircle />
                                        </Slider.Control>
                                    </Slider.Root>
                                )}
                                {viewableJobResults.length > 1 && (
                                    <Slider.Root
                                        size="lg"
                                        colorPalette="teal"
                                        w="90%"
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
                                                    <Slider.Marker zIndex="9" pt="6" key={index} value={index} w={"100%"}>
                                                        <Circle h="3" w="3" bg="teal"></Circle>
                                                        <Text>{jobResult.name}</Text>
                                                    </Slider.Marker>
                                                </>
                                            ))}
                                            <Slider.Track bg="teal">
                                                <Slider.Range bg="teal" />
                                            </Slider.Track>
                                            <SliderCircle />
                                        </Slider.Control>
                                    </Slider.Root>
                                )}
                                {/* <TimeseriesControl
                                    Timeseries={selectedTimeseries!}
                                /> */}
                            </Box>
                        }
                    </Box>
                </MapContainer>
            </Box>
            {infoViewOpen &&
                <Box h="88vh" width="335px" bg="teal.50" p="2" borderRadius="md" boxShadow="md">
                    <Tabs.Root defaultValue="tools" colorPalette="teal">
                        <Tabs.List>
                            <Tabs.Trigger value="tools">
                                <LuRuler />
                                Tools
                            </Tabs.Trigger>
                            <Tabs.Trigger value="legend">
                                <LuMap />
                                Legend
                            </Tabs.Trigger>
                            <Tabs.Trigger value="info">
                                <LuDatabase />
                                Info
                            </Tabs.Trigger>
                        </Tabs.List>
                        <Tabs.Content value="legend">
                            <Legend process={"R80P"} />  {/* must be activeSliderResult Process later */}
                        </Tabs.Content>
                        <Tabs.Content value="tools">
                            Use Map Tools
                            <Box pt="4" h="80vh">
                                <MapContainer
                                    mapId={MAP_ID}
                                    role="main"
                                    aria-label=""
                                >
                                    <Flex gap="4" direction="column">
                                        <MapSidebarControls mapId={MAP_ID} position={"top-left"} verticalGap={0} />
                                        <Box bg="white" p="4" borderWidth="1px" borderRadius="md" boxShadow="sm">
                                            <Stack >
                                                <Button
                                                    size="md"
                                                    onClick={() => collapsible.setOpen(!collapsible.open)}
                                                >
                                                    <LuRuler />
                                                    {collapsible.open ? <Text>End measurement</Text> : <Text>Start measurement</Text>}
                                                    <Icon>{collapsible.open ? <LuChevronUp /> : <LuChevronDown />}</Icon>
                                                </Button>
                                                <Collapsible.RootProvider value={collapsible}>
                                                    <Collapsible.Content>
                                                        {collapsible.open &&
                                                            <Measurement mapId={MAP_ID} activeFeatureStyle={RED_STYLE} finishedFeatureStyle={BLACK_STYLE} />
                                                        }
                                                    </Collapsible.Content>
                                                </Collapsible.RootProvider>
                                            </Stack>
                                        </Box>
                                        <Box bg="white" p="4" borderWidth="1px" borderRadius="md" boxShadow="sm">
                                            <MapOpacityControl mapId={MAP_ID} />
                                        </Box>
                                    </Flex>
                                </MapContainer>
                            </Box>
                        </Tabs.Content>
                        <Tabs.Content value="info">
                            View Data and Values
                            <Box pt="4" h="80vh">
                                Table with Pixelvalues, Metadata, ...
                            </Box>
                        </Tabs.Content>
                    </Tabs.Root>
                </Box>
            }
        </Flex >
    );
}