// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { GradientStop, LegendAndDescription } from "../components/definitions";

export enum SolutionNames {
    SAV = "Submerged aquatic vegetation and coral reef habitat extent",
    MHC = "Marine habitat connectivity",
    MHF = "Marine habitat frequency",
    VPT = "Vegetation Productivity Trend",
    SAO = "Shifting Agriculture Occurrence",
    HDI = "Habitat Disturbance Index"
}

export class LegendProvider {

    public resolveLegend(outputType: string) {
        let result = this.resolveSAVLegend(outputType);

        if (!result) {
            result = {
                processName: outputType,
                entries: [],
                gradient: [],
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
                result = {
                    processName: lowered,
                    entries: [{ value: "Red", color: "red" }, { value: "Green", color: "green" }, { value: "Blue", color: "blue " }],
                    description: "Raw openEO scenes, rendered as pseudo-color composites for visualisation pruposes."
                };
                break;

            case "overall probability":
                result = {
                    processName: lowered,
                    entries: [{ value: "Corals", color: "red" }, { value: "SAV", color: "green" }, { value: "Water/other", color: "blue" }],
                    description: "Probabilities for single scenes. The coloring follows a gradient: e.g. intensive red shows a high coral probability, light red a lower value."
                };
                break;

            case "aggregated probability":
                result = {
                    processName: lowered,
                    entries: [{ value: "Corals", color: "red" }, { value: "SAV", color: "green" }, { value: "Water/other", color: "blue" }],
                    description: "Probabilities aggregated over all scenes. The coloring follows a gradient: e.g. intensive red shows a high coral probability, light red a lower value."
                };
                break;

            case "sav probability":
                result = {
                    processName: lowered,
                    entries: [{ value: "SAV", color: "white" }],
                    description: "Submerged aquatic vegetation probabilities aggregated over all scenes"
                };
                break;

            case "coral probability":
                result = {
                    processName: lowered,
                    entries: [{ value: "Corals", color: "white" }],
                    description: "Coral probabilities aggregated over all scenes"
                };
                break;

            case "prediction":
                result = {
                    processName: lowered,
                    entries: [{ value: "Corals", color: "red" }, { value: "SAV", color: "green" }, { value: "No Data", color: "white" }],
                    description: "Prediction results, following a binary classifcation."
                };
                break;

            case "geojson-sav":
            case "geojsonsav":
                result = {
                    processName: lowered,
                    entries: [{ value: "SAV patch", color: "lightcyan" }, { value: "Selected patch", color: "#8b0000" }, { value: "Neighour patch", color: "#ff0000" }],
                    description: "Patches of SAV classification, including information on topology. Selecting a patch also marks its neighbours."
                };
                break;

            case "geojson-coral":
            case "geojsoncoral":
                result = {
                    processName: lowered,
                    entries: [{ value: "Coral patch", color: "lightcyan" }, { value: "Selected patch", color: "#8b0000" }, { value: "Neighour patch", color: "#ff0000" }],
                    description: "Patches of Coral classification, including information on topology. Selecting a patch also marks its neighbours."
                };
                break;
            case "bap":
                result = {
                    processName: lowered,
                    entries: [],
                    gradient: [
                        { value: -1.5, color: "rgb(247, 252, 245)" },
                        { value: -0.75, color: "rgb(199, 233, 192)" },
                        { value: 0, color: "rgb(116, 196, 118)" },
                        { value: 0.75, color: "rgb(35, 139, 69)" },
                        { value: 1.5, color: "rgb(0, 90, 50)" }
                    ],
                    description: "*intermediate colors are interpolated."
                };
                break;

            case "seasonal sen slope - percent_change":
                result = {
                    processName: lowered,
                    entries: [],
                    gradient: [
                        { value: -100, color: "rgb(215, 25, 28)" },
                        { value: -50, color: "rgb(253, 174, 97)" },
                        { value: 0, color: "rgb(255, 255, 191)" },
                        { value: 50, color: "rgb(166, 217, 106)" },
                        { value: 100, color: "rgb(26, 150, 65)" }
                    ],
                    description: "*intermediate colors are interpolated."
                };
                break;

            case "seasonal sen slope - deltair":
                result = {
                    processName: lowered,
                    entries: [],
                    gradient: [
                        { value: -0.5, color: "rgb(215, 25, 28)" },
                        { value: -0.25, color: "rgb(253, 174, 97)" },
                        { value: 0, color: "rgb(255, 255, 191)" },
                        { value: 0.25, color: "rgb(166, 217, 106)" },
                        { value: 0.5, color: "rgb(26, 150, 65)" }
                    ],
                    description: "*intermediate colors are interpolated."
                };
                break;
            case "seasonal sen slope - r80p":
                result = {
                    processName: lowered,
                    entries: [],
                    gradient: [
                        { value: -1.5, color: "rgb(215, 25, 28)" },
                        { value: -0.75, color: "rgb(253, 174, 97)" },
                        { value: 0, color: "rgb(255, 255, 191)" },
                        { value: 0.75, color: "rgb(166, 217, 106)" },
                        { value: 1.5, color: "rgb(26, 150, 65)" }
                    ],
                    description: "*intermediate colors are interpolated."
                };
                break;
        }
        return result;
    }

}
