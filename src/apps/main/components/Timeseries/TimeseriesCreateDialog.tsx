// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { FC, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { FiPlus } from "react-icons/fi";
import {
    Heading,
    Text,
    Input,
    Steps,
    Button,
    ButtonGroup,
    Flex,
    Box,
    Table,
    Field,
    Stack,
    CloseButton,
    Dialog,
    Portal,
    IconButton,
    HStack,
    Listbox,
    createListCollection,
    ListCollection,
} from "@chakra-ui/react";
import { computed } from "@conterra/reactivity-core";

import { MapContainer, MapModel, MapRegistry, SimpleLayer } from "@open-pioneer/map";
import { useService } from "open-pioneer:react-hooks";
import { NotificationService } from "@open-pioneer/notifier";

import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector.js";
import Draw from "ol/interaction/Draw.js";

import { JobResult, Process, SpatialExtent, Timeseries } from "../../components/definitions";
import { MapInfoControls } from "../../components/Map/MapInfoControls";
import { MapZoomControls } from "../../components/Map/MapZoomControl";
import { ActionButton } from "./utils/ActionButton";
import { TimespanWidget } from "./ParameterWidgets/TimespanWidget";
import { PARAMETER_WIDGETS, getExtentPreview, hasDerivedExtent } from "./ParameterWidgets/registry";
import { ParameterWidgetValue, SerializedParams } from "./ParameterWidgets/types";
import { AreaMapPreview } from "./ParameterWidgets/AreaMapPreview";
import { GROUP_ORDER, processGroup } from "./processGroups";

import { useServices } from "../../services/Services";
import { MAP_BOX } from "../../services";
import { EventEmitter } from "@open-pioneer/core";
import { Projection } from "ol/proj";
import { Point } from "ol/geom";
import { Site } from "../../views/Sites/Site/Site";
import GeoJSON from "ol/format/GeoJSON";

// Parameters

interface ProcessParametersWidgetProps {
    selectedProcess: Process | undefined;
    onChange: (value: ParameterWidgetValue) => void;
    startDate: Date | null;
    endDate: Date | null;
    onStartChange: (date: Date | null) => void;
    onEndChange: (date: Date | null) => void;
}

function ProcessParametersWidget({
    selectedProcess,
    onChange,
    startDate,
    endDate,
    onStartChange,
    onEndChange,
}: ProcessParametersWidgetProps) {
    if (!selectedProcess) {
        return <></>;
    }

    const Widget = PARAMETER_WIDGETS[selectedProcess.name];
    if (Widget) {
        // Remount on process change so each widget starts from its own defaults.
        // The widget owns its own time range (encoded in its params), so no
        // separate timespan picker is shown for these processes.
        return <Widget key={selectedProcess.name} process={selectedProcess} onChange={onChange} />;
    }

    // Processes without a dedicated widget have no configurable parameters, but
    // still need a timespan for the job Create auto-starts.
    return (
        <Stack pt="8" gap="4" align="flex-start" maxW="md">
            <Text textStyle="lg">Parameters for: <strong>{selectedProcess.name}</strong></Text>
            <Text color="fg.muted">No configurable parameters for this process.</Text>
            <TimespanWidget
                startDate={startDate}
                endDate={endDate}
                onStartChange={onStartChange}
                onEndChange={onEndChange} />
        </Stack>
    );
}

// Extent
interface ExtentSelectionProps {
    initialExtent: number[]
    onGeometryChange: (extent?: SpatialExtent) => void
    isVisible: boolean
    dialogClosed: boolean
    extentValid: boolean
}

