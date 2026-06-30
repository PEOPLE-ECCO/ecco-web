// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import "@open-pioneer/runtime";
import { useService } from "open-pioneer:react-hooks";
import { HttpService } from "@open-pioneer/http";
import { Job, JobParameters, JobResult, LegendAndDescription, Timeseries, TimeseriesImpl } from "../components/definitions";
import { useCallback, useMemo } from "react";
import { LegendProvider, SolutionNames } from "./LegendProvider";

export const useServices = () => {
    const httpService = useService<HttpService>("http.HttpService");

    // All functions are wrapped in useCallback (and the returned object in
    // useMemo) so their identities stay stable across renders. This lets callers
    // use them directly as effect dependencies without causing render loops.
    const getUser = useCallback(async () => {
        const url = import.meta.env.VITE_API_ROOT + "/user/";
        const response = await httpService.fetch(url);
        const responseData = await response.json();

        if (responseData) {
            return responseData;
        } else {
            throw new Error("Unexpected response: " + JSON.stringify(responseData));
        }
    }, [httpService]);

    const getScenarios = useCallback(async () => {
        const url = import.meta.env.VITE_API_ROOT + "/scenarios/";
        const response = await httpService.fetch(url);
        const responseData = await response.json();

        if (responseData) {
            return responseData;
        } else {
            throw new Error("Unexpected response: " + JSON.stringify(responseData));
        }
    }, [httpService]);

    const getScenario = useCallback(async (id: string) => {
        const url = import.meta.env.VITE_API_ROOT + "/scenarios/";
        const response = await httpService.fetch(url);
        const responseData = await response.json();

        if (responseData) {
            for (const obj of responseData) {
                if (""+obj.id == id) {
                    return obj;
                }
            };
        }
    }, [httpService]);

    const getTimeseries = useCallback(async (id: string) => {
        console.log("getTimeseries " + id);
        const url = import.meta.env.VITE_API_ROOT + "/scenarios/" + id + "/timeseries/";
        const response = await httpService.fetch(url);
        const responseData = await response.json();

        if (responseData) {
            const raw = [];
            for (const obj of responseData) {
                raw.push(
                    new TimeseriesImpl(obj, httpService)
                );
            }
            return raw;
        } else {
            throw new Error("Unexpected response: " + JSON.stringify(responseData));
        }
    }, [httpService]);

    const getProcesses = useCallback(async (id: string) => {
        console.log("getProcesses of scenario " + id);
        const url = import.meta.env.VITE_API_ROOT + "/scenarios/" + id + "/processes/";
        const response = await httpService.fetch(url);
        const responseData = await response.json();

        if (responseData) {
            return responseData;
        } else {
            throw new Error("Unexpected response: " + JSON.stringify(responseData));
        }
    }, [httpService]);


    const createTimeseries = useCallback(async (ts: Timeseries) : Promise<string> => {
        console.log("createTimeseries " + ts);
        const url = import.meta.env.VITE_API_ROOT + "/scenarios/" + ts.scenario_id + "/timeseries/";
        console.log(ts);
        const response = await httpService.fetch(url, {
            "method": "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(ts)
        });
        const responseData = await response.text();

        if (responseData) {
            return Promise.resolve(responseData);
        } else {
            throw Promise.reject("Unexpected response: " + JSON.stringify(responseData));
        }
    }, [httpService]);

    const createJob = useCallback(async (scenario_id: string, ts_id: string, job_parameters: JobParameters) => {
        const url = import.meta.env.VITE_API_ROOT + "/timeseries/" + ts_id + "/jobs/";
        const response = await httpService.fetch(url, {
            "method": "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    "rangeend": job_parameters.timespan[1].toISOString().substring(0, 10),
                    "rangestart": job_parameters.timespan[0].toISOString().substring(0, 10)
                }
            )
        });
        const responseData = await response.text();

        if (responseData) {
            return responseData;
        } else {
            throw new Error("Unexpected response: " + JSON.stringify(responseData));
        }
    }, [httpService]);

    const getTimeseriesById = useCallback(async (id: string): Promise<Timeseries> => {
        const url = import.meta.env.VITE_API_ROOT + "/timeseries/" + id + "/";
        const response = await httpService.fetch(url);
        const responseData = await response.json();

        if (responseData) {
            return new TimeseriesImpl(responseData, httpService);
        } else {
            throw new Error("Unexpected response: " + JSON.stringify(responseData));
        }
    }, [httpService]);

    const getLegend = useCallback(async (outputType: string, timeseries?: Timeseries) : Promise<LegendAndDescription> => {
        return new Promise((resolve, reject) => {
            const prov = new LegendProvider();

            // TODO resolve solution somehow from timeseries
            const result = prov.resolveLegend(outputType, SolutionNames.SAV);
            resolve(result!);
        });
    }, []);

    return useMemo(
        () => ({ getUser, getScenarios, getScenario, getTimeseries, getTimeseriesById, getProcesses, createTimeseries, createJob, getLegend }),
        [getUser, getScenarios, getScenario, getTimeseries, getTimeseriesById, getProcesses, createTimeseries, createJob, getLegend]
    );
};