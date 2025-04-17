// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import "@open-pioneer/runtime";
import { useService } from "open-pioneer:react-hooks";
import { HttpService } from "@open-pioneer/http";
import { Job } from "../views/Sites/SiteDetails/SiteDetails";

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
        const url = import.meta.env.VITE_API_ROOT + "/scenarios/" + id + "/timeseries/";
        const response = await httpService.fetch(url);
        const responseData = await response.json();
        
        if (responseData) {
            return responseData;
        } else {
            throw new Error("Unexpected response: " + JSON.stringify(responseData));
        }
    };

    const getJob = async (job: Job) => {
        const url = import.meta.env.VITE_API_ROOT.slice(0,-4) + job.catalog;
        const response = await httpService.fetch(url);
        const responseData = await response.json();
        
        if (responseData) {
            return responseData;
        } else {
            throw new Error("Unexpected response: " + JSON.stringify(responseData));
        }
    }; 

    return { getScenarios, getTimeseries, getJob };
};