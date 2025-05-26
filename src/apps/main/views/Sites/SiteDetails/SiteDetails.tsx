// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useServices } from "../../../services/Services";

import { MAP_ID } from "../../../services";
import {
    Box, Card, GridItem, Center, Flex,
    Slider, SliderTrack, SliderMark, Icon, Grid,
    CardBody
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
import { MapSwitcherControls } from "../../../components/Map/MapSwitcherControls";
import { TimeseriesControl } from "../../../components/Timeseries/TimeseriesControl";
import { SliderCircle } from "../../../components/Slider/SliderCircle";
import { Asset, AssetWrap, Catalog, Job } from "../../../components/definitions";

const _proj3857 = new Projection({code: "EPSG:3857"});
const _proj32631 = new Projection({code: "EPSG:32631"});

export function SiteDetails() {
    const { id } = useParams();
    const { getTimeseries, getJobsByTimeseriesId, getJobCatalog } = useServices();
    const [timeseries, setTimeseries] = useState<Timeseries[]>();
    const [selectedTimeseries, setSelectedTimeseries] = useState<Timeseries | undefined>();
    const [jobs, setJobs] = useState<Job[]>();
    const [catalogs, setCatalogs] = useState<Catalog[]>();
    const [asset, setAsset] = useState<Asset>();
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
                setJobs(jobs);
                await fetchCatalogs(jobs);
            } catch (error) {
                console.error(error);
            }
        };

        fetchJobs();
    }, [selectedTimeseries]);

    async function fetchCatalogs(newjobs: Job[]) {
        if (!newjobs) return;
        setCatalogs([]);
        const fetched = [];
        for (const job of newjobs!) {
            const cat = await getJobCatalog(id!, job);
            catalogs?.push(cat);
            job.catalog = cat;
            fetched.push(job);
        }
        setJobs(fetched);
    }

    async function remove_current_item() {
        const map = await mapService.expectMapModel(MAP_ID);
        map.layers.removeLayerById("current_item");
        map.removeHighlights();
    }

    function downloadCurrentResult() {
        const href = asset?.href;
        if (!href)
            return;

        const link = document.createElement("a");
        link.href = href;
        link.download = href.split("/").pop() || "download.tiff"; // or a fixed name if needed
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }


    async function setSelectedAsset(job: Job, asset: Asset) {
        const map = await mapService.expectMapModel(MAP_ID);
        await remove_current_item();
        setAsset(asset);

        const google = new Projection({ code: "EPSG:3857" });
        const stacproj = new Projection({ code: "EPSG:" + asset["proj:epsg"] });
        // const stacproj = new Projection({ code: "EPSG:4326" });

        const staclayer = new STAC({
            data: job.catalog,
            displayGeoTiffByDefault: true
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
                            <MapSwitcherControls isChecked={shouldHighlightAndZoom} onToggle={setShouldHighlightAndZoom} />
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
                                            {jobs && (
                                                <Center w="100%">
                                                    <Slider
                                                        w="75%"
                                                        aria-label="slider-ex-1"
                                                        step={1}
                                                        max={5}
                                                        defaultValue={0}
                                                        onChangeEnd={(val) => {
                                                            const job_idx = val >> 16;
                                                            const asset_idx = Object.keys(jobs[job_idx]!.catalog!.assets)[val % (1 << 16)]!;
                                                            setSelectedAsset(jobs[job_idx]!, jobs[job_idx]!.catalog!.assets[asset_idx]!);
                                                        }
                                                        }
                                                    >
                                                        {jobs.map((job, i) => (
                                                            <>

                                                                {job.catalog && Object.keys(job.catalog!.assets!).map((key: keyof AssetWrap, index) => (
                                                                    <>
                                                                        <SliderMark key={job.catalog!.id} value={(i << 16) + index} pt={3} ml="-110" w={"100%"}>
                                                                            {job.catalog?.assets[key]?.title}
                                                                        </SliderMark>
                                                                        <SliderMark
                                                                            zIndex="98"
                                                                            ml="-0.5em"
                                                                            mt="-0.9em"
                                                                            key={job.catalog?.assets[key]?.title}
                                                                            value={(i << 16) + index}
                                                                        >
                                                                            <Icon viewBox="0 0 200 200">
                                                                                <circle cx="100" cy="100" r="75" fill="black" />
                                                                            </Icon>
                                                                        </SliderMark>
                                                                    </>
                                                                ))}
                                                            </>
                                                        ))}
                                                        <SliderTrack />
                                                        <SliderCircle />
                                                    </Slider>
                                                </Center>
                                            )}
                                        </CardBody>
                                    </Card>

                                    {asset && (
                                        <TimeseriesControl
                                            asset={asset}
                                            onDownloadCurrent={downloadCurrentResult}
                                        />
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
