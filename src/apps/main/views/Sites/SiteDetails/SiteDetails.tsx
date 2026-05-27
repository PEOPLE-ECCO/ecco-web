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
    Tag,
    Text,
    useCollapsible
} from "@chakra-ui/react";

import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { LuInfo, LuFolderTree, LuMap, LuRuler, LuDatabase, LuChevronDown, LuChevronUp, LuArrowBigLeft, LuMapPinned } from "react-icons/lu";

import { MapRegistry, MapContainer, SimpleLayer, MapAnchor, MapModel } from "@open-pioneer/map";
import { EventEmitter } from "@open-pioneer/core";
import { useService } from "open-pioneer:react-hooks";
import { Measurement } from "@open-pioneer/measurement";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";

import { Projection } from "ol/proj";
import { Point } from "ol/geom";
import { GeoTIFF } from "ol/source";
import TileLayer from "ol/layer/WebGLTile.js";
import { Fill, Stroke, Style } from "ol/style";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";

import { useServices } from "../../../services/Services";
import { MAP_ID } from "../../../services";
import { Site } from "../Site/Site";
import { MapZoomControls } from "../../../components/Map/MapZoomControl";
import { MapInfoControls } from "../../../components/Map/MapInfoControls";
import { MapSidebarControls } from "../../../components/Map/MapSidebarControls";
import { TimeseriesItem } from "../../../components/Timeseries/Timeseries";
import { SliderCircle } from "../../../components/Slider/SliderCircle";
import { JobResult, SpatialExtent, Timeseries } from "../../../components/definitions";
import { Tooltip } from "../../../components/tooltip";
import { Legend } from "../../../components/Map/LegendControl";
import Overlay from "ol/Overlay";

export interface ResultTypeMeta {
    name: string;
    opacity: number;
    legend?: string;
}


export interface Events {
    selectedTimeseries: Timeseries;
    toggleJobWithId: string;
    infoViewOpen: boolean;
    expandedResultType: ResultTypeMeta;
    zoomBackToExtent: undefined;
    layerOpacity: {
        resultType: string;
        opacity: number;
    };
    currentResult: JobResult;
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
    const [expandedResultType, setExpandedResultType] = useState<ResultTypeMeta>();
    const [viewableJobResults, setViewableJobResults] = useState<JobResult[]>([]);
    const mapService = useService<MapRegistry>("map.MapRegistry");
    const [dataViewOpen, setDataViewOpen] = useState<boolean>(true);
    const [infoViewOpen, setInfoViewOpen] = useState<boolean>(false);
    const [map, setMap] = useState<MapModel>();
    const [timeseriesViewActive, setTimeseriesViewActive] = useState<boolean>(true);

