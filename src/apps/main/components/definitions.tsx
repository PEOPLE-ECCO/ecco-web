export interface Timeseries {
    id: string;
    scenario_id: string;
    name: string;
    description: string;
    jobs?: Job[]
    children?: Job[]
    extent?: Extent
    process?: Process
}

export interface Job {
    id: number
    name: string
    timeseries_id: number
    created: string
    start_time: string
    end_time: string
    total_run_time: number
    state_name: string
    result?: JobResult[]  // needs to be fetched first
    children?: JobResult[]

    /*
    // fictional job properties
    executionTimeEnd: string
    executionTimeStart: string
    log: object | undefined
    scheduleTime: string
    status: string
    result?: JobResult
    progress: number
    credits: number | undefined
    usage: Usage | undefined
    */ 
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

export interface JobResult {
    name: string
    filename: string
    href: string
    job: string
    type: string
    visible: boolean
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
    timespan: [Date| null, Date| null]
}

export interface Item { 
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

export interface Node {
        id: string
        name: string
        children?: Job[]
    }
