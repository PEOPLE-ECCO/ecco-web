// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { FC } from "react";

import { Process } from "../../../components/definitions";

/** Serialized parameters as sent to the backend. */
export type SerializedParams = Record<string, unknown>;

export interface ParameterWidgetValue {
    /** Already-serialized parameters, ready to be persisted on the timeseries. */
    params: SerializedParams;
    /** Whether the current selection is complete enough to proceed. */
    valid: boolean;
}

export interface ParameterWidgetProps {
    process: Process;
    onChange: (value: ParameterWidgetValue) => void;
}

/**
 * A parameter widget owns its own UI state and serialization. It renders the
 * controls for a process and reports the serialized params plus validity to the
 * parent via {@link ParameterWidgetProps.onChange}.
 */
export type ParameterWidget = FC<ParameterWidgetProps>;
