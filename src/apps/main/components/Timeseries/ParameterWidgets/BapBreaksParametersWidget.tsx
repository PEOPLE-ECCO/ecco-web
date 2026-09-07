// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import { Box, Input, Flex, Field, Stack, HStack, Text, Icon } from "@chakra-ui/react";
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

/** Sentinel-2 native resolutions; the backend cannot serve arbitrary values. */
const SPATIAL_RESOLUTIONS = [10, 20, 60];

interface BreaksParams {
    yearFrom: number;
    yearTo: number;
    seasonStartMonth: number;
    seasonStartDay: number;
    seasonEndMonth: number;
    seasonEndDay: number;
    maxCloudCover: number;
    spatialResolution: number;
    distanceToCloudPixels: number;
    cloudBufferPixels: number;
    distanceToCloudWeight: number;
    dateWeight: number;
    coverageWeight: number;
}

const DEFAULT_PARAMS: BreaksParams = {
    yearFrom: 2020,
    yearTo: 2023,
    seasonStartMonth: 9,
    seasonStartDay: 1,
    seasonEndMonth: 11,
    seasonEndDay: 30,
    maxCloudCover: 20,
    spatialResolution: 10,
    distanceToCloudPixels: 30,
    cloudBufferPixels: 2,
    distanceToCloudWeight: 1.0,
    dateWeight: 0.8,
    coverageWeight: 0.5,
};

const selectStyle: React.CSSProperties = {
    border: "1px solid #CBD5E0",
    borderRadius: "6px",
    padding: "8px 12px",
    minWidth: "150px",
    fontSize: "14px",
};

/** Days in `month` (1-based) in a non-leap year; Feb is capped at 28 so that a
 * season window stays valid in every year of the analysis period. */
function daysInMonth(month: number): number {
    return new Date(2001, month, 0).getDate();
}

/** Whether the season window wraps across the turn of the year (e.g. 12-01 → 02-28). */
function wrapsYear(p: BreaksParams): boolean {
    return (
        p.seasonEndMonth < p.seasonStartMonth ||
        (p.seasonEndMonth === p.seasonStartMonth && p.seasonEndDay < p.seasonStartDay)
    );
}

/**
 * The months the season window spans, in season order. Sent alongside the
 * window itself, so it is derived here rather than asked for separately — the
 * two can never disagree.
 */
function seasonMonths(p: BreaksParams): number[] {
    const span = wrapsYear(p)
        ? 12 - p.seasonStartMonth + p.seasonEndMonth + 1
        : p.seasonEndMonth - p.seasonStartMonth + 1;
    return Array.from({ length: span }, (_, i) => ((p.seasonStartMonth - 1 + i) % 12) + 1);
}

