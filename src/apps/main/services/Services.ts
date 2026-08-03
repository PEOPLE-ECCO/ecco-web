// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import "@open-pioneer/runtime";
import { useService } from "open-pioneer:react-hooks";
import { HttpService } from "@open-pioneer/http";
import { Job, JobParameters, JobResult, Timeseries, TimeseriesImpl } from "../components/definitions";
import { useState } from "react";

export const useServices = () => {
    const httpService = useService<HttpService>("http.HttpService");

    const getUser = async () => {
        const url = import.meta.env.VITE_API_ROOT + "/user/";
        const response = await httpService.fetch(url);
        const responseData = await response.json();

        if (responseData) {
            return responseData;
        } else {
            throw new Error("Unexpected response: " + JSON.stringify(responseData));
        }
    };

    const getScenarios = async () => {
        const url = import.meta.env.VITE_API_ROOT + "/scenarios/";
        const response = await httpService.fetch(url);
        const responseData = await response.json();

        if (responseData) {
            return responseData;
        } else {
            throw new Error("Unexpected response: " + JSON.stringify(responseData));
        }
    };

    const getScenario = async (id: string) => {
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
    };

    const getTimeseries = async (id: string) => {
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
    };

    const getProcesses = async (id: string) => {
        console.log("getProcesses of scenario " + id);
        const url = import.meta.env.VITE_API_ROOT + "/scenarios/" + id + "/processes/";
        const response = await httpService.fetch(url);
        const responseData = await response.json();

        if (responseData) {
            return responseData;
        } else {
            throw new Error("Unexpected response: " + JSON.stringify(responseData));
        }
    };


    const createTimeseries = async (ts: Timeseries) : Promise<string> => {
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
    };

    const createJob = async (scenario_id: string, ts_id: string, job_parameters: JobParameters) => {
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
    };
    return { getUser, getScenarios, getScenario, getTimeseries, getProcesses, createTimeseries, createJob };
};