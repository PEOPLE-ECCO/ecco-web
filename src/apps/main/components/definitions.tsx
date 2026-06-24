// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { computed, effect, Reactive, reactive, reactiveArray, ReactiveArray, ReactiveMap, reactiveMap, ReadonlyReactive } from "@conterra/reactivity-core";
import { HttpService } from "@open-pioneer/http";
import { GeoJSONFeature } from "ol/format/GeoJSON";
import { features } from "process";

export interface Timeseries {
    readonly id: string;
    readonly scenario_id: string;
    readonly name: string;
    readonly description: string;
    readonly extent?: SpatialExtent
    readonly bbox?: number[]
    readonly geometry?: GeoJSONFeature
    readonly process?: Process
    readonly parameters?: Record<string, unknown>
    readonly jobs?: ReactiveArray<Job>
}

export class TimeseriesImpl implements Timeseries {
    #id: string;
    #scenario_id: string;
    #name: string;
    #description: string;
    #extent?: SpatialExtent;
    #process?: Process;
    #jobs: ReactiveArray<Job>;
    #process_parameters?: Record<string, unknown>;

    #httpService: HttpService;

    #fetchedJobs: boolean;

    /**
     * @param id A unique identifier for the timeseries.
     * @param scenario_id The ID of the scenario this timeseries belongs to.
     * @param name A short name for the timeseries.
     * @param description A detailed description of the timeseries.
     * @param extent Optional spatial extent of the timeseries data.
     * @param process Optional process used to generate the timeseries.
     * @param jobs Optional array of jobs related to the timeseries.
     */
    constructor(
        payload: Timeseries,
        httpService: HttpService
    ) {
        this.#id = payload.id;
        this.#scenario_id = payload.scenario_id;
        this.#name = payload.name;
        this.#description = payload.description;
        this.#extent = {
            "bbox": payload.bbox!,
            "geometry": payload.geometry!
        };
        this.#process = payload.process;
        this.#jobs = reactiveArray([]);
        this.#fetchedJobs = false;
        this.#process_parameters = payload.process_parameters;

        this.#httpService = httpService;
    }


    public get id(): string {
        return this.#id;
    }

    public get scenario_id(): string {
        return this.#scenario_id;
    }

    public get name(): string {
        return this.#name;
    }

    public get description(): string {
        return this.#description;
    }

    public get parameters(): Record<string, unknown> | undefined {
        return this.#process_parameters;
    }

    public get extent(): SpatialExtent | undefined {
        return this.#extent;
    }

    public get process(): Process | undefined {
        return this.#process;
    }

    public get jobs(): ReactiveArray<Job> {
        // TODO: allow refetching
        if (this.#jobs.length == 0 && !this.#fetchedJobs) {
            this.#fetchedJobs = true;
            const url = import.meta.env.VITE_API_ROOT + "/timeseries/" + this.#id + "/jobs/";
            this.#httpService.fetch(url)
                .then(r => r.json())
                .then(response => {
                    if (response) {
                        for (const obj of response) {
                            this.#jobs.push(
                                new JobImpl(obj, this.#httpService)
                            );
                        }
                    } else {
                        throw new Error("Unexpected response: " + JSON.stringify(response));
                    }
                })
                .catch((rejectReason) => {
                    console.error("Could not load catalog for job " + this.#id + " | got HTTP Status" + rejectReason);
                });
        }

        return this.#jobs;
    }
}

export interface Job {
    readonly id: number,
    readonly name: string
    readonly timeseries_id: number;
    readonly created: string;
    readonly start_time: string;
    readonly end_time: string;
    readonly total_run_time: number;
    readonly state_name: string;
    readonly results: ReactiveArray<JobResult>;
    readonly logs: ReactiveArray<LogLine>;
    toString(): string;
}

export class JobImpl implements Job {
    #id: number;
    #name: string;
    #timeseries_id: number;
    #created: string;
    #start_time: string;
    #end_time: string;
    #total_run_time: number;
    #state_name: string;
    #results: ReactiveArray<JobResult>;
    #logs: ReactiveArray<LogLine>;
    #httpService: HttpService;

    #fetchedResults: boolean;
    #fetchedLogs: boolean;

