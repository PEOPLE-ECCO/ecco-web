// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import { Box, Button, Field, FileUpload, Flex, HStack, Icon, Input, Spinner, Stack, Text } from "@chakra-ui/react";
import { LuInfo, LuUpload } from "react-icons/lu";
import { useParams } from "react-router";

import { Tooltip } from "../../tooltip";
import { useServices } from "../../../services/Services";
import { ParameterWidgetProps } from "./types";
import { DEFAULT_TIMESPAN } from "./constants";

const selectStyle: React.CSSProperties = {
    border: "1px solid #CBD5E0",
    borderRadius: "6px",
    padding: "8px 12px",
    minWidth: "150px",
    fontSize: "14px",
};

/**
 * The file arguments of the disturbance-index tool. The user uploads each one;
 * the path the upload returns becomes the param of the same name, matching the
 * tool's command-line flags.
 */
const FILE_FIELDS = [
    {
        param: "breaks_raster",
        label: "Breaks raster",
        accept: ".tif,.tiff",
        help: "Dummy help: the breaks raster the index is computed from (GeoTIFF).",
    },
    {
        param: "built_raster",
        label: "Built areas raster",
        accept: ".tif,.tiff",
        help: "Dummy help: raster of built-up areas, used to separate construction from other disturbance (GeoTIFF).",
    },
    {
        param: "fires_points",
        label: "Fire points",
        accept: ".geojson,.json",
        help: "Dummy help: FIRMS fire detections, used to attribute disturbance to fires (GeoJSON).",
    },
    {
        param: "zones_polys",
        label: "Zones",
        accept: ".geojson,.json",
        help: "Dummy help: polygons the index is aggregated over (GeoJSON).",
    },
] as const;

/**
 * The numeric tuning arguments of the tool. Not restricted to a range — the
 * backend decides what is sensible — so they are only checked for being numbers.
 */
const NUMBER_FIELDS = [
    {
        param: "mmu_area",
        label: "Minimum mapping unit (m²)",
        default: "5000.0",
        help: "Dummy help: disturbance patches smaller than this area are discarded.",
    },
    {
        param: "majority_filter_size",
        label: "Majority filter size (px)",
        default: "7",
        help: "Dummy help: window size of the majority filter smoothing the classified raster.",
    },
    {
        param: "connectivity",
        label: "Connectivity",
        default: "8",
        help: "Dummy help: pixel neighbourhood used when grouping pixels into patches (4 or 8).",
    },
    {
        param: "cap_percentile",
        label: "Cap percentile",
        default: "99.0",
        help: "Dummy help: percentile the index values are capped at, to keep outliers from dominating.",
    },
    {
        param: "magnitude_threshold",
        label: "Magnitude threshold",
        default: "-200.0",
        help: "Dummy help: change magnitude a pixel must reach to count as disturbed (negative for a drop).",
    },
] as const;

const DEFAULT_NUMBERS: Record<string, string> = Object.fromEntries(
    NUMBER_FIELDS.map((field) => [field.param, field.default])
);

/** Comma-separated weights, sent to the backend as the string the tool expects. */
const DEFAULT_WEIGHTS = "0.3,0.7,0.9";

/** An uploaded file: its name for display, and the path the backend returned. */
interface Upload {
    name: string;
    /** Path on the processing backend. Undefined while uploading or on failure. */
    path?: string;
    uploading: boolean;
    error?: string;
}

/** Whether `value` is a comma-separated list of numbers, e.g. "0.3,0.7,0.9". */
function areWeightsValid(value: string): boolean {
    const parts = value.split(",");
    return parts.length > 1 && parts.every((p) => p.trim() !== "" && !isNaN(Number(p)));
}

/** A field label with an info icon that reveals help text on hover. */
function LabelWithHelp({ label, help }: { label: React.ReactNode; help: string }) {
    return (
        <Field.Label>
            {label}
            <Tooltip content={help} showArrow>
                <Icon as={LuInfo} ml="1" color="gray.500" cursor="help" boxSize="3.5" />
            </Tooltip>
        </Field.Label>
    );
}

