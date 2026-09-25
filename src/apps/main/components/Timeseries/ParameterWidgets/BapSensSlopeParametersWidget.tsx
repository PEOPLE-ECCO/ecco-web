// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import { Box, Input, Flex, Field, Stack, HStack, Switch, Text, Icon } from "@chakra-ui/react";
import { LuInfo } from "react-icons/lu";

import { Tooltip } from "../../tooltip";
import { ParameterWidgetProps, SerializedParams } from "./types";

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

const MONTHS = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
];

type CompositingMode = "yearly" | "monthly";

interface BapSensSlopeParams {
    compositingMode: CompositingMode;
    yearFrom: number;
    yearTo: number;
    monthFrom: number;
    monthTo: number;
    includeReflectanceBands: boolean;
    maxCloudCover: number;
    distanceToCloudPixels: number;
    cloudBufferPixels: number;
    distanceToCloudWeight: number;
    dateWeight: number;
    coverageWeight: number;
}

// Derive the first job's timespan from the selected years/months: the first day
// of the earliest month through the last day of the latest month. The job runs
// over this range while the years/months params drive the actual compositing.
function deriveTimespan(p: BapSensSlopeParams): { start: Date; end: Date } {
    const start = new Date(p.yearFrom, p.monthFrom - 1, 1);
    // Day 0 of the month after monthTo is the last day of monthTo.
    const end = new Date(p.yearTo, p.monthTo, 0);
    return { start, end };
}

function serialize(p: BapSensSlopeParams): SerializedParams {
    return {
        compositing_mode: p.compositingMode,
        years: Array.from({ length: p.yearTo - p.yearFrom + 1 }, (_, i) => p.yearFrom + i),
        months: Array.from({ length: p.monthTo - p.monthFrom + 1 }, (_, i) => p.monthFrom + i),
        include_reflectance_bands: p.includeReflectanceBands,
        max_cloud_cover: p.maxCloudCover,
        dtc_max_distance: p.distanceToCloudPixels,
        cloud_buffer_px: p.cloudBufferPixels,
        score_weight_dtc: p.distanceToCloudWeight,
        export_profile: "seasonal_sen",
        score_weight_date: p.dateWeight,
        score_weight_coverage: p.coverageWeight,
    };
}

const DEFAULT_PARAMS: BapSensSlopeParams = {
    compositingMode: "yearly",
    yearFrom: 2020,
    yearTo: 2022,
    monthFrom: 1,
    monthTo: 12,
    includeReflectanceBands: false,
    maxCloudCover: 30,
    distanceToCloudPixels: 30,
    cloudBufferPixels: 2,
    distanceToCloudWeight: 1.0,
    dateWeight: 0.8,
    coverageWeight: 0.0,
};

const selectStyle: React.CSSProperties = {
    border: "1px solid #CBD5E0",
    borderRadius: "6px",
    padding: "8px 12px",
    minWidth: "150px",
    fontSize: "14px",
};

