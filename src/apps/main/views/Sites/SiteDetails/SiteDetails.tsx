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
import { LuInfo, LuMap, LuRuler, LuDatabase, LuChevronDown, LuChevronUp, LuArrowBigLeft, LuMapPinned, LuCrosshair } from "react-icons/lu";

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
import { PixelInspector } from "../../../components/Map/PixelInspector";
import { TimeseriesItem } from "../../../components/Timeseries/Timeseries";
import { SliderCircle } from "../../../components/Slider/SliderCircle";
import { JobResult, SpatialExtent, Timeseries } from "../../../components/definitions";
import { Tooltip } from "../../../components/tooltip";
import { Legend } from "../../../components/Map/LegendControl";
import Overlay from "ol/Overlay";
import { fromExtent } from "ol/geom/Polygon";
import Feature from "ol/Feature";
import { Layer } from "ol/layer";
import BaseLayer from "ol/layer/Base";

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
    const [visibleLayerState, setVisibleLayerState] = useState<string>();

    const timeseriesExtent = (() => {
        if (selectedTimeseries?.extent) {
            return selectedTimeseries!.extent!;
        }
        return undefined;
        
    });
    const google = new Projection({ code: "EPSG:3857" });
    const geojson = new Projection({ code: "EPSG:4326" });

    const collapsible = useCollapsible();
    const pixelInspectorCollapsible = useCollapsible();
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
            setInfoViewOpen(true);
        });
    }, []);

    useEffect(() => {
        // Stop pixel inspection when the timeseries changes: the markers were sampled
        // against the previous timeseries' layers and are no longer meaningful.
        pixelInspectorCollapsible.setOpen(false);
        if (!selectedTimeseries) {
            remove_current_item();
            // No timeseries selected: clear its dashed bbox and show the scenario extent again.
            clearTimeseriesExtent();
            setSiteExtentVisible(true);
        }
        if (selectedTimeseries) {
            // Extent and EPSG should be from TS data later
            ZoomToTimeseriesExtent(selectedTimeseries?.extent);
        }
    }, [selectedTimeseries]);

    useEffect(() => {
        //setLayerOpacity(100);
        if (!expandedResultType) {
            remove_current_item();
        }
        if (expandedResultType) {
            showSelectedJobResult(0, expandedResultType.opacity || 100);
            // ZoomToTimeseriesExtent(timeseriesExtent());
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
            clearSiteAndTimeseriesLayers();
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

    let siteSource : VectorSource | undefined = undefined;
    let siteLayer : VectorLayer | undefined = undefined;
    let tsSource : VectorSource | undefined = undefined;
    let tsLayer : VectorLayer | undefined = undefined;

    async function clearSiteAndTimeseriesLayers() {
        const map = await mapService.expectMapModel(MAP_ID);
        const allLayers = map.olMap.getAllLayers();
        const tsLayer = allLayers.find(layer => layer instanceof Layer && layer.get("id") === "timeseries-details-overlay-layer") as Layer;
        const sitesLayer = allLayers.find(layer => layer instanceof Layer && layer.get("id") === "site-details-overlay-layer") as Layer;
        tsLayer && map.olMap.removeLayer(tsLayer);
        sitesLayer && map.olMap.removeLayer(sitesLayer);
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

            const bboxExtent = [scenario.bbox[0]!, scenario.bbox[1]!, scenario.bbox[2]!, scenario.bbox[3]!];

            if (!siteSource) {
                siteSource = new VectorSource();
                siteLayer = new VectorLayer({
                    source: siteSource,
                    properties: { id: "site-details-overlay-layer" },
                    style: new Style({
                        fill: new Fill({ color: [0, 0, 0, 0] }),
                        stroke: new Stroke({ color: [0, 150, 150, 1.0], width: 4, lineDash: [8, 8] })
                    })
                });

                // Append the layer directly to the OpenLayers map instance
                map.olMap.addLayer(siteLayer);
            } else {
                siteSource.clear();
            }

            const bboxPolygon = fromExtent(bboxExtent).transform(geojson, google);
            const bboxFeature = new Feature({
                geometry: bboxPolygon,
            });
            bboxFeature.setId(scenario.id);

            siteSource.addFeature(bboxFeature);
        }
    };

    function setSiteExtentVisible(visible: boolean) {
        if (!map) return;
        const siteLayer = map.olMap.getAllLayers()
            .find(layer => layer instanceof Layer && layer.get("id") === "site-details-overlay-layer") as Layer | undefined;
        siteLayer?.setVisible(visible);
    }

    function clearTimeseriesExtent() {
        if (!map) return;
        const tsLayer = map.olMap.getAllLayers()
            .find(layer => layer instanceof Layer && layer.get("id") === "timeseries-details-overlay-layer") as Layer | undefined;
        (tsLayer?.getSource() as VectorSource | undefined)?.clear();
    }

    async function ZoomToTimeseriesExtent(extent: SpatialExtent | undefined) {
        // There might be no extent (when no job has run yet)
        if (map && extent) {
            // Only one dashed bbox should be visible at a time: hide the scenario
            // extent while a timeseries extent is shown.
            setSiteExtentVisible(false);

            map.zoom(
                [
                    new Point([extent.bbox[0]!, extent.bbox[1]!]),
                    new Point([extent.bbox[2]!, extent.bbox[3]!])
                ],
                { viewPadding: { top: 50, bottom: 100 } }
            );

            const tsExtent = [extent.bbox[0]!, extent.bbox[1]!, extent.bbox[2]!, extent.bbox[3]!];

            let targetSource : VectorSource | undefined = undefined;
            if (!tsSource) {
                const allLayers = map.olMap.getAllLayers();
                const vectorLayer = allLayers.find(layer => layer instanceof Layer && layer.get("id") === "timeseries-details-overlay-layer") as Layer;

                if (!vectorLayer) {
                    tsSource = new VectorSource();
                    tsLayer = new VectorLayer({
                        source: tsSource,
                        properties: { id: "timeseries-details-overlay-layer" },
                        style: new Style({
                            fill: new Fill({ color: [0, 0, 0, 0] }),
                            stroke: new Stroke({ color: [0, 150, 150, 1.0], width: 4, lineDash: [8, 8] })
                        })
                    });

                    // Append the layer directly to the OpenLayers map instance
                    map.olMap.addLayer(tsLayer);
                    targetSource = tsSource;
                } else {
                    targetSource = vectorLayer.getSource() as VectorSource;
                    targetSource.clear();
                }
            } else {
                tsSource.clear();
                targetSource = tsSource;
            }

            const tsPolygon = fromExtent(tsExtent);
            const tsFeature = new Feature({
                geometry: tsPolygon,
            });

            targetSource?.addFeature(tsFeature);
            console.log("ALL LAYERS: " + map.olMap.getAllLayers().length);
        }

    };

    async function remove_current_item() {
        if (map) {
            if (visibleLayerState) {
                // since we no longer replace layers but keep loaded data in memory,
                // we need to set the previous layer to not visible
                const previous = map.layers.getLayerById(visibleLayerState);
                if (previous) {
                    previous.setVisible(false);
                }
            }
            map.removeHighlights();
        }
    };

    async function showSelectedJobResult(idx: number, opacity: number) {
        const jobResult = viewableJobResults[idx];
        if (!jobResult) {
            console.log("result not yet available");
            return;
        }

        emitter.emit("currentResult", jobResult);

        const map = await mapService.expectMapModel(MAP_ID);
        await remove_current_item();

        const layerUniqueId = `TSLAYER_${selectedTimeseries?.name}_${jobResult.type}_${jobResult.phenomenonTime}`;
        setVisibleLayerState(layerUniqueId);

        // search all OL layers, it might have been created already
        const layerCandidates = map?.layers?.getLayers().filter(l => {
            return l.id === layerUniqueId;
        });
        if (layerCandidates && layerCandidates.length > 0) {
            (layerCandidates[0] as SimpleLayer).olLayer.setVisible(true);
            (layerCandidates[0] as SimpleLayer).olLayer.setOpacity(opacity / 100);
            //quick return
            return;
        }


        if (jobResult.type == "geojson" || jobResult.type == "geojson-sav" || jobResult.type == "geojson-coral") {
            // Define the projection based on your jobResult
            const stacproj = new Projection({ code: "EPSG:" + jobResult.epsg });


            // 1. Create the Styles based on your specifications
            const neighborStyle = new Style({
                fill: new Fill({ color: "#cea2fd" }),
                stroke: new Stroke({ color: "red", width: 2 }),        // Red boundary, thicker
                zIndex: 1                                              // Equivalent to bringToFront()
            });

            const clickedStyle = new Style({
                fill: new Fill({ color: "#cea2fd" }),     // Red, 80% opacity
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
                id: layerUniqueId,
                title: layerUniqueId,
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
                        const featureId = f.getProperties()["patch_id"] - 1;
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

                    htmlString += "<h3><b>Habitat Metrics</b></h3><b>Area</b>: "
                    + properties["area_ha"] 
                    + "ha<br/><b>Total area of connected habitats:</b> "
                    + properties["neigh_area_ha"] 
                    + "ha<br/>";

                    // Update the HTML inside the popup and move it to where the user clicked
                    popupContent.innerHTML = htmlString;
                    popupOverlay.setPosition(evt.coordinate);
                } else {
                    // Hide the popup if the user clicks somewhere empty on the map
                    popupOverlay.setPosition(undefined);
                }
            });

        } else {
            // not yet loaded, creat it
            const image = new GeoTIFF({
                normalize: false,
                interpolate: false,
                sources: [
                    {
                        url: jobResult.href
                    },
                ],
            });
            //TODO: this is really really bad
            const style = JSON.parse(jobResult.style);

            
            const layer = new SimpleLayer({
                id: layerUniqueId,
                title: layerUniqueId,
                olLayer: new TileLayer({
                    source: image,
                    style: style,
                }),
            });
            layer.olLayer.setOpacity(opacity / 100);
            map.layers.addLayer(layer);
        

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
                        {/* <MapAnchor position="top-left" horizontalGap={0} verticalGap={10}>
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
                        </MapAnchor> */}
                        <Box>
                            {timeseriesViewActive && selectedTimeseries && expandedResultType && viewableJobResults.length > 0 &&
                                <Box
                                    position="absolute"
                                    bottom="135px"
                                    left="55%"
                                    transform="translateX(-50%)"
                                    width="90%"
                                    zIndex="10"
                                    pointerEvents="auto"
                                >
                                    {viewableJobResults.length == 1 && (
                                        <Slider.Root background={"#ccccccee"} padding={"5px"} border={"solid"} borderRadius={"15px"} borderColor={"#444444"}
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
                                                            <Tag.Root transform="rotate(-90deg) translate(-45px);">
                                                                <Tag.Label fontWeight={700} fontSize={"120%"} fontFamily={"monospace"}>{jobResult.phenomenonTime}</Tag.Label>
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
                                        <Slider.Root background={"#ccccccee"} padding={"5px"} border={"solid"} borderRadius={"15px"} borderColor={"#444444"}
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
                                                        <Slider.Marker zIndex="9" pt="7" key={index} value={index} w={"100%"}>
                                                            <Circle h="3" w="3" bg="teal"></Circle>
                                                            <Tag.Root transform="rotate(-90deg) translate(-45px);">
                                                                <Tag.Label fontWeight={700} fontSize={"120%"} fontFamily={"monospace"}>{jobResult.phenomenonTime}</Tag.Label>
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
                                            <LuRuler />
                                            Tools & Configuration
                                        </Tabs.Trigger>
                                        <Tabs.Trigger value="info">
                                            <LuDatabase />
                                            Metadata
                                        </Tabs.Trigger>
                                    </Tabs.List>
                                    <Tabs.Content value="legend">
                                        <Legend process={expandedResultType?.name} timeseries={selectedTimeseries} />
                                        <Box pt="4" h="80vh">
                                            <MapContainer
                                                map={map}
                                                role="main"
                                                aria-label=""
                                            >
                                                <Flex gap="4" direction="column">
                                                    
                                                    <MapSidebarControls map={map} position={"top-left"} verticalGap={0} />
                                                    <Box bg="white" p="4" borderWidth="1px" borderRadius="md" boxShadow="sm">
                                                        <Stack >
                                                            <Button
                                                                size="md"
                                                                onClick={() => collapsible.setOpen(!collapsible.open)}
                                                            >
                                                                <LuRuler />
                                                                {collapsible.open ? <Text>Exit Measurement Mode</Text> : <Text>Measurement Mode</Text>}
                                                                <Icon>{collapsible.open ? <LuChevronUp /> : <LuChevronDown />}</Icon>
                                                            </Button>
                                                            <Collapsible.RootProvider value={collapsible}>
                                                                <Collapsible.Content>
                                                                    {collapsible.open &&
                                                                        <Measurement map={map} activeFeatureStyle={RED_STYLE} finishedFeatureStyle={BLACK_STYLE} />
                                                                    }
                                                                </Collapsible.Content>
                                                            </Collapsible.RootProvider>
                                                            <Tooltip
                                                                content="Select a timeseries to inspect its pixel values"
                                                                disabled={!!selectedTimeseries}
                                                            >
                                                                <Box as="span" w="100%">
                                                                    <Button
                                                                        size="md"
                                                                        w="100%"
                                                                        disabled={!selectedTimeseries}
                                                                        onClick={() => pixelInspectorCollapsible.setOpen(!pixelInspectorCollapsible.open)}
                                                                    >
                                                                        <LuCrosshair />
                                                                        {pixelInspectorCollapsible.open ? <Text>Exit Inspection Mode</Text> : <Text>Inspection Mode</Text>}
                                                                        <Icon>{pixelInspectorCollapsible.open ? <LuChevronUp /> : <LuChevronDown />}</Icon>
                                                                    </Button>
                                                                </Box>
                                                            </Tooltip>
                                                            <Collapsible.RootProvider value={pixelInspectorCollapsible}>
                                                                <Collapsible.Content>
                                                                    {pixelInspectorCollapsible.open && map &&
                                                                        <PixelInspector map={map} />
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
                                        <Box pt="4" h="80vh">
                                            No metadata available
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