// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Box,
    Button,
    Circle,
    Collapsible,
    Flex,
    HStack,
    Icon,
    ScrollArea,
    Slider,
    Stack,
    Tabs,
    Text,
    useCollapsible
} from "@chakra-ui/react";

import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { LuInfo, LuFolderTree, LuMap, LuRuler, LuDatabase, LuChevronDown, LuChevronUp, LuArrowBigLeft } from "react-icons/lu";

import { MapRegistry, MapContainer, SimpleLayer, MapAnchor, MapModel } from "@open-pioneer/map";
import { EventEmitter } from "@open-pioneer/core";
import { useService } from "open-pioneer:react-hooks";
import { Measurement } from "@open-pioneer/measurement";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";
import { Toc } from "@open-pioneer/toc";
import { SidebarItem, Sidebar } from "@open-pioneer/experimental-layout-sidebar";

import { Projection } from "ol/proj";
import { Point } from "ol/geom";
import { GeoTIFF } from "ol/source";
import TileLayer from "ol/layer/WebGLTile.js";
import { Fill, Stroke, Style } from "ol/style";
import { Extent } from "ol/extent";

import { useServices } from "../../../services/Services";
import { MAP_ID } from "../../../services";
import { Site } from "../Site/Site";
import { MapZoomControls } from "../../../components/Map/MapZoomControl";
import { MapInfoControls } from "../../../components/Map/MapInfoControls";
import { MapSidebarControls } from "../../../components/Map/MapSidebarControls";
import { TimeseriesItem } from "../../../components/Timeseries/Timeseries";
import { SliderCircle } from "../../../components/Slider/SliderCircle";
import { JobResult, Timeseries } from "../../../components/definitions";
import { Tooltip } from "../../../components/tooltip";
import { Legend } from "../../../components/Map/LegendControl";
import { LayerOverview } from "../../../components/Timeseries/LayerOverview";


export interface Events {
    selectedTimeseries: Timeseries;
    toggleJobWithId: string;
    infoViewOpen: boolean;
    expandedResultType: string;
    zoomBackToExtent: undefined;
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
    const [expandedResultType, setExpandedResultType] = useState<string>();
    const [viewableJobResults, setViewableJobResults] = useState<JobResult[]>([]);
    const mapService = useService<MapRegistry>("map.MapRegistry");
    const [dataViewOpen, setDataViewOpen] = useState<boolean>(true);
    const [infoViewOpen, setInfoViewOpen] = useState<boolean>(false);
    const [map, setMap] = useState<MapModel>();
    const [timeseriesViewActive, setTimeseriesViewActive] = useState<boolean>(true);

    const timeseriesExtent = [765040, 3707520, 766310, 3708990];
    const timeseriesEpsg = "EPSG:32636";
    const google = new Projection({ code: "EPSG:3857" });

    const collapsible = useCollapsible();
    const navigate = useNavigate();

    const emitter = new EventEmitter<Events>();
    emitter.on("selectedTimeseries",
        (value: Timeseries) => (setSelectedTimeseries(value))
    );
    emitter.on("infoViewOpen",
        (value: boolean) => (setInfoViewOpen(value))
    );
    emitter.on("expandedResultType",
        (value: string) => (setExpandedResultType(value))
    );
    emitter.on("zoomBackToExtent",
        () => (ZoomToTimeseriesExtent(timeseriesExtent, timeseriesEpsg))
    );

    useEffect(() => {
        fetchTimeseries();
        fetchScenario();
        zoomToInitialView();
    }, []);

    useEffect(() => {
        if (!selectedTimeseries) {
            remove_current_item();
        }
        if (selectedTimeseries) {
            // Extent and EPSG should be from TS data later
            ZoomToTimeseriesExtent(timeseriesExtent, timeseriesEpsg);
        }
    }, [selectedTimeseries]);

    useEffect(() => {
        if (!expandedResultType) {
            remove_current_item();
        }
        if (expandedResultType) {
            showSelectedJobResult(0);
            ZoomToTimeseriesExtent(timeseriesExtent, timeseriesEpsg);
        }
    }, [expandedResultType]);

    useEffect(() => {
        if (!timeseriesViewActive) {
            remove_current_item();
            // show layers with Visibility in Overview == true
        }
    }, [timeseriesViewActive]);

    useReactiveSnapshot(
        () => {
            for (const job of selectedTimeseries?.jobs ?? []) {
                const allTimeseriesResults = job.results.filter((
                    (val, i) => val.visible.value
                ));
                const resultsOfExpandedType = [];
                for (const result of allTimeseriesResults) {
                    if (result.type == expandedResultType)
                        resultsOfExpandedType.push(result);
                }
                setViewableJobResults(resultsOfExpandedType);
            };
            console.log("shotsnap on selectedTimeseries & selectedTimeseries?.jobs: ", selectedTimeseries, selectedTimeseries?.jobs);
        }, [selectedTimeseries, selectedTimeseries?.jobs, expandedResultType]
    );

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

    async function zoomToInitialView() {
        const map = await mapService.expectMapModel(MAP_ID);
        map.zoom(
            [
                // should be scenario.extent or centerpoint later
                new Point([3991698, 3959524])
            ],
            { pointZoom: 12 }
        );
        setMap(map);
    };

