export interface Timeseries {
    id: string;
    scenario_id: number;
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
    costs: number
    usage: object
}

export interface Asset {
    title: string
    type: string
    href: string
    "proj:bbox": number[]
    "proj:epsg": number
    
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
