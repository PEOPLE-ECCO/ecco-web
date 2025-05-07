// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Button, Tooltip } from "@open-pioneer/chakra-integration";

interface ActionButtonProps {
    label: string;
    tooltip: string;
    onClick?: () => void;
    w?: string;
}

export function ActionButton({ label, tooltip, onClick, w }: ActionButtonProps) {
    return (
        <Tooltip label={tooltip} aria-label={`${label} tooltip`} placement="top">
            <Button
                variant="solid"
                backgroundColor="black"
                color="white"
                _hover={{ backgroundColor: "gray.500" }}
                onClick={onClick}
                w={w}
            >
                {label}
            </Button>
        </Tooltip>
    );
}