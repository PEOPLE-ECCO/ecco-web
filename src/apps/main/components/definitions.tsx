export interface Timeseries {
    id: string;
    scenario_id: string;
    name: string;
    description: string;
    jobs: Job[] | undefined
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

export interface SpatialExtend {
    bbox: number[]
}

export interface TemporalExtend {
    interval: string[]
}

export interface Extend {
    spatial: SpatialExtend
    temporal: TemporalExtend
}

export interface Catalog {
    assets: AssetWrap;
    id: string
    extend: Extend
}
