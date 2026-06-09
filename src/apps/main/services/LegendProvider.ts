// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { LegendAndDescription } from "../components/definitions";

export enum SolutionNames {
    SAV = "Submerged aquatic vegetation and coral reef habitat extent",
    MHC = "Marine habitat connectivity",
    MHF = "Marine habitat frequency",
    VPT = "Vegetation Productivity Trend",
    SAO = "Shifting Agriculture Occurrence",
    HDI = "Habitat Disturbance Index"
}

export class LegendProvider {

    public resolveLegend(outputType: string, solutionName: SolutionNames) {
        let result: LegendAndDescription | undefined;

        switch (solutionName) {
            case SolutionNames.SAV:
                // Matches: "Submerged aquatic vegetation and coral reef habitat extent"
                result = this.resolveSAVLegend(outputType);
                break;

            case SolutionNames.MHC:
                // Matches: "Marine habitat connectivity"
                console.log("Processing MHC solution...");
                break;

            case SolutionNames.MHF:
                // Matches: "Marine habitat frequency"
                console.log("Processing MHF solution...");
                break;

            case SolutionNames.VPT:
                // Matches: "Vegetation Productivity Trend"
                console.log("Processing VPT solution...");
                break;

            case SolutionNames.SAO:
                // Matches: "Shifting Agriculture Occurrence"
                console.log("Processing SAO solution...");
                break;

            case SolutionNames.HDI:
                // Matches: "Habitat Disturbance Index"
                console.log("Processing HDI solution...");
                break;
        
        };

        if (!result) {
            result = {
                processName: outputType,
                entries: [],
                description: "No legend available"
            };
        }

        return result;
    }


    private resolveSAVLegend(outputType: string): LegendAndDescription | undefined {
        let result : LegendAndDescription | undefined = undefined;
        const lowered = outputType?.trim().toLowerCase();
        switch (lowered) {
            case "openeo raw files":
                console.log("Handling OpenEO Raw Files...");
                result = {
                    processName: lowered,
                    entries: [{ value: "Red", color: "red" }, { value: "Green", color: "green" }, { value: "Blue", color: "blue " }],
                    description: "Raw openEO scenes, rendered as pseudo-color composites for visualisation pruposes."
                };
                break;

            case "overall probability":
                console.log("Handling Overall Probability...");
                result = {
                    processName: lowered,
                    entries: [{ value: "Corals", color: "red" }, { value: "SAV", color: "green" }, { value: "Water/other", color: "blue" }],
                    description: "Probabilities for single scenes. The coloring follows a gradient: e.g. intensive red shows a high coral probability, light red a lower value."
                };
                break;

            case "aggregated probability":
                console.log("Handling Aggregated Probability...");
                result = {
                    processName: lowered,
                    entries: [{ value: "Corals", color: "red" }, { value: "SAV", color: "green" }, { value: "Water/other", color: "blue" }],
                    description: "Probabilities aggregated over all scenes. The coloring follows a gradient: e.g. intensive red shows a high coral probability, light red a lower value."
                };
                break;

            case "sav probability":
                console.log("Handling SAV Probability...");
                result = {
                    processName: lowered,
                    entries: [{ value: "SAV", color: "white" }],
                    description: "Submerged aquatic vegetation probabilities aggregated over all scenes"
                };
                break;

            case "coral probability":
                console.log("Handling Coral Probability...");
                result = {
                    processName: lowered,
                    entries: [{ value: "Corals", color: "white" }],
                    description: "Coral probabilities aggregated over all scenes"
                };
                break;

            case "prediction":
                console.log("Handling Prediction...");
                result = {
                    processName: lowered,
                    entries: [{ value: "Corals", color: "red" }, { value: "SAV", color: "green" }, { value: "No Data", color: "white" }],
                    description: "Prediction results, following a binary classifcation."
                };
                break;

            case "geojson-sav":
            case "geojsonsav":
                console.log("Handling GeoJSON SAV...");
                result = {
                    processName: lowered,
                    entries: [{ value: "SAV patch", color: "lightcyan" }, { value: "Selected patch", color: "#8b0000" }, { value: "Neighour patch", color: "#ff0000" }],
                    description: "Patches of SAV classification, including information on topology. Selecting a patch also marks its neighbours."
                };
                break;

            case "geojson-coral":
            case "geojsoncoral":
                console.log("Handling GeoJSON Coral...");
                result = {
                    processName: lowered,
                    entries: [{ value: "Coral patch", color: "lightcyan" }, { value: "Selected patch", color: "#8b0000" }, { value: "Neighour patch", color: "#ff0000" }],
                    description: "Patches of Coral classification, including information on topology. Selecting a patch also marks its neighbours."
                };
                break;
        }

        return result;
    }

}
