// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

/**
 * Timespan reported by widgets that have no time-range UI. The create wizard
 * still auto-starts a first job, which needs a range; these processes derive
 * their period from the series they build on instead.
 *
 * Shared so that processes which have to agree on a period (a Breaks run and
 * the VDO Disturbance Index computed from it) cannot drift apart.
 */
export const DEFAULT_TIMESPAN = { start: new Date(2020, 0, 1), end: new Date(2022, 11, 31) };
