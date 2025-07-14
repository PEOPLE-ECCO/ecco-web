// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useServices } from "../../../services/Services";

import { MAP_ID } from "../../../services";
import {
    Box, Card, GridItem, Flex,
    Grid,
    CardBody,
    Tabs,
    TabPanels,
    TabPanel,
    useDisclosure
} from "@open-pioneer/chakra-integration";
import { MapRegistry, MapContainer, SimpleLayer } from "@open-pioneer/map";

import { Projection } from "ol/proj";
import { Point } from "ol/geom";
import STAC from "ol-stac";
import { useService } from "open-pioneer:react-hooks";
import { MapZoomControls } from "../../../components/Map/MapZoomControl";
import { MapInfoControls } from "../../../components/Map/MapInfoControls";
import { MapSidebarControls } from "../../../components/Map/MapSidebarControls";
import { TimeseriesItem } from "../../../components/Timeseries/TimeseriesItem";
import { MapSwitcherControls } from "../../../components/Map/MapSwitcherControls";
import { Control } from "../../../components/Timeseries/DetailsView/Control";
import { Asset, Job, Timeseries } from "../../../components/definitions";
import { JobLogModal } from "../../../components/Timeseries/DetailsView/JobLogModal";
import { JobTabList } from "../../../components/Timeseries/DetailsView/JobTabList";
import { ActionButton } from "../../../components/Buttons/ActionButton";
import { TimeSeriesSlider } from "../../../components/Slider/TimeSeriesSlider";
import { SwitchTimeseriesModal } from "../../../components/Timeseries/SwitchTimeseriesModal";
import { useNavigate } from "react-router-dom";

export function SiteDetails() {
    const { id } = useParams();
    const { getTimeseries, getJobsByTimeseriesId, getJobCatalog } = useServices();
    const [timeseries, setTimeseries] = useState<Timeseries[]>();
    const [selectedTimeseries, setSelectedTimeseries] = useState<Timeseries | undefined>();
    const [jobs, setJobs] = useState<Job[]>();
    //const [catalogs, setCatalogs] = useState<Catalog[]>();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<number | undefined>(undefined);
    const mapService = useService<MapRegistry>("map.MapRegistry");
    const [shouldHighlightAndZoom, setShouldHighlightAndZoom] = useState(true);

    const [groupedAssets, setGroupedAssets] = useState<Record<string, Asset[]>>({});
    //const [selectedGroup, setSelectedGroup] = useState<string | undefined>(undefined);
    const navigate = useNavigate();

    const {
        isOpen: isSwitchOpen,
        onOpen: onSwitchOpen,
        onClose: onSwitchClose
    } = useDisclosure();

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

    const { getJobLog } = useServices();
    const [log, setLog] = useState<object[]>([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const viewLog = async (job: Job) => {
        setLog(await getJobLog("1", job));
        onOpen();
    };

    async function fetchCatalogs(newjobs: Job[]) {
        if (!newjobs) return;
        //setCatalogs([]);
        const fetchedJobs = [];
        const fetchedAssets = [];
        for (const job of newjobs!) {
            const cat = await getJobCatalog(id!, job);
            if (cat) {
                // Catalog might not be ready yet (e.g. because processing is still ongoing)
                //catalogs?.push(cat);
                for (const a of Object.values(cat.assets)) {
                    a.job = job;
                    fetchedAssets.push(a);
                }
                job.catalog = cat;
                fetchedJobs.push(job);
            }
        }
        //console.log(fetchedAssets);
        //console.log(fetchedJobs);
        
        const grouped = groupAssetsById(fetchedAssets);
        setGroupedAssets(grouped);
        const initialGroup = Object.keys(grouped)[0];
        //setSelectedGroup(initialGroup);
        setAssets(grouped[initialGroup] || []);

        console.log(groupedAssets);
        setAssets(fetchedAssets);
        console.log(assets);
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

    function groupAssetsById(assets: Asset[]): Record<string, Asset[]> {
        return assets.reduce((grouped, asset) => {
            const id = asset.job.id ?? "unknown"; // fallback if id is missing
            if (!grouped[id]) {
                grouped[id] = [];
            }
            grouped[id].push(asset);
            return grouped;
        }, {} as Record<string, Asset[]>);
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
            displayGeoTiffByDefault: false
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
            <GridItem colSpan={2} rowSpan={12} borderWidth="1px" margin="2px" padding="2px" minW={"250px"}>
                <TimeseriesItem timeseries={timeseries} onSelect={setSelectedTimeseries} />
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
                                    minW={"700px"}
                                    padding="4"
                                    zIndex="10"
                                    pointerEvents="auto"
                                >
                                    <Card w="100%">
                                        <CardBody>
                                            <b>Jobs</b>
                                            {jobs && (
                                                <Tabs
                                                    variant="enclosed"
                                                    colorScheme="green"
                                                    onChange={(index) => {
                                                        const groupIds = Object.keys(groupedAssets);
                                                        console.log(groupedAssets);
                                                        const selectedId = groupIds[index];
                                                        //setSelectedGroup(selectedId);
                                                        setAssets(groupedAssets[selectedId] || []);
                                                        setSelectedAsset(0);
                                                    }}
                                                >
                                                    <JobTabList groupedAssets={groupedAssets} />

                                                    <TabPanels>
                                                        {Object.entries(groupedAssets).map(([groupId, groupAssets]) => (
                                                            <TabPanel key={groupId}>
                                                                
                                                                <TimeSeriesSlider
                                                                    groupAssets={groupAssets}
                                                                    onSelectAsset={setSelectedAsset}
                                                                />
                                                                
                                                                <Box pt={8}>
                                                                    {assets[selectedAsset] && (
                                                                        <Control
                                                                            asset={assets[selectedAsset]}
                                                                            onDownloadCurrent={downloadCurrentResult}
                                                                        />
                                                                    )}
                                                                </Box>
                                                                {groupAssets[0] &&
                                                                    <Box pt={3} display="flex" gap={2}>
                                                                        <ActionButton 
                                                                            label="View Log" 
                                                                            tooltip="View Log" 
                                                                            onClick={() => viewLog(groupAssets[0]!.job)} 
                                                                        />
                                                                        <ActionButton label="Start Processing" tooltip="Start Processing" onClick={()=> navigate("timeseries/" + timeseries.id + "/createJob")} />
                                                                    </Box>
                                                                }
                                                                <JobLogModal isOpen={isOpen} onClose={onClose} log={log} />
                                                                <SwitchTimeseriesModal isOpen={isSwitchOpen} onClose={onSwitchClose} />
                                                            </TabPanel>
                                                        ))}
                                                    </TabPanels>
                                                </Tabs>
                                            )}
                                        </CardBody>
                                    </Card>
                                </Box>
                            }
                        </MapContainer>
                    </Flex>
                </Box>
            </GridItem>
        </Grid>
    );
}