/**
 * Parameters for the VDO Disturbance Index. It runs on the output of a previous
 * Breaks time series — picked from the available ones the same way the
 * reference area is in {@link ReferenceAreaWidget} — plus the rasters and
 * vector layers the tool needs, which are uploaded here.
 */
export function VdoDisturbanceIndexParametersWidget({ process, onChange }: ParameterWidgetProps) {
    // The scenario the wizard runs in; uploads are scoped to it. Read from the
    // route like the create dialog itself does.
    const { id: scenarioId } = useParams();
    const { uploadFile } = useServices();

    const breaksOptions = process.parameters.preprocess?.breaks ?? [];
    const [breaksId, setBreaksId] = useState<number | undefined>();
    const [uploads, setUploads] = useState<Record<string, Upload>>({});
    // Numbers are kept as strings so a half-typed value ("-", "0.") does not
    // fight the input; they are parsed on the way out.
    const [numbers, setNumbers] = useState<Record<string, string>>(DEFAULT_NUMBERS);
    const [weights, setWeights] = useState(DEFAULT_WEIGHTS);

    const filesComplete = FILE_FIELDS.every((field) => uploads[field.param]?.path);
    const numbersValid = NUMBER_FIELDS.every((field) => !isNaN(Number(numbers[field.param])));
    const weightsValid = areWeightsValid(weights);

    /**
     * Uploads the picked file right away, so a rejected or unreachable upload
     * surfaces here instead of in a job an hour later. Called with no file when
     * the user removes one again.
     */
    const handleFile = async (param: string, file: File | undefined) => {
        if (!file) {
            setUploads((prev) => {
                const next = { ...prev };
                delete next[param];
                return next;
            });
            return;
        }
        if (!scenarioId) {
            setUploads((prev) => ({
                ...prev,
                [param]: { name: file.name, uploading: false, error: "No scenario to upload to." },
            }));
            return;
        }

        setUploads((prev) => ({ ...prev, [param]: { name: file.name, uploading: true } }));
        try {
            const path = await uploadFile(scenarioId, file);
            setUploads((prev) => ({ ...prev, [param]: { name: file.name, path, uploading: false } }));
        } catch (e) {
            console.error("Could not upload " + file.name, e);
            setUploads((prev) => ({
                ...prev,
                [param]: {
                    name: file.name,
                    uploading: false,
                    error: e instanceof Error ? e.message : "Upload failed.",
                },
            }));
        }
    };

    // No time-range UI: the index covers the period of the Breaks series it runs
    // on, so it reports the same default range that series does (DEFAULT_TIMESPAN).
    useEffect(() => {
        onChange({
            params: {
                breaks_id: breaksId,
                ...Object.fromEntries(
                    FILE_FIELDS.map((field) => [field.param, uploads[field.param]?.path])
                ),
                ...Object.fromEntries(
                    NUMBER_FIELDS.map((field) => {
                        const value = Number(numbers[field.param]);
                        return [field.param, isNaN(value) ? undefined : value];
                    })
                ),
                weights: weightsValid ? weights.split(",").map((p) => p.trim()).join(",") : undefined,
                expandable: false,
            },
            valid: breaksId != null && filesComplete && numbersValid && weightsValid,
            timespan: DEFAULT_TIMESPAN,
        });
    }, [
        breaksId, uploads, filesComplete, numbers, numbersValid,
        weights, weightsValid, onChange,
    ]);

    return (
        <Stack pt="4" gap="5" maxW="lg">
            {/* Intro help text */}
            <Box bg="gray.50" borderWidth="1px" borderColor="gray.200" borderRadius="md" p="3">
                <Text fontSize="sm" color="gray.600">
                    The disturbance index is computed from an existing Breaks time series and a
                    set of auxiliary layers. Pick the Breaks series, upload the layers, and tune
                    the detection parameters below. Hover over the info icon next to each field
                    for details.
                </Text>
            </Box>

            <Field.Root required>
                <LabelWithHelp
                    label={<>Breaks Reference Series <Field.RequiredIndicator /></>}
                    help="Dummy help: the previously computed Breaks time series the disturbance index is derived from."
                />
                <select
                    value={breaksId ?? ""}
                    style={selectStyle}
                    onChange={(e) => {
                        const id = parseInt(e.target.value);
                        setBreaksId(isNaN(id) ? undefined : id);
                    }}
                >
                    <option value="" disabled>Select a Breaks series</option>
                    {breaksOptions.map((o) => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                </select>
            </Field.Root>

            {/* Input files. Each is uploaded on pick; the returned path is the param. */}
            <Stack gap="4">
                {FILE_FIELDS.map((field) => {
                    const upload = uploads[field.param];
                    return (
                        <Field.Root key={field.param} required invalid={upload?.error != null}>
                            <LabelWithHelp
                                label={<>{field.label} <Field.RequiredIndicator /></>}
                                help={field.help}
                            />
                            <FileUpload.Root
                                accept={field.accept}
                                maxFiles={1}
                                onFileChange={(details) =>
                                    handleFile(field.param, details.acceptedFiles[0])
                                }
                            >
                                <FileUpload.HiddenInput />
                                <HStack gap="3">
                                    <FileUpload.Trigger asChild>
                                        <Button
                                            size="xs"
                                            variant="outline"
                                            color="black"
                                            border="1px solid #2C7D75"
                                            _hover={{ bg: "teal.50" }}>
                                            <Icon as={LuUpload} /> Choose file
                                        </Button>
                                    </FileUpload.Trigger>
                                    {upload?.uploading &&
                                        <HStack gap="2">
                                            <Spinner size="xs" />
                                            <Text fontSize="xs" color="fg.muted">
                                                Uploading {upload.name}…
                                            </Text>
                                        </HStack>
                                    }
                                    {upload?.path &&
                                        <Text fontSize="xs" color="fg.muted" truncate>
                                            {upload.name}
                                        </Text>
                                    }
                                </HStack>
                            </FileUpload.Root>
                            <Field.ErrorText>{upload?.error}</Field.ErrorText>
                            {!upload &&
                                <Field.HelperText fontSize="xs">
                                    Accepts {field.accept.replace(/,/g, ", ")}
                                </Field.HelperText>
                            }
                        </Field.Root>
                    );
                })}
            </Stack>

            {/* Numeric tuning parameters */}
            <Flex gap="4" wrap="wrap" align="flex-start">
                {NUMBER_FIELDS.map((field) => {
                    const invalid = isNaN(Number(numbers[field.param]));
                    return (
                        <Field.Root key={field.param} maxW="200px" required invalid={invalid}>
                            <LabelWithHelp
                                label={<>{field.label} <Field.RequiredIndicator /></>}
                                help={field.help}
                            />
                            <Input
                                type="number"
                                value={numbers[field.param] ?? ""} step="any"
                                css={{ "--focus-color": "#2C7D75" }}
                                onChange={(e) =>
                                    setNumbers((prev) => ({ ...prev, [field.param]: e.target.value }))
                                }
                            />
                            <Field.ErrorText>Enter a number</Field.ErrorText>
                        </Field.Root>
                    );
                })}
            </Flex>

            <Field.Root maxW="240px" required invalid={!weightsValid}>
                <LabelWithHelp
                    label={<>Weights <Field.RequiredIndicator /></>}
                    help="Dummy help: comma-separated weights of the index components, e.g. 0.3,0.7,0.9."
                />
                <Input
                    value={weights}
                    placeholder={DEFAULT_WEIGHTS}
                    css={{ "--focus-color": "#2C7D75" }}
                    onChange={(e) => setWeights(e.target.value)}
                />
                <Field.ErrorText>Enter comma-separated numbers</Field.ErrorText>
            </Field.Root>
        </Stack>
    );
}