function ExtentSelection(props: ExtentSelectionProps) {
    const mapService = useService<MapRegistry>("map.MapRegistry");
    const [extent, setExtent] = useState<SpatialExtent | undefined>();
    const [map, setMap] = useState<MapModel>();
    const geojson = new Projection({ code: "EPSG:4326" });
    const google = new Projection({ code: "EPSG:3857" });

    useEffect(() => {
        const init = async () => {
            const map = await mapService.expectMapModel(MAP_BOX);
            setMap(map);
            map.zoom(
                [
                    new Point([props.initialExtent[0]!, props.initialExtent[1]!]).transform(geojson, google),
                    new Point([props.initialExtent[2]!, props.initialExtent[3]!]).transform(geojson, google)
                ],
                { viewPadding: { top: 50, bottom: 100 } }
            );
        };

        init();
    }, []);

    const source = new VectorSource();
    const vector = new VectorLayer({
        source: source,
        style: {
            "fill-color": "rgba(255, 255, 255, 0.2)",
            "stroke-color": "#2C7D75",
            "stroke-width": 2,
            "circle-radius": 7,
            "circle-fill-color": "#2C7D75",
        },
    });

    const drawInteraction = new Draw({
        source: source,
        type: "Polygon",
        // geometryFunction: createPolygon(),
        style: {
            "stroke-color": "#2C7D75",
            "stroke-width": 2,
            "circle-radius": 7,
            "circle-fill-color": "#2C7D75",
        }
    });

    async function createPolygon() {
        vector.getSource()?.clear();
        drawInteraction.removeLastPoint();

        map!.olMap.addInteraction(drawInteraction);
        map!.layers.addLayer(new SimpleLayer({ olLayer: vector, title: "temp" }));

        const drawStart = drawInteraction.on("drawstart", () => {
            vector.getSource()?.clear();
        });

        const drawEnd = drawInteraction.on("drawend", (e) => {
            const feature = e.feature;
            const geom = feature.getGeometry()!.getExtent();

            const format = new GeoJSON();
            const ogcFeature = format.writeFeatureObject(feature, {
                dataProjection: "EPSG:4326",
                featureProjection: "EPSG:3857"
            });

            const newExtent = {
                geometry: ogcFeature,
                bbox:
                    [
                        geom[0]!,
                        geom[1]!,
                        geom[2]!,
                        geom[3]!
                    ]
            } as SpatialExtent;
            setExtent(newExtent);
            drawInteraction.abortDrawing();
            props.onGeometryChange(newExtent);
        });
    }


    useEffect(() => {
        if (props.isVisible && map) {
            createPolygon();
            props.onGeometryChange(extent);
        }
    }, [props.isVisible, map]);

    // useEffect(() => {
    //     if (props.dialogClosed) {
    //         drawBox();
    //     }
    // }, [props.dialogClosed]);

    return (
        <>
            <Text pt="8" pb="2" textStyle="lg">Please select extent:</Text>
            <Box height="60vh" border="1px solid black">
                <Flex flex="1" height="100%" width="100%" direction="column" overflow="hidden" position="relative">
                    {map &&
                        <MapContainer
                            map={map}
                            role="boxselection"
                            aria-label="">
                            {!extent &&
                                <Box bg="white" width="40%" p="2" m="1" borderRadius="md" boxShadow="sm">
                                    <Text>
                                        Please select an area of interest. It´s bounding box must be between 0.05° and 1.5° latitude and longitude.
                                    </Text>
                                </Box>
                            }
                            {extent && props.extentValid &&
                                <Box bg="white" width="40%" p="2" m="1" borderRadius="md" boxShadow="sm">
                                    <Text>
                                        Extent Cordinates: <br />
                                        x1: {extent?.bbox[0]}, x2: {extent?.bbox[1]} <br />
                                        x2: {extent?.bbox[2]}, y2: {extent?.bbox[3]}
                                    </Text>
                                </Box>
                            }
                            {!props.extentValid &&
                                <Box bg="white" width="40%" p="2" m="1" borderRadius="md" boxShadow="sm">
                                    <Text>
                                        Invalid extent: too large or too small. It´s bounding box must be between 0.05° and 2.5° latitude and longitude.
                                    </Text>
                                </Box>
                            }

                            <MapInfoControls map={map} />
                            <MapZoomControls map={map} />
                        </MapContainer>
                    }
                </Flex>
            </Box>
        </>
    );
}


interface CreateTimeseriesProps {
    resultCallback: (result: Timeseries | undefined) => void;
    eventListener: EventEmitter<Event>;
    scenario: Site;
}

interface ProcessWithValue extends Process {
    value: string
}

