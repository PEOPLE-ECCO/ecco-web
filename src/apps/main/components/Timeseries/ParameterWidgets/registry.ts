// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { ParameterWidget, SerializedParams } from "./types";
import { BoundingArea, PreviewArea } from "./AreaMapPreview";
import { BapSensSlopeParametersWidget } from "./BapSensSlopeParametersWidget";
import { BapBreaksParametersWidget } from "./BapBreaksParametersWidget";
import { BreaksParametersWidget } from "./BreaksParametersWidget";
import { VdoDisturbanceIndexParametersWidget } from "./VdoDisturbanceIndexParametersWidget";
import { ReferenceAreaWidget } from "./ReferenceAreaWidget";

/**
 * Maps a process type to the widget that renders and serializes its parameters.
 * Processes without an entry have no configurable parameters.
 */
export const PARAMETER_WIDGETS: Record<string, ParameterWidget> = {
    "BAP": BapSensSlopeParametersWidget,
    "BAP (Reference)": BapSensSlopeParametersWidget,
    "BAP (Restoration)": BapSensSlopeParametersWidget,
    "BAP (Breaks)": BapBreaksParametersWidget,
    "Breaks": BreaksParametersWidget,
    "Vegetation Disturbance Occurrence": BreaksParametersWidget,
    "VDO Disturbance Index": VdoDisturbanceIndexParametersWidget,
    "Habitat Disturbance Rating": VdoDisturbanceIndexParametersWidget,
    "Sen's slope": ReferenceAreaWidget,
    "TEST slope": ReferenceAreaWidget,
};

/** An area of the preview, named by the param that holds its timeseries id. */
interface AreaConfig {
    /** Key in the widget's serialized params holding the area's timeseries id. */
    param: string;
    /** Label shown in the map legend and in the draw hints. */
    label: string;
}

interface ExtentPreviewConfig {
    /** The area the analysis extent has to lie inside. */
    bounding: AreaConfig;
    /** Further areas shown for context, e.g. the reference area. */
    context?: AreaConfig[];
}

/**
 * Processes that do not allow drawing a free spatial extent. Their extent is
 * bounded by an area implied by their parameters (a reference area, a
 * restoration site, the series they build on), so the create wizard shows a
 * read-only map of those areas and constrains drawing to the bounding one.
 *
 * Adding a process here is all it takes to give it that preview — the areas are
 * resolved from its widget's serialized params by {@link getExtentPreview}.
 */
const EXTENT_PREVIEWS: Record<string, ExtentPreviewConfig> = {
    "Sen's slope": {
        bounding: { param: "restoration_site_id", label: "Restoration site" },
        context: [{ param: "reference_area_id", label: "Reference area" }],
    },
    "TEST slope": {
        bounding: { param: "restoration_site_id", label: "Restoration site" },
        context: [{ param: "reference_area_id", label: "Reference area" }],
    },
    "Breaks": {
        bounding: { param: "breaks_bap_id", label: "BAP (Breaks) series" },
    },
    "VDO Disturbance Index": {
        bounding: { param: "breaks_id", label: "Breaks series" },
    },
};

/** The areas to show in the extent preview, ready to pass to `AreaMapPreview`. */
export interface ExtentPreview {
    boundingArea: BoundingArea;
    contextAreas: PreviewArea[];
}

/**
 * The extent preview for a process, resolved against the params its widget has
 * serialized so far. Returns undefined for processes that draw a free extent.
 * The bounding area's id is undefined until it has been selected; context areas
 * that are not (yet) selected are omitted.
 */
export function getExtentPreview(
    processName: string | undefined,
    params: SerializedParams | undefined
): ExtentPreview | undefined {
    const config = processName != null ? EXTENT_PREVIEWS[processName] : undefined;
    if (!config) {
        return undefined;
    }
    const areaId = (area: AreaConfig) => params?.[area.param] as number | undefined;
    return {
        boundingArea: { id: areaId(config.bounding), label: config.bounding.label },
        contextAreas: (config.context ?? [])
            .map((area) => ({ id: areaId(area), label: area.label }))
            .filter((area): area is PreviewArea => area.id != null),
    };
}

export function isExtentlessProcess(processName: string | undefined): boolean {
    return processName != null && EXTENT_PREVIEWS[processName] != null;
}