/** "MM-DD", year-agnostic. */
function formatMonthDay(month: number, day: number): string {
    return `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Derive the first job's timespan from the selected years and season window: the
// season start in the earliest year through the season end in the latest year. A
// window that wraps the turn of the year ends in the year after yearTo.
function deriveTimespan(p: BreaksParams): { start: Date; end: Date } {
    const start = new Date(p.yearFrom, p.seasonStartMonth - 1, p.seasonStartDay);
    const endYear = wrapsYear(p) ? p.yearTo + 1 : p.yearTo;
    const end = new Date(endYear, p.seasonEndMonth - 1, p.seasonEndDay);
    return { start, end };
}

function serialize(p: BreaksParams): SerializedParams {
    return {
        years: Array.from({ length: p.yearTo - p.yearFrom + 1 }, (_, i) => p.yearFrom + i),
        season_start: formatMonthDay(p.seasonStartMonth, p.seasonStartDay),
        season_end: formatMonthDay(p.seasonEndMonth, p.seasonEndDay),
        months: seasonMonths(p),
        max_cloud_cover: p.maxCloudCover,
        spatial_resolution: p.spatialResolution,
        dtc_max_distance: p.distanceToCloudPixels,
        cloud_buffer_px: p.cloudBufferPixels,
        score_weight_dtc: p.distanceToCloudWeight,
        score_weight_date: p.dateWeight,
        score_weight_coverage: p.coverageWeight,
    };
}

export function BapBreaksParametersWidget({ onChange }: ParameterWidgetProps) {
    const [params, setParams] = useState<BreaksParams>(DEFAULT_PARAMS);

    // Report serialized params to the parent whenever they change. Every control
    // is constrained to a valid value, so this widget is valid from the start.
    useEffect(() => {
        onChange({ params: serialize(params), valid: true, timespan: deriveTimespan(params) });
    }, [params, onChange]);

    const set = (partial: Partial<BreaksParams>) =>
        setParams((prev) => ({ ...prev, ...partial }));

    // Changing the month can leave the day out of range (e.g. 31 → February).
    const setSeasonStartMonth = (month: number) =>
        set({ seasonStartMonth: month, seasonStartDay: Math.min(params.seasonStartDay, daysInMonth(month)) });
    const setSeasonEndMonth = (month: number) =>
        set({ seasonEndMonth: month, seasonEndDay: Math.min(params.seasonEndDay, daysInMonth(month)) });

    const monthNames = seasonMonths(params)
        .map((m) => MONTHS.find((entry) => entry.value === m)?.label ?? String(m))
        .join(", ");

    return (
        <Stack pt="4" gap="5" maxW="lg">
            {/* Intro help text */}
            <Box bg="gray.50" borderWidth="1px" borderColor="gray.200" borderRadius="md" p="3">
                <Text fontSize="sm" color="gray.600">
                    Configure the parameters below to control how breaks are detected. The
                    season window is applied within each of the selected years. Hover over the
                    info icon next to each field for details.
                </Text>
            </Box>

            {/* Year range */}
            <HStack gap="4" align="flex-end">
                <Field.Root>
                    <LabelWithHelp label="Year from" help="Dummy help: first year (inclusive) of the analysis period." />
                    <Input
                        type="number" w="120px"
                        value={params.yearFrom} min={2000} max={params.yearTo}
                        css={{ "--focus-color": "#2C7D75" }}
                        onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v)) set({ yearFrom: v }); }}
                    />
                </Field.Root>
                <Field.Root>
                    <LabelWithHelp label="Year to" help="Dummy help: last year (inclusive) of the analysis period." />
                    <Input
                        type="number" w="120px"
                        value={params.yearTo} min={params.yearFrom} max={2030}
                        css={{ "--focus-color": "#2C7D75" }}
                        onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v)) set({ yearTo: v }); }}
                    />
                </Field.Root>
            </HStack>

            {/* Season window (month + day, year-agnostic) */}
            <Stack gap="2">
                <HStack gap="4" align="flex-end" wrap="wrap">
                    <Field.Root maxW="180px">
                        <LabelWithHelp label="Season start" help="Dummy help: first day of the season window, applied within every selected year." />
                        <select
                            value={params.seasonStartMonth}
                            style={selectStyle}
                            onChange={(e) => setSeasonStartMonth(parseInt(e.target.value))}
                        >
                            {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                    </Field.Root>
                    <Field.Root maxW="90px">
                        <Field.Label>Day</Field.Label>
                        <Input
                            type="number"
                            value={params.seasonStartDay} min={1} max={daysInMonth(params.seasonStartMonth)}
                            css={{ "--focus-color": "#2C7D75" }}
                            onChange={(e) => {
                                const v = parseInt(e.target.value);
                                if (!isNaN(v)) {
                                    set({ seasonStartDay: Math.min(daysInMonth(params.seasonStartMonth), Math.max(1, v)) });
                                }
                            }}
                        />
                    </Field.Root>
                </HStack>
                <HStack gap="4" align="flex-end" wrap="wrap">
                    <Field.Root maxW="180px">
                        <LabelWithHelp label="Season end" help="Dummy help: last day of the season window. A window that ends before it starts wraps across the turn of the year." />
                        <select
                            value={params.seasonEndMonth}
                            style={selectStyle}
                            onChange={(e) => setSeasonEndMonth(parseInt(e.target.value))}
                        >
                            {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                    </Field.Root>
                    <Field.Root maxW="90px">
                        <Field.Label>Day</Field.Label>
                        <Input
                            type="number"
                            value={params.seasonEndDay} min={1} max={daysInMonth(params.seasonEndMonth)}
                            css={{ "--focus-color": "#2C7D75" }}
                            onChange={(e) => {
                                const v = parseInt(e.target.value);
                                if (!isNaN(v)) {
                                    set({ seasonEndDay: Math.min(daysInMonth(params.seasonEndMonth), Math.max(1, v)) });
                                }
                            }}
                        />
                    </Field.Root>
                </HStack>
                {/* The months spanned by the window are sent to the backend, so show
                    which ones the current window resolves to. */}
                <Text fontSize="sm" color="gray.600">
                    Months included: {monthNames}
                </Text>
            </Stack>

            {/* Integers */}
            <Flex gap="4" wrap="wrap" align="flex-end">
                <Field.Root maxW="160px">
                    <LabelWithHelp label="Max cloud cover (%)" help="Dummy help: scenes above this cloud cover percentage are discarded." />
                    <Input
                        type="number"
                        value={params.maxCloudCover} min={0} max={100}
                        css={{ "--focus-color": "#2C7D75" }}
                        onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v)) set({ maxCloudCover: Math.min(100, Math.max(0, v)) }); }}
                    />
                </Field.Root>
                <Field.Root maxW="180px">
                    <LabelWithHelp label="Spatial resolution (m)" help="Dummy help: output pixel size. Limited to the Sentinel-2 native resolutions." />
                    <select
                        value={params.spatialResolution}
                        style={selectStyle}
                        onChange={(e) => set({ spatialResolution: parseInt(e.target.value) })}
                    >
                        {SPATIAL_RESOLUTIONS.map((r) => <option key={r} value={r}>{r} m</option>)}
                    </select>
                </Field.Root>
            </Flex>
            <Flex gap="4" wrap="wrap" align="flex-end">
                <Field.Root maxW="170px">
                    <LabelWithHelp label="Distance to cloud (px)" help="Dummy help: maximum distance in pixels from a cloud for a pixel to be penalized." />
                    <Input
                        type="number"
                        value={params.distanceToCloudPixels} min={0}
                        css={{ "--focus-color": "#2C7D75" }}
                        onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v)) set({ distanceToCloudPixels: Math.max(0, v) }); }}
                    />
                </Field.Root>
                <Field.Root maxW="160px">
                    <LabelWithHelp label="Cloud buffer (px)" help="Dummy help: number of pixels to dilate the cloud mask by." />
                    <Input
                        type="number"
                        value={params.cloudBufferPixels} min={0}
                        css={{ "--focus-color": "#2C7D75" }}
                        onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v)) set({ cloudBufferPixels: Math.max(0, v) }); }}
                    />
                </Field.Root>
            </Flex>

            {/* Floats 0–1 */}
            <Flex gap="4" wrap="wrap" align="flex-end">
                <Field.Root maxW="175px">
                    <LabelWithHelp label="Distance-to-cloud weight" help="Dummy help: weight (0–1) given to distance-from-cloud when scoring pixels." />
                    <Input
                        type="number"
                        value={params.distanceToCloudWeight} min={0} max={1} step={0.1}
                        css={{ "--focus-color": "#2C7D75" }}
                        onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) set({ distanceToCloudWeight: Math.min(1, Math.max(0, v)) }); }}
                    />
                </Field.Root>
                <Field.Root maxW="175px">
                    <LabelWithHelp label="Date weight" help="Dummy help: weight (0–1) given to proximity to the target date when scoring pixels." />
                    <Input
                        type="number"
                        value={params.dateWeight} min={0} max={1} step={0.1}
                        css={{ "--focus-color": "#2C7D75" }}
                        onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) set({ dateWeight: Math.min(1, Math.max(0, v)) }); }}
                    />
                </Field.Root>
                <Field.Root maxW="175px">
                    <LabelWithHelp label="Coverage weight" help="Dummy help: weight (0–1) given to overall scene coverage when scoring pixels." />
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