export function BapSensSlopeParametersWidget({ onChange }: ParameterWidgetProps) {
    const [params, setParams] = useState<BapSensSlopeParams>(DEFAULT_PARAMS);

    // Report serialized params to the parent whenever they change. Defaults are
    // always valid, so this widget is valid from the start.
    useEffect(() => {
        onChange({ params: serialize(params), valid: true, timespan: deriveTimespan(params) });
    }, [params, onChange]);

    const set = (partial: Partial<BapSensSlopeParams>) =>
        setParams((prev) => ({ ...prev, ...partial }));

    return (
        <Stack pt="4" gap="5" maxW="lg">
            {/* Intro help text */}
            <Box bg="gray.50" borderWidth="1px" borderColor="gray.200" borderRadius="md" p="3">
                <Text fontSize="sm" color="gray.600">
                    Configure the parameters below to control how the best-available-pixel composite is computed. Hover over the info icon next to each field for details.
                </Text>
            </Box>

            {/* Compositing mode */}
            <Field.Root>
                <LabelWithHelp label="Compositing mode" help="Whether one composite is produced per year, or one per month within each selected year." />
                <Field.HelperText mb="1">
                    Pick the mode that suits the analysis this composite feeds into:<br/>
                    <strong>VPT - Sen&apos;s slope</strong> works with <strong>monthly</strong> series<br/>
                    <strong>VPT - Spectral Recovery</strong> works with <strong>yearly</strong> series
                </Field.HelperText>
                <select
                    value={params.compositingMode}
                    style={selectStyle}
                    onChange={(e) => set({ compositingMode: e.target.value as CompositingMode })}
                >
                    <option value="yearly">Yearly</option>
                    <option value="monthly">Monthly</option>
                </select>
            </Field.Root>

            {/* Year range. Needed in both modes: monthly compositing produces one
                composite per selected month within each of these years. */}
            <HStack gap="4" align="flex-end">
                <Field.Root>
                    <LabelWithHelp label="Year from" help="First year of the analysis period (inclusive)." />
                    <Input
                        type="number" w="120px"
                        value={params.yearFrom} min={2000} max={params.yearTo}
                        css={{ "--focus-color": "#2C7D75" }}
                        onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v)) set({ yearFrom: v }); }}
                    />
                </Field.Root>
                <Field.Root>
                    <LabelWithHelp label="Year to" help="Last year of the analysis period (inclusive)." />
                    <Input
                        type="number" w="120px"
                        value={params.yearTo} min={params.yearFrom} max={2030}
                        css={{ "--focus-color": "#2C7D75" }}
                        onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v)) set({ yearTo: v }); }}
                    />
                </Field.Root>
            </HStack>

            {/* Month range */}
            {params.compositingMode === "monthly" && (
                <HStack gap="4" align="flex-end">
                    <Field.Root>
                        <LabelWithHelp label="Month from" help="First month of the year included in the composite." />
                        <select
                            value={params.monthFrom}
                            style={selectStyle}
                            onChange={(e) => {
                                const v = parseInt(e.target.value);
                                set({ monthFrom: v, monthTo: Math.max(params.monthTo, v) });
                            }}
                        >
                            {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                    </Field.Root>
                    <Field.Root>
                        <LabelWithHelp label="Month to" help="Last month of the year included in the composite." />
                        <select
                            value={params.monthTo}
                            style={selectStyle}
                            onChange={(e) => set({ monthTo: parseInt(e.target.value) })}
                        >
                            {MONTHS.filter((m) => m.value >= params.monthFrom).map((m) => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </Field.Root>
                </HStack>
            )}

            {/* Boolean */}
            <Switch.Root
                colorPalette="teal"
                checked={params.includeReflectanceBands}
                onCheckedChange={(e) => set({ includeReflectanceBands: e.checked })}
            >
                <Switch.HiddenInput />
                <Switch.Control>
                    <Switch.Thumb />
                </Switch.Control>
                <Switch.Label>
                    Include reflectance bands
                    <Tooltip content="Also export the original Sentinel-2 reflectance bands alongside the computed spectral indices." showArrow>
                        <Icon as={LuInfo} ml="1" color="gray.500" cursor="help" boxSize="3.5" />
                    </Tooltip>
                </Switch.Label>
            </Switch.Root>

            {/* Integers */}
            <Flex gap="4" wrap="wrap" align="flex-end">
                <Field.Root maxW="160px">
                    <LabelWithHelp label="Max cloud cover (%)" help="Scenes whose overall cloud cover exceeds this percentage are not considered at all." />
                    <Input
                        type="number"
                        value={params.maxCloudCover} min={0} max={100}
                        css={{ "--focus-color": "#2C7D75" }}
                        onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v)) set({ maxCloudCover: Math.min(100, Math.max(0, v)) }); }}
                    />
                </Field.Root>
                <Field.Root maxW="170px">
                    <LabelWithHelp label="Distance to cloud (px)" help="How far from the nearest cloud, in pixels, proximity still counts against a pixel. Beyond this distance the distance-to-cloud score stops penalising it." />
                    <Input
                        type="number"
                        value={params.distanceToCloudPixels} min={0}
                        css={{ "--focus-color": "#2C7D75" }}
                        onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v)) set({ distanceToCloudPixels: v }); }}
                    />
                </Field.Root>
                <Field.Root maxW="160px">
                    <LabelWithHelp label="Cloud buffer (px)" help="Pixels to grow the detected cloud mask by, so pixels just outside a cloud are masked as well." />
                    <Input
                        type="number"
                        value={params.cloudBufferPixels} min={0}
                        css={{ "--focus-color": "#2C7D75" }}
                        onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v)) set({ cloudBufferPixels: v }); }}
                    />
                </Field.Root>
            </Flex>

            {/* Floats 0–1 */}
            <Flex gap="4" wrap="wrap" align="flex-end">
                <Field.Root maxW="175px">
                    <LabelWithHelp label="Distance-to-cloud weight" help="How much a pixel's distance from the nearest cloud counts when ranking candidate pixels. The three weights are relative to one another and need not add up to 1." />
                    <Input
                        type="number"
                        value={params.distanceToCloudWeight} min={0} max={1} step={0.1}
                        css={{ "--focus-color": "#2C7D75" }}
                        onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) set({ distanceToCloudWeight: Math.min(1, Math.max(0, v)) }); }}
                    />
                </Field.Root>
                <Field.Root maxW="175px">
                    <LabelWithHelp label="Date weight" help="How much a pixel's closeness to the target date counts when ranking candidate pixels. The three weights are relative to one another and need not add up to 1." />
                    <Input
                        type="number"
                        value={params.dateWeight} min={0} max={1} step={0.1}
                        css={{ "--focus-color": "#2C7D75" }}
                        onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) set({ dateWeight: Math.min(1, Math.max(0, v)) }); }}
                    />
                </Field.Root>
                <Field.Root maxW="175px">
                    <LabelWithHelp label="Coverage weight" help="How much the scene's overall cloud-free coverage counts when ranking candidate pixels. The three weights are relative to one another and need not add up to 1." />
                    <Input
                        type="number"
                        value={params.coverageWeight} min={0} max={1} step={0.1}
                        css={{ "--focus-color": "#2C7D75" }}
                        onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) set({ coverageWeight: Math.min(1, Math.max(0, v)) }); }}
                    />
                </Field.Root>
            </Flex>
        </Stack>
    );
}