    /**
     * Initializes a new Job instance.
     * @param id The unique identifier for the job.
     * @param name The name of the job.
     * @param timeseries_id The ID of the associated timeseries.
     * @param created The creation timestamp.
     * @param start_time The job's start time.
     * @param end_time The job's end time.
     * @param total_run_time The total duration the job ran for (in seconds, minutes, etc.).
     * @param state_name The current state of the job.
     * @param result Optional array of job results.
     * @param children Optional array of child job results.
     */
    constructor(
        payload: Job,
        httpService: HttpService
    ) {
        this.#id = payload.id;
        this.#name = payload.name;
        this.#timeseries_id = payload.timeseries_id;
        this.#created = payload.created;
        this.#start_time = payload.start_time;
        this.#end_time = payload.end_time;
        this.#total_run_time = payload.total_run_time;
        this.#state_name = payload.state_name;


        this.#results = reactiveArray([]);
        this.#logs = reactiveArray([]);
        this.#httpService = httpService;

        this.#fetchedResults = false;
        this.#fetchedLogs = false;
    }

    get timeseries_id(): number {
        return this.#timeseries_id;
    }

    get created(): string {
        return this.#created;
    }

    get start_time(): string {
        return this.#start_time;
    }

    get end_time(): string {
        return this.#end_time;
    }

    get total_run_time(): number {
        return this.#total_run_time;
    }

    get id(): number {
        return this.#id;
    }

    get name(): string {
        return this.#name;
    }

    get state(): string {
        return this.#state_name;
    }

    get state_name(): string {
        return this.#state_name;
    }

    get totalRunTime(): number {
        return this.#total_run_time;
    }

    get results(): ReactiveArray<JobResult> {

        //TODO: proper mutex on fetchedResults
        if (!this.#fetchedResults && this.#results.length == 0) {
            this.#fetchedResults = true;
            const url = import.meta.env.VITE_API_ROOT + "/jobs/" + this.#id + "/results/";
            this.#httpService.fetch(url)
                .then(r => r.json())
                .then(response => {
                    if (response) {                    
                        const r = response as STACItemCollection;
                        for (const feature of r.features) {
                            this.#results.push(new JobResultData(feature));
                        }
                    } else {
                        throw new Error("Unexpected response: " + JSON.stringify(response));
                    }
                })
                .catch((rejectReason) => {
                    console.error("Could not load catalog for job " + this.#id + " | got HTTP Status" + rejectReason);
                });
        } else {
            console.log("skipped fetching results");
        }
        return this.#results;
    }

    get logs(): ReactiveArray<LogLine> {
        // We should refetch this often, logs might have changed
        if (!this.#fetchedLogs) {
            this.#fetchedLogs = true;
            const url = import.meta.env.VITE_API_ROOT + "/jobs/" + this.#id + "/log/";
            this.#httpService.fetch(url)
                .then(r => r.json())
                .then(response => {
                    if (response) {
                        //TODO: check if this is correct
                        this.#logs.push(...response);
                    } else {
                        throw new Error("Unexpected response: " + JSON.stringify(response));
                    }
                })
                .catch((rejectReason) => {
                    console.error("Could not load catalog for job " + this.#id + " | got HTTP Status" + rejectReason);
                });
        }

        return this.#logs;
    }

    toString() {
        return JSON.stringify({
            id: this.#id,
            name: this.#name,
            timeseries_id: this.#timeseries_id,
            state_name: this.#state_name,
            created: this.#created,
            start_time: this.#start_time,
            end_time: this.#end_time,
            total_run_time: this.#total_run_time,
            results_count: this.#results?.length ?? 0,
            logs_count: this.#logs?.length ?? 0
        });
    }
}

export interface UnitValue {
    unit: string
    value: number
}

export interface Usage {
    cpu: UnitValue
    duration: UnitValue
    memory: UnitValue
    sentinelhub: UnitValue
}


interface STACItemCollection {
    readonly type: string
    readonly features: STACItem[]
    readonly "flow_run.name": string
}

interface STACItem {
    readonly type: string
    readonly stac_version: string
    readonly stac_extensions: string[]
    readonly id: string
    // readonly geometry: string
    readonly bbox: number[]
    readonly phenomenonTime: string;
    readonly properties: Record<string, string>;
    // readonly links: string
    readonly assets: Record<string, Asset>;
    readonly epsg: string;
    readonly href: string;
}

interface Asset {
    readonly href: string;
    readonly type: string;
}

export interface JobResult extends STACItem {
    visible: Reactive<boolean>
    visibleinoverview: Reactive<boolean>;
    readonly style: string;
    readonly name: string;
}

class JobResultData implements JobResult {
    // Private class fields (prefixed with #) for all variables
    #type: string;
    #stac_version: string;
    #stac_extensions: string[];
    #id: string;
    #bbox: number[];
    #phenomenonTime: string;
    #properties: Record<string, string>;
    #assets: Record<string, Asset>;

    #filename: string;
    #href: string;
    #job: string;
    #mime: string;
    #epsg: string;
    #style: string;
    #visible: Reactive<boolean>;
    #visibleinoverview: Reactive<boolean>;
    #name: ReadonlyReactive<string>;

    /**
     * @param name A human-readable name for the result.
     * @param filename The local or server filename of the result.
     * @param href The URL/link to access the result data.
     * @param job The ID of the job that produced this result.
     * @param mime The MIME type of the result file (e.g., 'application/json', 'image/png').
     * @param type The type of the result object.
     */
    constructor(
        payload: STACItem
    ) {
        this.#filename = payload.id;
        this.#href = payload.assets["image"]!.href!;
        this.#job = payload.id;
        this.#mime = payload.assets["image"]!.type!;
        this.#type = payload.properties["type"]!;
        this.#epsg = payload.properties["epsg"]!;
        this.#style = payload.properties["style"]!;

        this.#visible = reactive(true);
        this.#visibleinoverview = reactive(true);

        this.#stac_version = payload.stac_version;
        this.#stac_extensions = payload.stac_extensions;
        this.#id = payload.id;
        this.#bbox = payload.bbox;
        this.#properties = payload.properties;
        this.#assets = payload.assets;

        this.#name = computed(() => {
            return this.#filename.split("/").slice(-1)[0]!;
        });

        if (payload.properties && payload.properties["datetime"]) {
            this.#phenomenonTime = new Date(payload.properties["datetime"]).toISOString().substring(0, 10);
        } else {
            this.#phenomenonTime = "";
        }
    }

