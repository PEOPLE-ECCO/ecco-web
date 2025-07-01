// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import "@open-pioneer/runtime";
import { useService } from "open-pioneer:react-hooks";
import { HttpService } from "@open-pioneer/http";
import { Job, Timeseries } from "../components/definitions";

export const useServices = () => {
    const httpService = useService<HttpService>("http.HttpService");

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
        console.log("getTimeseries" + id);
        const url = import.meta.env.VITE_API_ROOT + "/scenarios/" + id + "/timeseries/";
        const response = await httpService.fetch(url);
        const responseData = await response.json();

        if (responseData) {
            return responseData;
        } else {
            throw new Error("Unexpected response: " + JSON.stringify(responseData));
        }
    };

    const createTimeseries = async (ts: Timeseries) => {
        console.log("createTimeseries" + ts);
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
                    "process": 1
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

    const createJob = async (scenario_id: string, ts_id: string, job: Job) => {
        console.log("createJob for timeseries: " + ts_id);
        const url = import.meta.env.VITE_API_ROOT + "/scenarios/" + scenario_id + "/timeseries/" + ts_id + "/jobs/";
        const response = await httpService.fetch(url, {
            "method": "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    "name": "asdf",
                    "description": "asdf",
                    "process": 7,
                    "parameters": "ads"
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

    const getJobsByTimeseriesId = async (scenario_id: string, timeseries_id: string) => {
        console.log("getJobsByTimeseriesId" + scenario_id + "," + timeseries_id);
        const url = import.meta.env.VITE_API_ROOT + "/scenarios/" + scenario_id + "/timeseries/" + timeseries_id + "/jobs";
        const response = await httpService.fetch(url);
        const responseData = await response.json();

        if (responseData) {
            return responseData;
        } else {
            throw new Error("Unexpected response: " + JSON.stringify(responseData));
        }
    };

    const getJobCatalog = async (scenario_id: string, job: Job) => {
        console.log("getJobCatalog" + scenario_id + "," + job.id);
        const url = import.meta.env.VITE_API_ROOT + "/scenarios/" + scenario_id + "/timeseries/" + job.timeseries_id + "/jobs/" + job.id + "/catalog";
        const response = await httpService.fetch(url);

        if (response.status != 200) {
            console.error("Could not load catalog for job " + job.id + " | got HTTP Status" + response.status);
            return null;
        } else {
            const responseData = await response.json();
            if (responseData) {
                job.catalog = responseData;
                return responseData;
            } else {
                throw new Error("Unexpected response: " + JSON.stringify(responseData));
            }
        }
    };

    const getJobLog = async (scenario_id: string, job: Job) => {
        console.log("getJobLog" + scenario_id + "," + job.id);
        const url = import.meta.env.VITE_API_ROOT + "/scenarios/" + scenario_id + "/timeseries/" + job.timeseries_id + "/jobs/" + job.id + "/log";
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

    return { getScenarios, getTimeseries, getJobsByTimeseriesId, getJobCatalog, getJobLog, createTimeseries, createJob };
};