export const CreateTimeseries: FC<CreateTimeseriesProps> = ({ resultCallback, scenario }: CreateTimeseriesProps) => {
    const { id } = useParams();
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [extent, setExtent] = useState<SpatialExtent | undefined>();
    const [step, setStep] = useState<number>(0);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const { createTimeseries, createJob, getProcesses, getTimeseriesById } = useServices();
    const [expandDialogClosed, setExpandDialogClosed] = useState<boolean>(false);
    const notificationService = useService<NotificationService>("notifier.NotificationService");
    const [extentValid, setExtentValid] = useState<boolean>(true);

    const [value, setValue] = useState<string[]>([]);
    const [processes, setProcesses] = useState<ProcessWithValue[]>([]);
    const [processTable, setProcessTable] = useState<ListCollection<ProcessWithValue>>();
    const [selectedProcess, setSelectedProcess] = useState<Process | undefined>();
    const [params, setParams] = useState<SerializedParams | undefined>();
    const [paramsValid, setParamsValid] = useState<boolean>(true);

    const handleParamsChange = useCallback((value: ParameterWidgetValue) => {
        setParams(value.params);
        setParamsValid(value.valid);
        // Widget-based processes have no separate timespan picker; they report the
        // timespan for the auto-started job here. Sync it into the shared start/end
        // dates that create()/createJob consume.
        if (value.timespan) {
            setStartDate(value.timespan.start);
            setEndDate(value.timespan.end);
        }
    }, []);

    // Some processes (e.g. reference-area based ones) imply their extent from
    // their parameters rather than letting the user draw a free one. For those
    // the extent step shows the implied areas and constrains drawing to them.
    const extentPreview = getExtentPreview(selectedProcess?.name, params);

    // Other processes have no extent step at all — the backend derives their
    // extent from one of the uploaded files, so the timeseries is created
    // without one.
    const derivedExtent = hasDerivedExtent(selectedProcess?.name);

    // Whether the selected process has a dedicated parameter widget. Those widgets
    // own their own time range, so the fallback TimespanWidget (and its timespan
    // validity) only applies to processes without a dedicated widget.
    const hasWidget = selectedProcess != null && PARAMETER_WIDGETS[selectedProcess.name] != null;

    const fetchProcesses = async () => {
        if (!id)
            return;
        try {
            const data = await getProcesses(id);
            setProcesses(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleExitClick = () => {
        setStep(0);
        setName("");
        setDescription("");
        setValue([]);
        setSelectedProcess(undefined);
        setExtent(undefined);
        setStartDate(null);
        setEndDate(null);
        setExpandDialogClosed(true);
    };

    const create = async () => {
        const timeseries: Timeseries = {
            id: "",
            scenario_id: id!.toString(),
            name: name,
            description: description,
            jobs: undefined,
            extent: extent,
            process: selectedProcess,
            parameters: params,
        };
        const created = await createTimeseries(timeseries);

        // callback the results to the timeseries component. Load the stored timeseries
        // so its jobs can be fetched, the fallback cannot show jobs until the page is reloaded.
        const fallbackResult = {
            id: created,
            scenario_id: id!.toString(),
            name: name,
            description: description,
            jobs: undefined,
            extent: extent,
            process: selectedProcess,
            parameters: params,
            results: computed(() => new Map<string, JobResult[]>())
        };
        const result: Timeseries = await getTimeseriesById(created).catch(e => {
            console.error("Failed to load created timeseries:", e);
            return fallbackResult;
        });
        resultCallback(result);

        // also notify the user
        notificationService.notify({
            title: "Timeseries created:",
            message: JSON.stringify(created),
            level: "info",
            displayDuration: 5000,
        });

        // Auto-start the first job for the selected timespan. If this fails the
        // timeseries still exists, so keep it and warn the user — they can retry
        // via the Expand dialog.
        try {
            const jobResult = await createJob(id!, created, {
                timespan: [startDate!, endDate!],
            });
            notificationService.notify({
                title: "Job created",
                message: jobResult,
                level: "info",
                displayDuration: 5000,
            });
            // pick up the new job so it is shown as in progress
            result.refreshJobs?.().catch(e => console.error("Failed to refresh jobs:", e));
        } catch (error) {
            console.error(error);
            notificationService.notify({
                title: "Job creation failed",
                message:
                    "The timeseries was created, but its first job could not be started. " +
                    "You can retry from the Expand dialog.",
                level: "error",
                displayDuration: 8000,
            });
        }

        handleExitClick();
    };


    // The timespan drives the job Create auto-starts, so both dates are required.
    // It is only collected for processes without a dedicated widget; widget-based
    // processes encode their own time range in their params.
    const timespanStepValid = hasWidget || (startDate != null && endDate != null);

    // Data input step requires both text fields.
    const dataStepValid = name != "" && description != "";

    // Process step requires a selected process whose parameter widget (if any)
    // reports its current selection as valid, plus a complete timespan (the
    // timespan picker lives in this step for processes without a widget).
    const processStepValid = value.length > 0 && paramsValid && timespanStepValid;

    // Extent step: a valid drawn extent is required in both branches. Processes
    // with an extent preview draw an extent that must lie inside the area implied
    // by their parameters (see AreaMapPreview); the others draw a free extent
    // validated by size (see checkExtent).
    const extentStepValid = extent != null && extentValid;

    // Reset the drawn extent when the process changes: preview-bounded and
    // processes validate their extent differently, so an extent drawn under one
    // must not carry over to the other.
    useEffect(() => {
        setExtent(undefined);
        setExtentValid(false);
    }, [selectedProcess]);

    // Reset parameters when the process changes. A widget (if the process has one)
    // re-reports its own params/validity on mount; processes without a widget have
    // no parameters and are valid by default.
    useEffect(() => {
        setParams(undefined);
        setParamsValid(!hasWidget);
    }, [selectedProcess, hasWidget]);

    useEffect(() => {
        const listCollection = createListCollection({
            items: processes!.map((p) => {
                p.value = p.id.toString();
                return p;
            }),
            // Group the menu by algorithm family. GROUP_ORDER fixes the section
            // order; groups without processes in this scenario never appear.
            groupBy: (p) => processGroup(p.name),
            groupSort: GROUP_ORDER
        });
        setProcessTable(listCollection);
    }, [processes]);

    const checkExtent = (xt?: SpatialExtent) => {
        if (xt) {
            const format = new GeoJSON();

            const olGeometry = format.readGeometry(xt.geometry.geometry);

            const xtGeom = olGeometry.getExtent();

            const minX = xtGeom[0]; // West Longitude
            const minY = xtGeom[1]; // South Latitude
            const maxX = xtGeom[2]; // East Longitude
            const maxY = xtGeom[3]; // North Latitude

            const lonDelta = maxX! - minX!;
            const latDelta = maxY! - minY!;

            const minDegrees = 0;
            const maxDegrees = 1.5;

            if (lonDelta > maxDegrees || latDelta > maxDegrees) {
                return false;
            }

            return lonDelta > minDegrees && latDelta > minDegrees;
        }
        return true;
    };


    // The wizard's steps, in order. Each carries the condition that has to hold
    // before "Next" is enabled, so the checks stay attached to their step rather
    // than to a position — the extent step is absent for some processes.
    const steps = [
        {
            title: "Data Input",
            valid: dataStepValid,
            description: <>
                <Stack pt="8" gap="4" align="flex-start" maxW="md">
                    <Field.Root required>
                        <Field.Label>Name</Field.Label>
                        <Input
                            value={name}
                            onChange={(ev) => setName(ev.target.value)}
                            placeholder='Timeseries 52'
                            css={{ "--focus-color": "#2C7D75" }} />
                    </Field.Root>

                    <Field.Root required>
                        <Field.Label>Description</Field.Label>
                        <Input
                            value={description}
                            onChange={(ev) => setDescription(ev.target.value)}
                            placeholder='Timeseries for demonstration purposes only!'
                            css={{ "--focus-color": "#2C7D75" }} />
                    </Field.Root>
                </Stack>
            </>,
        },
        {
            title: "Process Selection",
            valid: processStepValid,
            description: <>
                <Flex pt="8" direction="row" align="space-between">
                    <Box width="300px">
                        {processTable &&
                            <Listbox.Root
                                deselectable
                                collection={processTable}
                                value={value}
                                onValueChange={(details) => {
                                    setValue(details.value);
                                    setSelectedProcess(details.items[0]!);
                                }}
                                width="full"
                                gap="4"
                            >
                                <Listbox.Label><Text fontSize="md">Available Algorithms:</Text></Listbox.Label>
                                <Listbox.Content maxH="60vh" overflowY="auto">
                                    {processTable.group().map(([groupKey, items]) => (
                                        <Listbox.ItemGroup key={groupKey}>
                                            <Listbox.ItemGroupLabel
                                                fontSize="xs"
                                                color="fg.muted"
                                                textTransform="uppercase"
                                                letterSpacing="wide">
                                                {groupKey}
                                            </Listbox.ItemGroupLabel>
                                            {items.map((item) => (
                                                <Listbox.Item
                                                    item={item}
                                                    key={item.value}
                                                    flexDirection="row"
                                                    alignItems="flex-start"
                                                    gap="1">
                                                    <HStack align="space-between">
                                                        <Box>
                                                            <Listbox.ItemText>{item.name}</Listbox.ItemText>
                                                            <Text fontSize="xs" color="fg.muted" mt="1">
                                                                {item.description}
                                                            </Text>
                                                        </Box>
                                                        <Box>
                                                            <Listbox.ItemIndicator
                                                                position="absolute"
                                                                right="4"
                                                                top="40%" />
                                                        </Box>
                                                    </HStack>
                                                </Listbox.Item>
                                            ))}
                                        </Listbox.ItemGroup>
                                    ))}
                                </Listbox.Content>
                            </Listbox.Root>
                        }
                    </Box>
                    <Box pl="2%">
                        <ProcessParametersWidget
                            selectedProcess={selectedProcess}
                            onChange={handleParamsChange}
                            startDate={startDate}
                            endDate={endDate}
                            onStartChange={setStartDate}
                            onEndChange={setEndDate}
                        />
                    </Box>
                </Flex>
            </>,
        },
        ...(derivedExtent ? [] : [{
            title: "Extent Selection",
            valid: extentStepValid,
            description: extentPreview
                ? <AreaMapPreview
                    boundingArea={extentPreview.boundingArea}
                    contextAreas={extentPreview.contextAreas}
                    isVisible={step == 2}
                    onExtentChange={(ext, valid) => {
                        setExtentValid(valid);
                        setExtent(valid ? ext : undefined);
                    }} />
                : <ExtentSelection
                    initialExtent={scenario.bbox}
                    isVisible={step == 2}
                    dialogClosed={expandDialogClosed}
                    extentValid={extentValid}
                    onGeometryChange={(ext) => {
                        if (checkExtent(ext)) {
                            setExtentValid(true);
                            setExtent(ext);
                        } else {
                            console.log("Extent not valid");
                            setExtentValid(false);
                            setExtent(undefined);
                        }
                    }} />,
        }]),
        {
            title: "Check Data",
            valid: true,
            description: <>
                <Text pt="8" pb="2" textStyle="lg">Summary of inputs</Text>
                <Table.Root>
                    <Table.Caption />
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader fontWeight="bold">Parameter</Table.ColumnHeader>
                            <Table.ColumnHeader fontWeight="bold">Value</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        <Table.Row key="name">
                            <Table.Cell>name</Table.Cell>
                            <Table.Cell>{name}</Table.Cell>
                        </Table.Row>
                        <Table.Row key="description">
                            <Table.Cell>description</Table.Cell>
                            <Table.Cell>{description}</Table.Cell>
                        </Table.Row>
                        {Object.entries(params ?? {}).map(([k, v]) => (
                            <Table.Row key={k}>
                                <Table.Cell>{k}</Table.Cell>
                                <Table.Cell>{Array.isArray(v) ? v.join(", ") : String(v)}</Table.Cell>
                            </Table.Row>
                        ))}
                        {extent &&
                            <Table.Row key="extent">
                                <Table.Cell>extent (bbox)</Table.Cell>
                                <Table.Cell>
                                    {extent.bbox.map((c) => c.toFixed(4)).join(", ")}
                                </Table.Cell>
                            </Table.Row>
                        }
                        <Table.Row key="start_date">
                            <Table.Cell>start date</Table.Cell>
                            <Table.Cell>{startDate?.toLocaleDateString()}</Table.Cell>
                        </Table.Row>
                        <Table.Row key="end_date">
                            <Table.Cell>end date</Table.Cell>
                            <Table.Cell>{endDate?.toLocaleDateString()}</Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table.Root>
            </>,
        },
    ];

    // Whether the "Next" button is enabled for the current step. Derived directly
    // from the relevant state rather than mirrored into a separate state via
    // effects — the latter left the button stale on step entry (it only refreshed
    // once the user nudged a field such as the year).
    const nextButtonDisabled = !steps[step]?.valid;

    /*
    - Name
    - Description
    - Process
    - Process Parameters that are shared between all results. E.g. bounding box, algorithm parameters.
    */

    return (
        <>
            <Dialog.Root size="xl" placement="center">
                <Dialog.Trigger asChild>
                    <Flex justify="center" mt={4}>
                        <IconButton
                            aria-label="Add new Timeseries"
                            bg="#2C7D75"
                            color="white"
                            size="lg"
                            borderRadius="full"
                            _hover={{ bg: "teal.700" }}
                            onClick={() => {
                                fetchProcesses();
                            }}>
                            <FiPlus></FiPlus>
                        </IconButton>
                    </Flex>
                </Dialog.Trigger>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.Header>
                                <Dialog.Title>
                                    <Flex gap="4">
                                        <Heading height="12" size="lg" order="1">
                                            Create new Timeseries
                                        </Heading>
                                    </Flex>
                                </Dialog.Title>
                            </Dialog.Header>
                            <Steps.Root
                                defaultStep={0}
                                count={steps.length - 1}
                                onStepChange={(details) => { setStep(details.step); }}
                                orientation="horizontal"
                                width="100%">
                                <Dialog.Body>
                                    <Steps.List>
                                        {steps.map((step, index) => (
                                            <Steps.Item colorPalette="teal" key={index} index={index} title={step.title} >
                                                <Steps.Indicator />
                                                <Steps.Title fontSize="lg">{step.title}</Steps.Title>
                                                <Steps.Separator />
                                            </Steps.Item>
                                        ))}
                                    </Steps.List >
                                    {steps.map((step, index) => (
                                        <Steps.Content key={index} index={index}>
                                            {step.description}
                                        </Steps.Content>
                                    ))}
                                </Dialog.Body>
                                <Dialog.Footer>
                                    <ButtonGroup colorPalette="teal" size="md" variant="outline">
                                        <Steps.PrevTrigger asChild>
                                            <Button
                                                color="black"
                                                border="1px solid #2C7D75"
                                                _hover={{ bg: "teal.50" }}>
                                                Prev
                                            </Button>
                                        </Steps.PrevTrigger>
                                        {(step < steps.length - 1) &&
                                            <Steps.NextTrigger asChild>
                                                <Button
                                                    color="black"
                                                    border="1px solid #2C7D75"
                                                    _hover={{ bg: "teal.50" }}
                                                    disabled={nextButtonDisabled}>
                                                    Next
                                                </Button>
                                            </Steps.NextTrigger>
                                        }
                                    </ButtonGroup>
                                    <Steps.CompletedContent>
                                        <Dialog.CloseTrigger asChild>
                                            <ActionButton
                                                label="Create"
                                                tooltip="Create timeseries"
                                                disabled={false}
                                                onClick={() => { create(); }}
                                                w={"170px"}
                                            />
                                        </Dialog.CloseTrigger>
                                    </Steps.CompletedContent>
                                </Dialog.Footer>
                            </Steps.Root>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton
                                    height="10"
                                    variant="outline"
                                    order="2"
                                    size="md"
                                    color="black"
                                    border="1px solid #2C7D75"
                                    _hover={{ bg: "teal.50" }}
                                    onClick={handleExitClick} />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    );
};
