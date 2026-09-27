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

/**
 * The analysis the composite feeds into. Each maps to a BAP export profile,
 * which fixes the compositing mode and payload on the backend:
 * - sens_slope → `seasonal_sen`: monthly index composites
 * - spectral_recovery → `spectral_recovery`: yearly reflectance composites
 */
type TargetAnalysis = "sens_slope" | "spectral_recovery";

interface BapVptParams {
    targetAnalysis: TargetAnalysis;
    yearFrom: number;
    yearTo: number;
    // Sen's slope: months composited within each year
    monthFrom: number;
    monthTo: number;
    includeReflectanceBands: boolean;
    // Spectral Recovery: season window composited within each year
    seasonStartMonth: number;
    seasonStartDay: number;
    seasonEndMonth: number;
    seasonEndDay: number;
    maxCloudCover: number;
    distanceToCloudPixels: number;
    cloudBufferPixels: number;
    distanceToCloudWeight: number;
    dateWeight: number;
    coverageWeight: number;
}

/** Days in `month` (1-based) in a non-leap year; Feb is capped at 28 so that a
 * season window stays valid in every year of the analysis period. */
function daysInMonth(month: number): number {
    return new Date(2001, month, 0).getDate();
}

/** "MM-DD", year-agnostic. */
function formatMonthDay(month: number, day: number): string {
    return `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Sentinel-2 data is only available from 2015 onwards.
const MIN_YEAR = 2015;
const MAX_YEAR = 2030;

/**
 * Spectral Recovery needs a baseline year, the year restoration starts and at
 * least one year after it (see `_apply_platform_parameters` in
 * ecco-terrestrial-solutions' spectral-recovery).
 */
const MIN_SPECTRAL_RECOVERY_YEARS = 3;

/** Why the year range cannot be submitted, or undefined if it can. */
function yearRangeError(p: BapVptParams): string | undefined {
    if (p.yearFrom < MIN_YEAR || p.yearTo > MAX_YEAR) {
        return `Years must lie between ${MIN_YEAR} and ${MAX_YEAR}.`;
    }
    if (p.yearFrom > p.yearTo) {
        return "“Year from” must not be after “Year to”.";
    }
    if (
        p.targetAnalysis === "spectral_recovery" &&
        p.yearTo - p.yearFrom + 1 < MIN_SPECTRAL_RECOVERY_YEARS
    ) {
        return `Spectral Recovery needs at least ${MIN_SPECTRAL_RECOVERY_YEARS} years: a baseline year, the year restoration starts, and at least one year after it.`;
    }
    return undefined;
}

/**
 * Whether the season window ends before it starts. BAP builds each yearly window
 * as `[year-start, year-end]`, so a window that wraps the turn of the year is
 * not supported.
 */
function seasonEndsBeforeStart(p: BapVptParams): boolean {
    return (
        p.seasonEndMonth < p.seasonStartMonth ||
        (p.seasonEndMonth === p.seasonStartMonth && p.seasonEndDay < p.seasonStartDay)
    );
}

// Derive the first job's timespan from the selected years and months (or season
// window): its start in the earliest year through its end in the latest year.
// The job runs over this range while the params drive the actual compositing.
function deriveTimespan(p: BapVptParams): { start: Date; end: Date } {
    if (p.targetAnalysis === "spectral_recovery") {
        const start = new Date(p.yearFrom, p.seasonStartMonth - 1, p.seasonStartDay);
        const end = new Date(p.yearTo, p.seasonEndMonth - 1, p.seasonEndDay);
        return { start, end };
    }
    const start = new Date(p.yearFrom, p.monthFrom - 1, 1);
    // Day 0 of the month after monthTo is the last day of monthTo.
    const end = new Date(p.yearTo, p.monthTo, 0);
    return { start, end };
}

function serialize(p: BapVptParams): SerializedParams {
    const common = {
        years: Array.from({ length: p.yearTo - p.yearFrom + 1 }, (_, i) => p.yearFrom + i),
        max_cloud_cover: p.maxCloudCover,
        dtc_max_distance: p.distanceToCloudPixels,
        cloud_buffer_px: p.cloudBufferPixels,
        score_weight_dtc: p.distanceToCloudWeight,
        score_weight_date: p.dateWeight,
        score_weight_coverage: p.coverageWeight,
    };
    if (p.targetAnalysis === "spectral_recovery") {
        return {
            ...common,
            compositing_mode: "yearly",
            season_start: formatMonthDay(p.seasonStartMonth, p.seasonStartDay),
            season_end: formatMonthDay(p.seasonEndMonth, p.seasonEndDay),
            export_profile: "spectral_recovery",
            export_payload: "reflectance",
        };
    }
    return {
        ...common,
        compositing_mode: "monthly",
        months: Array.from({ length: p.monthTo - p.monthFrom + 1 }, (_, i) => p.monthFrom + i),
        include_reflectance_bands: p.includeReflectanceBands,
        export_profile: "seasonal_sen",
    };
}

const DEFAULT_PARAMS: BapVptParams = {
    targetAnalysis: "sens_slope",
    yearFrom: 2020,
    yearTo: 2022,
    monthFrom: 1,
    monthTo: 12,
    includeReflectanceBands: false,
    seasonStartMonth: 4,
    seasonStartDay: 1,
    seasonEndMonth: 6,
    seasonEndDay: 30,
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

export function BapVptParametersWidget({ onChange }: ParameterWidgetProps) {
    const [params, setParams] = useState<BapVptParams>(DEFAULT_PARAMS);

    const isSpectralRecovery = params.targetAnalysis === "spectral_recovery";
    const yearError = yearRangeError(params);
    const seasonError = isSpectralRecovery && seasonEndsBeforeStart(params);

    // Report serialized params to the parent whenever they change. Values are
    // not clamped against each other while typing; an inconsistent combination
    // is flagged in the UI and reported as invalid instead.
    useEffect(() => {
        onChange({
            params: serialize(params),
            valid: yearError == null && !seasonError,
            timespan: deriveTimespan(params),
        });
    }, [params, yearError, seasonError, onChange]);

    const set = (partial: Partial<BapVptParams>) =>
        setParams((prev) => ({ ...prev, ...partial }));

    // Season edits keep the day within its month (e.g. 31 → February).
    const setSeason = (partial: Partial<BapVptParams>) =>
        setParams((prev) => {
            const next = { ...prev, ...partial };
            next.seasonStartDay = Math.min(next.seasonStartDay, daysInMonth(next.seasonStartMonth));
            next.seasonEndDay = Math.min(next.seasonEndDay, daysInMonth(next.seasonEndMonth));
            return next;
        });

    return (
        <Stack pt="4" gap="5" maxW="lg">
            {/* Intro help text */}
            <Box bg="gray.50" borderWidth="1px" borderColor="gray.200" borderRadius="md" p="3">
                <Text fontSize="sm" color="gray.600">
                    Configure the parameters below to control how the best-available-pixel composite is computed. Hover over the info icon next to each field for details.
                </Text>
            </Box>

            {/* Target analysis (drives the BAP export profile) */}
            <Field.Root>
                <LabelWithHelp label="BAP Profile" help="The analysis this composite feeds into. It determines how the composite is built and what it contains." />
                <select
                    value={params.targetAnalysis}
                    style={selectStyle}
                    onChange={(e) => set({ targetAnalysis: e.target.value as TargetAnalysis })}
                >
                    <option value="sens_slope">VPT - Sen&apos;s slope</option>
                    <option value="spectral_recovery">VPT - Spectral Recovery</option>
                </select>
            </Field.Root>

            {/* Year range. Needed for both targets: composites are produced per
                month (Sen's slope) or per season window (Spectral Recovery)
                within each of these years. */}
            <Stack gap="1">
                <HStack gap="4" align="flex-end">
                    <Field.Root invalid={yearError != null}>
                        <LabelWithHelp label="Year from" help="First year of the analysis period (inclusive)." />
                        <Input
                            type="number" w="120px"
                            value={params.yearFrom} min={MIN_YEAR} max={params.yearTo}
                            css={{ "--focus-color": "#2C7D75" }}
                            onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v)) set({ yearFrom: v }); }}
                        />
                    </Field.Root>
                    <Field.Root invalid={yearError != null}>
                        <LabelWithHelp label="Year to" help="Last year of the analysis period (inclusive)." />
                        <Input
                            type="number" w="120px"
                            value={params.yearTo} min={params.yearFrom} max={MAX_YEAR}
                            css={{ "--focus-color": "#2C7D75" }}
                            onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v)) set({ yearTo: v }); }}
                        />
                    </Field.Root>
                </HStack>
                {yearError != null && (
                    <Text fontSize="sm" color="red.600">{yearError}</Text>
                )}
            </Stack>

            {/* Season window (month + day, year-agnostic) */}
            {isSpectralRecovery && (
                <Stack gap="2">
                    <HStack gap="4" align="flex-end" wrap="wrap">
                        <Field.Root maxW="180px">
                            <LabelWithHelp label="Season start" help="First day of the seasonal window, applied within every selected year." />
                            <select
                                value={params.seasonStartMonth}
                                style={selectStyle}
                                onChange={(e) => setSeason({ seasonStartMonth: parseInt(e.target.value) })}
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
                                onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v)) setSeason({ seasonStartDay: Math.max(1, v) }); }}
                            />
                        </Field.Root>
                    </HStack>
                    <HStack gap="4" align="flex-end" wrap="wrap">
                        <Field.Root maxW="180px" invalid={seasonError}>
                            <LabelWithHelp label="Season end" help="Last day of the seasonal window. It must lie in the same year as the start, on or after it." />
                            <select
                                value={params.seasonEndMonth}
                                style={selectStyle}
                                onChange={(e) => setSeason({ seasonEndMonth: parseInt(e.target.value) })}
                            >
                                {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        </Field.Root>
                        <Field.Root maxW="90px" invalid={seasonError}>
                            <Field.Label>Day</Field.Label>
                            <Input
                                type="number"
                                value={params.seasonEndDay} min={1} max={daysInMonth(params.seasonEndMonth)}
                                css={{ "--focus-color": "#2C7D75" }}
                                onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v)) setSeason({ seasonEndDay: Math.max(1, v) }); }}
                            />
                        </Field.Root>
                    </HStack>
                    {seasonError && (
                        <Text fontSize="sm" color="red.600">
                            The season must end on or after its start, within the same year.
                        </Text>
                    )}
                </Stack>
            )}

            {/* Month range */}
            {!isSpectralRecovery && (
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

            {/* Boolean. Spectral Recovery composites contain only reflectance bands. */}
            {!isSpectralRecovery && (
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
            )}

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
