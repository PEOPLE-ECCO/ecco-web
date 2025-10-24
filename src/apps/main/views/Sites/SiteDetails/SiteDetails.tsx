// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { useServices } from "../../../services/Services";

import { MAP_ID } from "../../../services";
import {
    Box, Card, GridItem, Center, Flex,
    Slider, SliderTrack, Icon, Grid,
    CardBody,
    Circle,
    Text
} from "@chakra-ui/react";
import { MapRegistry, MapContainer, SimpleLayer } from "@open-pioneer/map";

import { Projection } from "ol/proj";
import { Point } from "ol/geom";
import STAC from "ol-stac";
import { useService } from "open-pioneer:react-hooks";
import { MapZoomControls } from "../../../components/Map/MapZoomControl";
import { MapInfoControls } from "../../../components/Map/MapInfoControls";
import { MapSidebarControls } from "../../../components/Map/MapSidebarControls";
import { TimeseriesItem } from "../../../components/Timeseries/Timeseries";
import { MapSwitcherControls } from "../../../components/Map/MapSwitcherControls";
import { TimeseriesControl } from "../../../components/Timeseries/TimeseriesControl";
import { SliderCircle } from "../../../components/Slider/SliderCircle";
import { Asset, AssetWrap, Catalog, Job, Timeseries } from "../../../components/definitions";

const _proj3857 = new Projection({ code: "EPSG:3857" });
const _proj32631 = new Projection({ code: "EPSG:32631" });

export function SiteDetails() {
    const { id } = useParams();
    const { getTimeseries, getJobsByTimeseriesId, getJobCatalog } = useServices();
    const [timeseries, setTimeseries] = useState<Timeseries[]>();
    const [selectedTimeseries, setSelectedTimeseries] = useState<Timeseries | undefined>();
    const [jobs, setJobs] = useState<Job[]>();
    const [catalogs, setCatalogs] = useState<Catalog[]>();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<number>(-1);
    const mapService = useService<MapRegistry>("map.MapRegistry");
    const [shouldHighlightAndZoom, setShouldHighlightAndZoom] = useState(true);

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
        const fetchJobs = async () => {
            if (!selectedTimeseries) return;
            try {
                const jobs = await getJobsByTimeseriesId(id!, selectedTimeseries.id!);
                selectedTimeseries.jobs = jobs;
                setJobs(jobs);

                await fetchCatalogs(jobs);
            } catch (error) {
                console.error(error);
            }
        };

        fetchJobs();
    }, [selectedTimeseries]);

    useEffect(() => {
        showSelectedAsset();
    }, [selectedAsset]);

    async function fetchCatalogs(newjobs: Job[]) {
        if (!newjobs) return;
        setCatalogs([]);
        const fetchedJobs = [];
        const fetchedAssets = [];
        for (const job of newjobs!) {
            const cat = await getJobCatalog(id!, job);
            if (cat) {
                // Catalog might not be ready yet (e.g. because processing is still ongoing)
                catalogs?.push(cat);
                for (const a of Object.values(cat.assets)) {
                    a.job = job;
                    fetchedAssets.push(a);
                }
                job.catalog = cat;
                fetchedJobs.push(job);
            }
        }
        setAssets(fetchedAssets);
        setJobs(fetchedJobs);
        setSelectedAsset(0);
    }

    async function remove_current_item() {
        const map = await mapService.expectMapModel(MAP_ID);
        map.layers.removeLayerById("current_item");
        map.removeHighlights();
    }

    function downloadCurrentResult() {
        const href = assets[selectedAsset]?.href;
        if (!href)
            return;

        const link = document.createElement("a");
        link.href = href;
        link.download = href.split("/").pop() || "download.tiff"; // or a fixed name if needed
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }


    async function showSelectedAsset() {
        if (assets.length == 0 || selectedAsset == undefined) {
            return;
        }
        const asset = assets[selectedAsset]!;
        const job = asset.job;;

        const map = await mapService.expectMapModel(MAP_ID);
        await remove_current_item();

        const google = new Projection({ code: "EPSG:3857" });
        const stacproj = new Projection({ code: "EPSG:" + asset["proj:epsg"] });
        // const stacproj = new Projection({ code: "EPSG:4326" });

        const staclayer = new STAC({
            data: job.catalog,
            displayGeoTiffByDefault: true,
            bands: [1]
        });
        const layer = new SimpleLayer({
            id: "current_item",
            title: asset.title,
            olLayer: staclayer
        });
        map.layers.addLayer(layer);


        // const bbox = catalog.bbox;
        if (shouldHighlightAndZoom) {
            const bbox = asset["proj:bbox"];
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
        <Grid templateColumns="repeat(14, 1fr)">
            <GridItem colSpan={3} rowSpan={14} margin="2px" padding="2px">
                <TimeseriesItem timeseries={timeseries} onSelect={setSelectedTimeseries} />
            </GridItem>
            <GridItem colSpan={11} rowSpan={14} margin="2px" padding="2px">
                <Box height="100%">
                    <Flex flex="1" height="100%" direction="column" overflow="hidden" position="relative">
                        <MapContainer
                            mapId={MAP_ID}
                            role="main"
                            aria-label=""
                        >
                            <MapSidebarControls mapId={MAP_ID} />
                            <MapInfoControls mapId={MAP_ID} />
                            <MapSwitcherControls isChecked={shouldHighlightAndZoom} onToggle={setShouldHighlightAndZoom} />
                            <MapZoomControls mapId={MAP_ID} />

                            {selectedTimeseries &&
                                <Box
                                    position="absolute"
                                    bottom="2%"
                                    left="25%"
                                    transform="translateX(-50%)"
                                    width="50%"
                                    padding="4"
                                    zIndex="10"
                                    pointerEvents="auto"
                                >
                                    <Card.Root w="100%" padding={4}>
                                        <Card.Body>
                                            <Text>Info: {selectedTimeseries.name}</Text>
                                            {jobs && assets.length > 0 && (
                                                <Center w="100%">
                                                    <Slider.Root
                                                        w="75%"
                                                        step={1}
                                                        max={assets.length - 1}
                                                        defaultValue={[0]}
                                                        onValueChangeEnd={(val) => {
                                                            console.log("onChangeEnd" + val.value);
                                                            setSelectedAsset(val.value[0]);
                                                        }
                                                        }
                                                    >
                                                        <Slider.Control>
                                                            {assets.map((asset, index) => (
                                                                <>
                                                                    <Slider.Marker key={index} value={index} pt={3} ml="-50" w={"100%"}>
                                                                        {asset.title.substring(7, asset.title.length - 5)}
                                                                    </Slider.Marker>
                                                                    <Slider.Marker
                                                                        zIndex="98"
                                                                        ml="-0.5em"
                                                                        mt="-0.9em"
                                                                        key={asset.title + index}
                                                                        value={index}
                                                                    >
                                                                        <Icon viewBox="0 0 200 200">
                                                                            <Circle cx="100" cy="100" r="75" fill="black" />
                                                                        </Icon>
                                                                    </Slider.Marker>
                                                                </>
                                                            ))}
                                                            <Slider.Track>
                                                                <Slider.Range />
                                                            </Slider.Track>
                                                            <SliderCircle />
                                                        </Slider.Control>
                                                    </Slider.Root>
                                                </Center>
                                            )}
                                        </Card.Body>
                                    </Card.Root>
                                    <TimeseriesControl
                                        asset={assets[selectedAsset]!}
                                        onDownloadCurrent={downloadCurrentResult}
                                    />
                                </Box>
                            }
                        </MapContainer>
                    </Flex>
                </Box>
            </GridItem>
        </Grid>
    );
}