    // Public getters
    public get name(): string {
        return this.#name.value;
    }

    public get filename(): string {
        return this.#filename;
    }

    public get href(): string {
        return this.#href;
    }

    public get mime(): string {
        return this.#mime;
    }

    public get type(): string {
        return this.#type;
    }

    public get job(): string {
        return this.#job;
    }

    public get visible(): Reactive<boolean> {
        return this.#visible;
    }

    public set visible(state: boolean) {
        this.#visible.value = state;
    }

    public get visibleinoverview(): Reactive<boolean> {
        return this.#visibleinoverview;
    }

    public set visibleinoverview(state: boolean) {
        this.#visibleinoverview.value = state;
    }

    public get stac_version(): string {
        return this.#stac_version;
    }

    public get stac_extensions(): string[] {
        return this.#stac_extensions;
    }

    public get id(): string {
        return this.#id;
    }

    public get bbox(): number[] {
        return this.#bbox;
    }

    public get properties(): Record<string, string> {
        return this.#properties;
    }

    public get assets(): Record<string, Asset> {
        return this.#assets;
    }

    public get epsg(): string {
        return this.#epsg;
    }

    public get style(): string {
        return this.#style;
    }

    public get phenomenonTime(): string {
        return this.#phenomenonTime;
    }
}


export interface STACProperties {

}

export interface SpatialExtent {
    geometry: GeoJSONFeature
    bbox: number[]
}

export interface TemporalExtent {
    interval: string[]
}

export interface Extent {
    spatial: SpatialExtent
    temporal: TemporalExtent
}

export interface JobParameters {
    timespan: [Date, Date]
}

export interface LogLine {
    value: []
    created: string
    flow_run_id: string
    id: string
    level: number
    message: string
    name: string
    timestamp: string
    updated: string
}

export interface PreprocessOption {
    id: number
    name: string
}

export interface ProcessParameters {
    preprocess_options?: PreprocessOption[]
}

export interface Process {
    description: string
    id: number
    name: string
    parameters: ProcessParameters
}

export interface LegendElement {
    value: string
    color: string
}

export interface LegendAndDescription {
    processName: string;
    entries: LegendElement[];
    description: string;
}
