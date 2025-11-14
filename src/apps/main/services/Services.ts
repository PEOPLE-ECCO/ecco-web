// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import "@open-pioneer/runtime";
import { useService } from "open-pioneer:react-hooks";
import { HttpService } from "@open-pioneer/http";
import { Job, JobParameters, JobResult, Timeseries } from "../components/definitions";
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

    const getTimeseries = async (id: string) => {
        console.log("getTimeseries " + id);
        const url = import.meta.env.VITE_API_ROOT + "/scenarios/" + id + "/timeseries/";
        const response = await httpService.fetch(url);
        const responseData = await response.json();

        if (responseData) {
            return responseData;
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


    const createTimeseries = async (ts: Timeseries) => {
        console.log("createTimeseries " + ts);
        const url = import.meta.env.VITE_API_ROOT + "/scenarios/" + ts.scenario_id + "/timeseries/";
        const response = await httpService.fetch(url, {
            "method": "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    "name": ts.name,
                    "description": ts.description,
                    "process": ts.process?.id
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

    const createJob = async (scenario_id: string, ts_id: string, job_parameters: JobParameters) => {
        const url = import.meta.env.VITE_API_ROOT + "/timeseries/" + ts_id + "/jobs/";
        const response = await httpService.fetch(url, {
            "method": "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    "parameters": {
                        "rangeend": 2022,
                        "rangestart": 2020,
                        "spatial_extent": {
                            "east": 4.659337006068995,
                            "west": 4.516912902851971,
                            "north": 52.444633712215875,
                            "south": 52.38976387918794
                        }
                    }
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

    const getJobsByTimeseriesId = async (scenario_id: string, timeseries_id: string): Promise<Job[]> => {
        const url = import.meta.env.VITE_API_ROOT + "/timeseries/" + timeseries_id + "/jobs/";
        const response = await httpService.fetch(url);
        const responseData = await response.json();
    
        if (responseData) {
            for (const job of responseData) {
                job.id = ""+job.id;
                job.children = [];
            }
            return responseData;
        } else {
            throw new Error("Unexpected response: " + JSON.stringify(responseData));
        }
    };

    const getJobResult = async (job: Job): Promise<JobResult[]> => {
        console.log("getJobResult for job: " + job.id);

        const url = import.meta.env.VITE_API_ROOT + "/jobs/" + job.id + "/results/";
        const response = await httpService.fetch(url);

        if (response.status != 200) {
            console.error("Could not load catalog for job " + job.id + " | got HTTP Status" + response.status);
            return [];
        } else {
            const responseData = await response.json();
            if (responseData) {
                job.result = responseData;
                job.children = job.result;
                for (const res of responseData) {
                    res.id = res.job;
                    res.name = res.filename;
                }
                return responseData;
            } else {
                throw new Error("Unexpected response: " + JSON.stringify(responseData));
            }
        }
    };

    const getJobLog = async (job: Job) => {
        const url = import.meta.env.VITE_API_ROOT + "/jobs/" + job.id + "/log/";
        const response = await httpService.fetch(url);

        if (response.status != 200) {
            console.error("Could not load catalog for job " + job.id + " | got HTTP Status" + response.status);
            return null;
        } else {
            const responseData = await response.json();
            if (responseData) {
                return responseData;
            } else {
                throw new Error("Unexpected response: " + JSON.stringify(responseData));
            }
        }
    };

    return { getUser, getScenarios, getTimeseries, getProcesses, getJobsByTimeseriesId, getJobResult, getJobLog, createTimeseries, createJob };
};