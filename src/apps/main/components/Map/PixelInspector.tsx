// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { MapModel } from "@open-pioneer/map";
import { useEffect, useRef, useState } from "react";
import WebGLTileLayer from "ol/layer/WebGLTile.js";
import type { Pixel } from "ol/pixel";
import type { Coordinate } from "ol/coordinate";
import Overlay from "ol/Overlay";

interface PixelInspectorProps {
    map: MapModel;
}

interface Marker {
    id: number;
    coordinate: Coordinate;
    overlay: Overlay;
    element: HTMLDivElement;
}

// Pixel radius within which a click is treated as "on" an existing marker (=> remove it).
const MARKER_HIT_TOLERANCE = 12;

/**
 * When mounted, this component activates a "pixel inspection" mode on the map:
 *
 *  - Moving the mouse over the map reads the raw band values of the topmost
 *    visible GeoTIFF (WebGLTile) layer at the cursor and shows them in a floating
 *    tooltip that follows the cursor and in the fixed readout box below.
 *  - Clicking the raster drops a persistent marker labelled with the values at
 *    that location. Clicking an existing marker removes it.
 *  - Markers keep their map coordinate and re-sample their value whenever the
 *    visible layer changes, so switching layers refreshes all markers in place.
 *
 * The mode is deactivated by unmounting the component.
 */
