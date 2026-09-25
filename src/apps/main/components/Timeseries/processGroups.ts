// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

/**
 * Algorithm families, in the order they appear in the process menu.
 *
 * The process catalogue lives in the backend database, not in code, so these
 * names are matched against `Process.name` exactly — the same strings the
 * parameter widget and extent preview registries key off (see
 * `./ParameterWidgets/registry.ts`).
 */
const PROCESS_GROUPS: { label: string; processes: string[] }[] = [
    {
        label: "Best Available Pixel Composites",
        processes: [
             "BAP for VPT (Reference Area)", 
             "BAP for VPT (Restoration Area)",
             "BAP for VDO"
            ],
    },
    {
        label: "Vegetation Productivity Trend",
        processes: [
            "VPT - Sen's slope",
            "VPT - Spectral Recovery"
        ],
    },
    {
        label: "Disturbance detection",
        processes: [
            "Vegetation Disturbance Occurrence",
            "VDO Disturbance Index",
            "Habitat Disturbance Rating",
        ],
    },
];

/** Group for processes not listed above, so a new backend process stays selectable. */
const OTHER_GROUP = "Other";

const GROUP_BY_PROCESS: Record<string, string> = Object.fromEntries(
    PROCESS_GROUPS.flatMap((group) => group.processes.map((process) => [process, group.label]))
);

/** The group a process belongs to; unlisted processes fall into "Other". */
export function processGroup(name: string): string {
    return GROUP_BY_PROCESS[name] ?? OTHER_GROUP;
}

/** Group labels in menu order, with "Other" last. */
export const GROUP_ORDER: string[] = [...PROCESS_GROUPS.map((group) => group.label), OTHER_GROUP];
