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
    "BAP (seasonal-sen)": BapSensSlopeParametersWidget,
    "BAP Sens Slope": ReferenceAreaWidget,
};