export const PixelInspector = ({ map }: PixelInspectorProps) => {
    // Band values under the cursor, shown in the fixed readout box.
    const [bands, setBands] = useState<number[] | undefined>();
    // Whether the cursor is currently over a geotiff pixel with data.
    const [hasData, setHasData] = useState(false);
    // Marker count, mirrored into state so the "Clear all" button can enable/disable.
    const [markerCount, setMarkerCount] = useState(0);

    // Persistent markers live in a ref (mutated imperatively alongside OL overlays).
    const markersRef = useRef<Marker[]>([]);
    // clearMarkers is assigned inside the effect but called from the render tree.
    const clearMarkersRef = useRef<() => void>(() => {});

    useEffect(() => {
        const olMap = map.olMap;
        let nextMarkerId = 0;

        // Build the floating tooltip that follows the cursor.
        const tooltipEl = document.createElement("div");
        tooltipEl.style.background = "rgba(0, 0, 0, 0.8)";
        tooltipEl.style.color = "white";
        tooltipEl.style.padding = "4px 8px";
        tooltipEl.style.borderRadius = "4px";
        tooltipEl.style.fontFamily = "monospace";
        tooltipEl.style.fontSize = "12px";
        tooltipEl.style.whiteSpace = "pre";
        tooltipEl.style.pointerEvents = "none";
        tooltipEl.style.display = "none";

        const tooltipOverlay = new Overlay({
            element: tooltipEl,
            positioning: "bottom-left",
            offset: [12, -12],
            stopEvent: false
        });
        olMap.addOverlay(tooltipOverlay);

        // Finds the topmost visible GeoTIFF (WebGLTile) layer.
        const findGeotiffLayer = (): WebGLTileLayer | undefined => {
            const layers = olMap.getAllLayers();
            // Iterate in reverse so the topmost (last drawn) visible layer wins.
            for (let i = layers.length - 1; i >= 0; i--) {
                const layer = layers[i];
                if (layer instanceof WebGLTileLayer && layer.getVisible()) {
                    return layer;
                }
            }
            return undefined;
        };

        const readValues = (pixel: Pixel): number[] | undefined => {
            const layer = findGeotiffLayer();
            if (!layer) {
                return undefined;
            }
            // getData returns the raw band values at the pixel (Uint8/Float array),
            // or null if the pixel is outside the data / not yet loaded.
            const data = layer.getData(pixel);
            if (!data) {
                return undefined;
            }
            const values = Array.from(data as ArrayLike<number>);
            // getData appends a trailing alpha channel (255 = in-data, 0 = nodata/outside).
            // Drop it and use it to distinguish "no data" from a real 0 band value.
            const alpha = values[values.length - 1];
            const bandValues = values.slice(0, -1);
            if (alpha === 0 || bandValues.length === 0) {
                return undefined;
            }
            return bandValues;
        };

        // Reads the values at a map coordinate (used for markers, which store coordinates).
        const readValuesAtCoordinate = (coordinate: Coordinate): number[] | undefined => {
            const pixel = olMap.getPixelFromCoordinate(coordinate);
            if (!pixel) {
                return undefined;
            }
            return readValues(pixel);
        };

        const formatValues = (values: number[]): string => {
            return values.map((v, i) => `band ${i + 1}: ${v}`).join("\n");
        };

        // Renders the given values (or a "no data" note) into a marker's label element.
        // The dot is the element itself (anchored on the coordinate); the label is
        // absolutely positioned below it so it does not shift the anchor point.
        const renderMarker = (marker: Marker, values: number[] | undefined) => {
            const label = values ? formatValues(values) : "no data";
            marker.element.innerHTML =
                `<div class="pixel-inspector-marker-label">${label}</div>`;
        };

        const styleMarkerElement = (el: HTMLDivElement) => {
            el.style.cursor = "pointer";
            el.classList.add("pixel-inspector-marker-dot");
        };

        // Re-samples every marker at its stored coordinate and refreshes its label.
        // Returns true if at least one marker actually resolved to data, so callers
        // can tell whether the new layer's tiles have loaded yet.
        const resampleMarkers = (): boolean => {
            let gotData = false;
            for (const marker of markersRef.current) {
                const values = readValuesAtCoordinate(marker.coordinate);
                if (values) {
                    gotData = true;
                }
                renderMarker(marker, values);
            }
            return gotData;
        };

        // Tracks which geotiff layer was active at the last resample, so we only
        // re-sample when the active raster actually changes (not on every pan/zoom
        // render). When it changes, the new layer's tiles are usually not loaded yet
        // (getData returns null), so we keep resampling on subsequent renders until
        // data resolves — otherwise markers would stick on the stale "no data" read.
        let lastGeotiffLayer: WebGLTileLayer | undefined = findGeotiffLayer();
        let pendingResample = false;
        const resampleIfLayerChanged = () => {
            const current = findGeotiffLayer();
            if (current !== lastGeotiffLayer) {
                lastGeotiffLayer = current;
                pendingResample = true;
            }
            if (pendingResample) {
                const gotData = resampleMarkers();
                // Stop retrying once data resolved (or there are no markers to fill).
                if (gotData || markersRef.current.length === 0) {
                    pendingResample = false;
                }
            }
        };

        const removeMarker = (marker: Marker) => {
            olMap.removeOverlay(marker.overlay);
            markersRef.current = markersRef.current.filter((m) => m.id !== marker.id);
            setMarkerCount(markersRef.current.length);
        };

        const addMarker = (coordinate: Coordinate, values: number[]) => {
            const element = document.createElement("div");
            styleMarkerElement(element);

            const overlay = new Overlay({
                element,
                positioning: "center-center",
                stopEvent: true // let clicks on the marker be handled by its own listener
            });

            const marker: Marker = { id: nextMarkerId++, coordinate, overlay, element };
            renderMarker(marker, values);

            element.addEventListener("click", (e) => {
                e.stopPropagation();
                removeMarker(marker);
            });

            overlay.setPosition(coordinate);
            olMap.addOverlay(overlay);
            markersRef.current = [...markersRef.current, marker];
            setMarkerCount(markersRef.current.length);
        };

        const clearMarkers = () => {
            for (const marker of markersRef.current) {
                olMap.removeOverlay(marker.overlay);
            }
            markersRef.current = [];
            setMarkerCount(0);
        };
        clearMarkersRef.current = clearMarkers;

        const onPointerMove = (evt: { pixel: Pixel; coordinate: Coordinate; dragging: boolean }) => {
            if (evt.dragging) {
                return;
            }
            const values = readValues(evt.pixel);
            if (values && values.length > 0) {
                setBands(values);
                setHasData(true);
                tooltipEl.textContent = formatValues(values);
                tooltipEl.style.display = "block";
                tooltipOverlay.setPosition(evt.coordinate);
            } else {
                setBands(undefined);
                setHasData(false);
                tooltipEl.style.display = "none";
                tooltipOverlay.setPosition(undefined);
            }
        };

        const onSingleClick = (evt: { pixel: Pixel; coordinate: Coordinate }) => {
            // If the click landed on an existing marker, remove it instead of adding one.
            const hit = markersRef.current.find((marker) => {
                const markerPixel = olMap.getPixelFromCoordinate(marker.coordinate);
                if (!markerPixel) {
                    return false;
                }
                const dx = markerPixel[0]! - evt.pixel[0]!;
                const dy = markerPixel[1]! - evt.pixel[1]!;
                return Math.hypot(dx, dy) <= MARKER_HIT_TOLERANCE;
            });
            if (hit) {
                removeMarker(hit);
                return;
            }

            const values = readValues(evt.pixel);
            if (values && values.length > 0) {
                addMarker(evt.coordinate, values);
            }
        };

        const onPointerOut = () => {
            setBands(undefined);
            setHasData(false);
            tooltipEl.style.display = "none";
            tooltipOverlay.setPosition(undefined);
        };

        olMap.on("pointermove", onPointerMove);
        olMap.on("singleclick", onSingleClick);
        // rendercomplete fires after every render (including pan/zoom), so only
        // re-sample when the active raster layer has actually changed.
        olMap.on("rendercomplete", resampleIfLayerChanged);
        // pointermove doesn't fire when leaving the viewport, so hide via the DOM event.
        const viewport = olMap.getViewport();
        viewport.addEventListener("pointerleave", onPointerOut);

        return () => {
            olMap.un("pointermove", onPointerMove);
            olMap.un("singleclick", onSingleClick);
            olMap.un("rendercomplete", resampleIfLayerChanged);
            viewport.removeEventListener("pointerleave", onPointerOut);
            olMap.removeOverlay(tooltipOverlay);
            clearMarkers();
            clearMarkersRef.current = () => {};
        };
    }, [map]);

    return (
        <Box>
            <style>{`
                .pixel-inspector-marker-dot {
                    position: relative;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #e53e3e;
                    border: 2px solid white;
                    box-shadow: 0 0 2px rgba(0,0,0,0.6);
                    box-sizing: border-box;
                }
                .pixel-inspector-marker-label {
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    margin-top: 4px;
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: monospace;
                    font-size: 11px;
                    white-space: pre;
                }
            `}</style>
            <Flex justify="space-between" align="center" mb="1">
                <Text fontSize="xs" color="gray.600">
                    Click the raster to place a marker; click a marker to remove it.
                </Text>
                <Button
                    size="xs"
                    variant="outline"
                    disabled={markerCount === 0}
                    onClick={() => clearMarkersRef.current()}
                >
                    Clear all
                </Button>
            </Flex>
            {hasData && bands ? (
                <>
                <Text>Current value at mouse position: <br/></Text>
                {bands.map((value, index) => (
                    <Text key={index} fontFamily="monospace" fontSize="sm">
                        
                        band {index + 1}: {value}
                    </Text>
                ))}
                </>
            ) : (
                <Text fontSize="sm" color="gray.500">
                    Hover over the raster to read pixel values.
                </Text>
            )}
        </Box>
    );
};