    const timeseriesExtent = (() => {
        console.log(selectedTimeseries!.extent!);
        return selectedTimeseries!.extent!;
    });
    const google = new Projection({ code: "EPSG:3857" });
    const geojson = new Projection({ code: "EPSG:4326" });

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
        (value: ResultTypeMeta) => {
            setExpandedResultType(value);
        }
    );
    emitter.on("zoomBackToExtent",
        () => (ZoomToTimeseriesExtent(timeseriesExtent()))
    );

    useEffect(() => {
        const init = async () => {
            setMap(await mapService.expectMapModel(MAP_ID));
        };

        init().then(() => {
            fetchTimeseries();
            fetchScenario();
        });
    }, []);

    useEffect(() => {
        if (!selectedTimeseries) {
            remove_current_item();
        }
        if (selectedTimeseries) {
            // Extent and EPSG should be from TS data later
            ZoomToTimeseriesExtent(selectedTimeseries.extent!);
        }
    }, [selectedTimeseries]);

    useEffect(() => {
        //setLayerOpacity(100);
        if (!expandedResultType) {
            remove_current_item();
        }
        if (expandedResultType) {
            showSelectedJobResult(0, expandedResultType.opacity || 100);
            ZoomToTimeseriesExtent(timeseriesExtent());
        }
    }, [expandedResultType]);

    useEffect(() => {
        if (!timeseriesViewActive) {
            remove_current_item();
            // show layers with Visibility in Overview == true
        }
    }, [timeseriesViewActive]);

    useEffect(() => {
        zoomToInitialView(scenario);
    }, [scenario, map]);

    useReactiveSnapshot(
        () => {
            const resultsOfExpandedType = [];
            for (const job of selectedTimeseries?.jobs ?? []) {
                
                for (const result of job.results) {
                    if (result.type === expandedResultType?.name) {
                        resultsOfExpandedType.push(result);
                    }
                        
                }

                // Sort resultsOfExpandedType by phenomenonTime ascending
                resultsOfExpandedType.sort((a, b) => {
                    const dateA = new Date(a.phenomenonTime);
                    const dateB = new Date(b.phenomenonTime);
                    return dateA.getTime() - dateB.getTime();
                });
                
            };
            setViewableJobResults(resultsOfExpandedType);
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

    async function zoomToInitialView(scenario: Site | undefined) {
        if (scenario && map) {
            map!.zoom(
                [
                    new Point([scenario.bbox[0]!, scenario.bbox[1]!]).transform(geojson, google),
                    new Point([scenario.bbox[2]!, scenario.bbox[3]!]).transform(geojson, google)
                ],
                { pointZoom: 12 }
            );
        }
    };

    async function ZoomToTimeseriesExtent(extent: SpatialExtent) {
        // There might be no extent (when no job has run yet)
        if (map && extent) {
            map.zoom(
                [
                    new Point([extent.bbox[0]!, extent.bbox[1]!]),
                    new Point([extent.bbox[2]!, extent.bbox[3]!])
                ],
                { viewPadding: { top: 50, bottom: 100 } }
            );
        }
    };

    async function remove_current_item() {
        if (map) {
            map.layers.removeLayerById("current");
            map.removeHighlights();
        }
    };

    async function showSelectedJobResult(idx: number, opacity: number) {
        console.log(viewableJobResults);

        const jobResult = viewableJobResults[idx];
        if (!jobResult) {
            console.log("result not yet available");
            return;
        }

        emitter.emit("currentResult", jobResult);

        const map = await mapService.expectMapModel(MAP_ID);
        await remove_current_item();

        if (jobResult.type == "geojson" || jobResult.type == "geojson-sav" || jobResult.type == "geojson-coral") {
            // Define the projection based on your jobResult
            const stacproj = new Projection({ code: "EPSG:" + jobResult.epsg });


            // 1. Create the Styles based on your specifications
            const defaultStyle = new Style({
                fill: new Fill({ color: "rgba(0, 128, 0, 0.5)" }),     // Green, 50% opacity
                stroke: new Stroke({ color: "#006400", width: 1.5 }),  // Dark Green
                zIndex: 0
            });

            const neighborStyle = new Style({
                fill: new Fill({ color: "rgba(0, 128, 0, 0.5)" }),
                stroke: new Stroke({ color: "red", width: 3 }),        // Red boundary, thicker
                zIndex: 1                                              // Equivalent to bringToFront()
            });

            const clickedStyle = new Style({
                fill: new Fill({ color: "rgba(255, 0, 0, 0.8)" }),     // Red, 80% opacity
                stroke: new Stroke({ color: "#8B0000", width: 4 }),    // Dark Red, thickest
                zIndex: 2                                              // Always on top
            });

            // 1. Create the source, explicitly setting the expected data projection
            const vectorSource = new VectorSource({
                url: jobResult.href,
                format: new GeoJSON({
                    dataProjection: stacproj
                }),
            });

            // 2. Create the Vector Layer (no style defined, so default is used)
            const vectorLayer = new VectorLayer({
                source: vectorSource,
            });

            // 3. Wrap in your custom SimpleLayer class
            const layer = new SimpleLayer({
                id: "current",
                title: "current",
                olLayer: vectorLayer,
            });

            // 4. Set opacity and add to the map
            layer.olLayer.setOpacity(opacity / 100);
            map.layers.addLayer(layer);

            // 2. Set up the Popup HTML and Overlay
            const popupContainer = document.createElement("div");
            // Basic inline styling for the popup so it looks nice immediately
            popupContainer.style.backgroundColor = "white";
            popupContainer.style.padding = "10px";
            popupContainer.style.border = "1px solid #ccc";
            popupContainer.style.borderRadius = "5px";
            popupContainer.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";

            const popupContent = document.createElement("div");
            popupContainer.appendChild(popupContent);

            const popupOverlay = new Overlay({
                element: popupContainer,
                positioning: "bottom-center",
                stopEvent: false,
                offset: [0, -10] // Shifts the popup slightly above the clicked pixel
            });
            map.olMap.addOverlay(popupOverlay);

            map.olMap.on("singleclick", function (evt) {

                // Reset all features to the default layer style by clearing specific styles
                vectorSource.getFeatures().forEach(f => f.setStyle(undefined));
                
                const clickedFeature = map.olMap.forEachFeatureAtPixel(evt.pixel, function (feature, clickedLayer) {
                    // Only interact if the click was on our specific vectorLayer
                    if (clickedLayer === vectorLayer) {
                        return feature;
                    }
                });

                if (clickedFeature) {
                    // In OpenLayers, we use .get() to read GeoJSON properties
                    const neighbors = clickedFeature.get("neighbors") || [];

                    // Loop through all features in this layer to style the neighbors
                    vectorSource.getFeatures().forEach(f => {
                        const featureId = f.getProperties()["patch_id"];
                        if (neighbors.includes(featureId)) {
                            f.setStyle(neighborStyle);
                        }
                    });

                    // Finally, style the clicked feature itself
                    clickedFeature.setStyle(clickedStyle);

                    // --- Popup Logic ---
                    // Get all properties from the GeoJSON feature
                    const properties = clickedFeature.getProperties();
                    let htmlString = "";

                    for (const key in properties) {
                        // We skip the 'geometry' property because it is a complex OpenLayers object, not text
                        if (key !== "geometry" && key !== "fid") {
                            htmlString += "<b>" + key + ":</b> " + properties[key] + "<br/>";
                        }
                    }

                    // Update the HTML inside the popup and move it to where the user clicked
                    popupContent.innerHTML = htmlString;
                    popupOverlay.setPosition(evt.coordinate);
                } else {
                    // Hide the popup if the user clicks somewhere empty on the map
                    popupOverlay.setPosition(undefined);
                }
            });

            // 5. Wait for the source to be fully available before highlighting
            vectorSource.once("change", () => {
                if (vectorSource.getState() === "ready") {
                    // OpenLayers vector sources automatically transform coordinates to the map"s 
                    // view projection during load. Because of this, the extent is already 
                    // transformed, unlike the GeoTIFF extent.
                    const extent = vectorSource.getExtent();

                    if (extent) {
                        // We simply pass the Points directly without an extra .transform() step
                        map.highlight([
                            new Point([extent[0]!, extent[1]!]),
                            new Point([extent[2]!, extent[3]!])
                        ]);
                        console.log("geojson highlight done");
                    }
                }
            });
        } else {
            const image = new GeoTIFF({
                normalize: false,
                interpolate: false,
                sources: [
                    {
                        url: jobResult.href,
                    },
                ],
            });
            console.log(jobResult);
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
            layer.olLayer.setOpacity(opacity / 100);
            map.layers.addLayer(layer);
            const stacproj = new Projection({ code: "EPSG:" + jobResult.epsg });
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
        }
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

    // const items: SidebarItem[] = [
    //     {
    //         id: "info",
    //         icon: <LuInfo />,
    //         label: "",
    //         content:
    //             <Box h="90vh" w="335px" bg="teal.50" p="2" borderRadius="md" boxShadow="md">
    //             </Box>
    //     }
    // ];

    const navigationHeight = "55px";
    const tabListHeight = "45px";
    const contentHeightCalc = "calc(100vh - var(--header-height) - var(--footer-height))";
    const tabsHeightCalc = `calc(100vh - var(--header-height) - var(--footer-height) - ${navigationHeight} - ${tabListHeight})`;

    return (
        <Flex minH={contentHeightCalc} maxH={contentHeightCalc}>
            {dataViewOpen &&
                <Box w="500px" paddingLeft="2" paddingRight="2" bg="teal.50">

                    <Box p="2" colorPalette="teal" maxH={navigationHeight} minH={navigationHeight}>
                        <HStack>
                            <Button onClick={() => navigate("..")}>
                                <LuArrowBigLeft />
                                Sites
                            </Button>
                            <Text fontSize="xl" fontWeight="bold">{scenario?.name}</Text>
                            <Tooltip content="Zoom back to Extent">
                                <Button
                                    color="black"
                                    _hover={{ bg: "teal.50" }}
                                    size="md"
                                    variant="ghost"
                                    onClick={() => { zoomToInitialView(scenario); }}>
                                    <LuMapPinned />
                                </Button>
                            </Tooltip>
                        </HStack>
                    </Box>
                    <Tabs.Root defaultValue="timeseries" colorPalette="teal" onValueChange={() => setTimeseriesViewActive(!timeseriesViewActive)} maxH={tabsHeightCalc} minH={tabsHeightCalc}>
                        <Tabs.List maxH={tabListHeight} minH={tabListHeight}>
                            <Tabs.Trigger value="timeseries">
                                <LuMap />
                                Timeseries View
                                <Tooltip content="This view shows different timestamps of one process and area and provides a time-slider to swicht the results">
                                    <Button size="xs" variant="ghost">
                                        <LuInfo />
                                    </Button>
                                </Tooltip>
                            </Tabs.Trigger>
                            {/* <Tabs.Trigger value="layeroverview">
                                <LuDatabase />
                                Layer View
                                <Tooltip content="This view shows all results in a tree and enables comparisons between results and timeseries">
                                    <Button size="xs" variant="ghost">
                                        <LuInfo />
                                    </Button>
                                </Tooltip>
                            </Tabs.Trigger> */}
                        </Tabs.List>
                        <Tabs.Content value="timeseries" overflowX="auto" maxH={tabsHeightCalc} minH={tabsHeightCalc}>
                            {map && scenario &&
                                <TimeseriesItem scenario={scenario} map={map} timeseries={timeseries} eventListener={emitter} />
                            }
                        </Tabs.Content>
                        {/* <Tabs.Content value="layeroverview" overflowX="auto" maxH={tabsHeightCalc} minH={tabsHeightCalc}>
                            <LayerOverview timeseries={timeseries} eventListener={emitter} />

                        </Tabs.Content> */}
                    </Tabs.Root>

                </Box>
            }
            <Box minH={contentHeightCalc} maxH={contentHeightCalc} flexGrow="1" >
                {map &&
                    <MapContainer
                        map={map}
                        role="main"
                        aria-label=""
                    >
                        <MapInfoControls map={map} />
                        {/* <MapSwitcherControls isChecked={shouldHighlightAndZoom} onToggle={setShouldHighlightAndZoom} /> */}
                        <MapZoomControls map={map} position="top-right" horizontalGap={10} verticalGap={60} />
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
                                                showSelectedJobResult(val.value[0]!, expandedResultType.opacity || 100);
                                            }}
                                        >
                                            <Slider.Control>
                                                {viewableJobResults.map((jobResult, index) => (
                                                    <>
                                                        <Slider.Marker zIndex="9" pt="6" key={index} value={index} w={"100%"}>
                                                            <Circle h="3" w="3" bg="teal"></Circle>
                                                            <Tag.Root>
                                                                <Tag.Label fontWeight={700} fontSize={"150%"}>{jobResult.phenomenonTime}</Tag.Label>
                                                            </Tag.Root>
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
                                                showSelectedJobResult(val.value[0]!, expandedResultType.opacity || 100);
                                            }}
                                        >
                                            <Slider.Control>
                                                {viewableJobResults.map((jobResult, index) => (
                                                    <>
                                                        <Slider.Marker zIndex="9" pt="6" key={index} value={index} w={"100%"}>
                                                            <Circle h="3" w="3" bg="teal"></Circle>
                                                            <Tag.Root>
                                                                <Tag.Label fontWeight={700} fontSize={"150%"}>{jobResult.phenomenonTime}</Tag.Label>
                                                            </Tag.Root>
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
                }
            </Box>
            {/* <Box h="90vh" w="100px" bg="teal.50" p="2" borderRadius="md" boxShadow="md">
                <div style={{ position: "relative" }}>
                    <Sidebar
                        defaultExpanded={false}
                        expandedChanged={(expanded) => setInfoViewOpen(expanded)}
                        //sidebarWidthChanged={(width) => setSidebarWidth(width)}
                        items={items}
                    />
                </div>
            </Box> */}
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
                                        <Legend process={expandedResultType?.name} />
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