    async function ZoomToTimeseriesExtent(extent: Extent, epsg: string) {
        const map = await mapService.expectMapModel(MAP_ID);
        const stacproj = new Projection({ code: epsg });
        // extent should be TS.extent later
        map.zoom(
            [
                new Point([extent[0]!, extent[1]!]).transform(stacproj, google),
                new Point([extent[2]!, extent[3]!]).transform(stacproj, google)
            ],
            { viewPadding: { top: 50, bottom: 100 } }
        );
        console.log("Zoom done");
    };

    async function remove_current_item() {
        const map = await mapService.expectMapModel(MAP_ID);
        map.layers.removeLayerById("current");
        map.removeHighlights();
    };

    async function showSelectedJobResult(id: number) {
        const jobResult = viewableJobResults[id];
        if (!jobResult) {
            console.log("result not yet available");
            return;
        }
        const map = await mapService.expectMapModel(MAP_ID);
        await remove_current_item();
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
        map.layers.addLayer(layer);
        const stacproj = new Projection({ code: jobResult.epsg });
        const bbox = (await image.getView()).extent;
        if (bbox) {
            map.highlight(
                [
                    new Point([bbox[0]!, bbox[1]!]).transform(stacproj, google),
                    new Point([bbox[2]!, bbox[3]!]).transform(stacproj, google)
                ]
            );
        }
        console.log("highlight done");
    };

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

    const items: SidebarItem[] = [
        {
            id: "info",
            icon: <LuInfo />,
            label: "",
            content:
                <Box h="90vh" w="335px" bg="teal.50" p="2" borderRadius="md" boxShadow="md">
                </Box>
        }
    ];

    return (
        <Flex>
            {dataViewOpen &&
                <Box h="90vh" w="500px" p="2" bg="teal.50">
                    <ScrollArea.Root minH="50vh" variant="hover">
                        <ScrollArea.Viewport>
                            <ScrollArea.Content spaceY="4">
                                <Box p="2" colorPalette="teal">
                                    <HStack>
                                        <Button onClick={() => navigate("..")}>
                                            <LuArrowBigLeft />
                                            Sites
                                        </Button>
                                        <Text fontSize="lg" fontWeight="bold">{scenario?.name}</Text>
                                    </HStack>
                                </Box>
                                <Tabs.Root defaultValue="timeseries" colorPalette="teal" onValueChange={() => setTimeseriesViewActive(!timeseriesViewActive)}>
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
                                        <Tabs.Trigger value="layeroverview">
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
                                    <Tabs.Content value="layeroverview">
                                        <LayerOverview timeseries={timeseries} eventListener={emitter} />
                                        <Box mt="4" bg="white" p="4" borderWidth="1px" borderRadius="md" boxShadow="sm">
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
                            </ScrollArea.Content>
                        </ScrollArea.Viewport>
                        <ScrollArea.Scrollbar>
                            <ScrollArea.Thumb />
                        </ScrollArea.Scrollbar>
                        <ScrollArea.Corner />
                    </ScrollArea.Root >
                </Box>
            }
            <Box h="90vh" flexGrow="1" >
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
                        {timeseriesViewActive && selectedTimeseries && expandedResultType && viewableJobResults.length > 0 &&
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
                                            console.log("onValueChangeEnd", val.value[0]!);
                                            showSelectedJobResult(val.value[0]!);
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
                                            console.log("onValueChangeEnd", val.value[0]!);
                                            showSelectedJobResult(val.value[0]!);
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
            <Box h="90vh" w="100px" bg="teal.50" p="2" borderRadius="md" boxShadow="md">
                <div style={{ position: "relative" }}>
                    <Sidebar
                        defaultExpanded={false}
                        expandedChanged={(expanded) => setInfoViewOpen(expanded)}
                        //sidebarWidthChanged={(width) => setSidebarWidth(width)}
                        items={items}
                    />
                </div>
            </Box>
            {infoViewOpen &&
                <Box h="90vh" w="335px" bg="teal.50" p="2" borderRadius="md" boxShadow="md">
                    <ScrollArea.Root maxW="md" minH="50vh" variant="hover">
                        <ScrollArea.Viewport>
                            <ScrollArea.Content spaceY="4">
                                <Tabs.Root defaultValue="legend" colorPalette="teal">
                                    <Tabs.List>
                                        <Tabs.Trigger value="legend">
                                            <LuMap />
                                            Legend
                                        </Tabs.Trigger>
                                        <Tabs.Trigger value="tools">
                                            <LuRuler />
                                            Tools
                                        </Tabs.Trigger>
                                        <Tabs.Trigger value="info">
                                            <LuDatabase />
                                            Info
                                        </Tabs.Trigger>
                                    </Tabs.List>
                                    <Tabs.Content value="legend">
                                        <Legend process={expandedResultType} />
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
                            </ScrollArea.Content>
                        </ScrollArea.Viewport>
                        <ScrollArea.Scrollbar>
                            <ScrollArea.Thumb />
                        </ScrollArea.Scrollbar>
                        <ScrollArea.Corner />
                    </ScrollArea.Root >
                </Box>
            }
        </Flex >
    );
}