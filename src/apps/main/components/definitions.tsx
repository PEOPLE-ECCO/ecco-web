export interface Timeseries {
    id: string;
    scenario_id: string;
    name: string;
    description: string;
    jobs?: Job[]
    extent?: Extent
    process?: Process
}

export interface Job {
    executionTimeEnd: string
    executionTimeStart: string
    id: number
    timeseries_id: number
    log: object | undefined
    scheduleTime: string
    status: string
    catalog: Catalog | undefined
    progress: number
    credits: number | undefined
    usage: Usage | undefined
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

export interface Asset {
    title: string
    type: string
    href: string
    "proj:bbox": number[]
    "proj:epsg": number
    job: Job
}

export interface AssetWrap {
    [key: string]: Asset;
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

export interface Catalog {
    assets: AssetWrap;
    id: string
    extent: Extent
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
