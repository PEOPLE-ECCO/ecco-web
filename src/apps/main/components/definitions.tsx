// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { computed, effect, Reactive, reactive, reactiveArray, ReactiveArray, ReactiveMap, reactiveMap, ReadonlyReactive } from "@conterra/reactivity-core";
import { HttpService } from "@open-pioneer/http";

export interface Timeseries {
    readonly id: string;
    readonly scenario_id: string;
    readonly name: string;
    readonly description: string;
    readonly extent?: SpatialExtent
    readonly process?: Process
    readonly jobs: ReactiveArray<Job>
    readonly results: ReadonlyReactive<Map<string, JobResult[]>>
}

export class TimeseriesImpl implements Timeseries {
    #id: string;
    #scenario_id: string;
    #name: string;
    #description: string;
    #extent?: SpatialExtent;
    #process?: Process;
    #jobs: ReactiveArray<Job>;
    #results: ReadonlyReactive<Map<string, JobResult[]>>;

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
        this.#extent = payload.extent;
        this.#process = payload.process;
        this.#jobs = reactiveArray([]);
        this.#fetchedJobs = false;
        this.#results = computed(() => {
            const byType = new Map<string, JobResult[]>();
            for (const job of this.#jobs) {
                for (const v of job.results) {
                    if (!byType.has(v.type)) {
                        byType.set(v.type, [v]);
                    } else {
                        byType.set(v.type, byType.get(v.type)!.concat(v));
                    }
                };
            };
            return byType;
        });

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

    public get extent(): SpatialExtent | undefined {
        return this.#extent;
    }

    public get process(): Process | undefined {
        return this.#process;
    }

    public get results(): ReadonlyReactive<Map<string, JobResult[]>> {
        return this.#results;
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
                        for (const res of response) {
                            // Format to JobResponse
                            this.#results.push(new JobResultData(res));
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
        // We refetch this every time, logs might have changed
        const url = import.meta.env.VITE_API_ROOT + "/jobs/" + this.#id + "/log/";
        this.#httpService.fetch(url)
            .then(r => r.json())
            .then(response => {
                if (response) {
                    //TODO: check if this is correct
                    this.#logs.concat(Array<LogLine>(response).slice(this.#logs.length));
                } else {
                    throw new Error("Unexpected response: " + JSON.stringify(response));
                }
            })
            .catch((rejectReason) => {
                console.error("Could not load catalog for job " + this.#id + " | got HTTP Status" + rejectReason);
            });

        return this.#logs;
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

interface RestJobResult {
    readonly name: string
    readonly filename: string
    readonly href: string
    readonly job: string
    readonly mime: string
    readonly type: string
    readonly epsg: string
    readonly style: string
}

export interface JobResult extends RestJobResult {
    visible: Reactive<boolean>
}

class JobResultData implements JobResult {
    // Private class fields (prefixed with #) for all variables
    #filename: string;
    #href: string;
    #job: string;
    #mime: string;
    #type: string;
    #epsg: string;
    #style: string;
    #visible: Reactive<boolean>;
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
        payload: RestJobResult
    ) {
        this.#filename = payload.filename;
        this.#href = payload.href;
        this.#job = payload.job;
        this.#mime = payload.mime;
        this.#type = payload.type;
        this.#epsg = payload.epsg;
        this.#style = payload.style;

        this.#visible = reactive(true);

        this.#name = computed(() => {
            return this.#filename.split("/").slice(-1)[0]!;
        });
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

    public get epsg(): string {
        return this.#epsg;
    }

    public get style(): string {
        return this.#style;
    }
}


export interface STACProperties {

}

export interface SpatialExtent {
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
    timespan: [Date | null, Date | null]
}

export interface LogLine {
    timestamp: string
    level: number
    message: string
}

export interface Process {
    description: string
    id: number
    name: string
    parameters: object
}

export interface LegendElement {
    value: string
    color: string
}