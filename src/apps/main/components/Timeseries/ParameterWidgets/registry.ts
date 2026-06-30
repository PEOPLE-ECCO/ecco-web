// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { ParameterWidget } from "./types";
import { BapSensSlopeParametersWidget } from "./BapSensSlopeParametersWidget";
import { ReferenceAreaWidget } from "./ReferenceAreaWidget";

/**
 * Maps a process type to the widget that renders and serializes its parameters.
 * Processes without an entry have no configurable parameters.
 */
export const PARAMETER_WIDGETS: Record<string, ParameterWidget> = {
    "BAP": BapSensSlopeParametersWidget,
    "Sen's slope": ReferenceAreaWidget,
};

/**
 * Processes that do not allow drawing a spatial extent. Their extent is implied
 * by their parameters (e.g. the selected reference area / restoration site), so
 * the create wizard shows a read-only map preview instead of the draw control
 * and persists no extent.
 */
export const EXTENTLESS_PROCESSES: ReadonlySet<string> = new Set([
    "Sen's slope",
]);

export function isExtentlessProcess(processName: string | undefined): boolean {
    return processName != null && EXTENTLESS_PROCESSES.has(processName);
}
