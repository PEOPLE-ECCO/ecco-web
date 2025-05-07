// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Button, Tooltip } from "@open-pioneer/chakra-integration";

interface ActionButtonProps {
    label: string;
    tooltip: string;
    onClick?: () => void;
}

export function ActionButton({ label, tooltip, onClick }: ActionButtonProps) {
    return (
        <Tooltip label={tooltip} aria-label={`${label} tooltip`} placement="top">
            <Button
                variant="solid"
                backgroundColor="black"
                color="white"
                _hover={{ backgroundColor: "gray.500" }}
                onClick={onClick}
            >
                {label}
            </Button>
        </Tooltip>
    );
}