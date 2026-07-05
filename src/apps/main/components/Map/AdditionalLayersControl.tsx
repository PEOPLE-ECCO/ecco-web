// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Accordion, Box, HStack, Link, Spacer, Text, VStack } from "@chakra-ui/react";
import { Checkbox } from "@open-pioneer/chakra-snippets/checkbox";
import { MapModel } from "@open-pioneer/map";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";
import { syncWatch } from "@conterra/reactivity-core";
import { useEffect } from "react";
import { LuDownload } from "react-icons/lu";

import {
    ADDITIONAL_COG_LAYER_IDS,
    ADDITIONAL_COG_LAYER_LEGENDS,
    DOWNLOAD_URL_ATTRIBUTE,
    LegendEntry
} from "../../services";

interface AdditionalLayersControlProps {
    map: MapModel;
}

/**
 * Standalone sidebar control listing the map's operational (non-basemap) layers
 * with a visibility toggle and, where available, a download link built from the
 * layer's {@link DOWNLOAD_URL_ATTRIBUTE}. The additional COG overlays are mutually
 * exclusive (at most one visible at a time). Each row expands to show the layer's
 * legend.
 */
export const AdditionalLayersControl = ({ map }: AdditionalLayersControlProps) => {
    // Enforce at-most-one-visible among the additional COG overlays: when the
    // user enables one, disable the others. Basemaps are unaffected.
    useEffect(() => {
        const cogLayers = ADDITIONAL_COG_LAYER_IDS
            .map((id) => map.layers.getLayerById(id))
            .filter((l): l is NonNullable<typeof l> => l != null);

        // guards against the reactive feedback loop from our own setVisible calls
        let enforcing = false;
        let lastVisible = new Set(cogLayers.filter((l) => l.visible).map((l) => l.id));

        const handle = syncWatch(
            () => cogLayers.map((l) => l.visible),
            () => {
                if (enforcing) return;
                const nowVisible = cogLayers.filter((l) => l.visible).map((l) => l.id);
                // the layer(s) that just turned on since the last change
                const turnedOn = nowVisible.filter((id) => !lastVisible.has(id));
                if (turnedOn.length > 0) {
                    const keep = turnedOn[turnedOn.length - 1];
                    enforcing = true;
                    cogLayers.forEach((l) => {
                        if (l.id !== keep && l.visible) l.setVisible(false);
                    });
                    enforcing = false;
                }
                lastVisible = new Set(cogLayers.filter((l) => l.visible).map((l) => l.id));
            }
        );

        return () => handle.destroy();
    }, [map]);

    return (
        <Box bg="white" p="4" borderWidth="1px" borderRadius="md" boxShadow="sm">
            <Text as="b" mb={2} display="block">Additional layers:</Text>
            <OperationalLayerList map={map} />
        </Box>
    );
};

/**
 * Renders the visibility toggles, download links and expandable legends for the
 * operational layers.
 */
const OperationalLayerList = ({ map }: { map: MapModel }) => {
    // Reactively track the operational layers and their visibility so toggling
    // (or exclusivity enforcement) is reflected in the checkboxes.
    const layers = useReactiveSnapshot(
        () =>
            map.layers.getOperationalLayers().map((layer) => ({
                id: layer.id,
                title: layer.title,
                visible: layer.visible,
                downloadUrl: layer.attributes[DOWNLOAD_URL_ATTRIBUTE] as string | undefined
            })),
        [map]
    );

    if (layers.length === 0) {
        return <Text fontSize="sm" color="gray.500">No additional layers available.</Text>;
    }

    // Drive the accordion's open state from layer visibility: a legend expands
    // exactly when its layer is visible and collapses when it is hidden. Only
    // layers that actually have a legend can be open.
    const expanded = layers
        .filter((l) => l.visible && ADDITIONAL_COG_LAYER_LEGENDS[l.id])
        .map((l) => l.id);

    return (
        <Accordion.Root multiple w="100%" value={expanded}>
            {layers.map((layer) => {
                const legend = ADDITIONAL_COG_LAYER_LEGENDS[layer.id];
                return (
                    <Accordion.Item value={layer.id} key={layer.id} borderBottomWidth="0">
                        <HStack w="100%" gap={2}>
                            <Checkbox
                                checked={layer.visible}
                                onCheckedChange={(e) =>
                                    map.layers
                                        .getLayerById(layer.id)
                                        ?.setVisible(e.checked === true)
                                }
                            >
                                {layer.title}
                            </Checkbox>
                            <Spacer />
                            {layer.downloadUrl && (
                                <Link
                                    href={layer.downloadUrl}
                                    download
                                    aria-label={`Download ${layer.title}`}
                                    colorPalette="teal"
                                >
                                    <LuDownload />
                                </Link>
                            )}
                        </HStack>
                        {legend && (
                            <Accordion.ItemContent>
                                <Legend entries={legend} />
                            </Accordion.ItemContent>
                        )}
                    </Accordion.Item>
                );
            })}
        </Accordion.Root>
    );
};

/** Renders a layer's legend: discrete swatch rows and/or continuous color ramps. */
const Legend = ({ entries }: { entries: LegendEntry[] }) => {
    const discrete = entries.filter((e) => e.kind === "discrete");
    const ramps = entries.filter((e) => e.kind === "ramp");

    return (
        <VStack align="stretch" gap={2} pt={1} pb={2} pl={1}>
            {discrete.map((e, i) => (
                <HStack key={`d${i}`} gap={2}>
                    <Box
                        w="14px"
                        h="14px"
                        borderRadius="sm"
                        borderWidth="1px"
                        borderColor="blackAlpha.300"
                        bg={e.color}
                        flexShrink={0}
                    />
                    <Text fontSize="sm">{e.label}</Text>
                </HStack>
            ))}
            {ramps.map((e, i) => (
                <Box key={`r${i}`}>
                    <Box
                        h="14px"
                        borderRadius="sm"
                        borderWidth="1px"
                        borderColor="blackAlpha.300"
                        style={{
                            backgroundImage: `linear-gradient(to right, ${e.stops
                                .map((s) => s.color)
                                .join(", ")})`
                        }}
                    />
                    <HStack justify="space-between" mt={1}>
                        {e.stops.map((s, j) => (
                            <Text key={j} fontSize="xs" color="gray.600">
                                {s.label}
                            </Text>
                        ))}
                    </HStack>
                </Box>
            ))}
        </VStack>
    );
};
