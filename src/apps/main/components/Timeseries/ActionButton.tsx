// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Button, Tooltip } from "@chakra-ui/react";

interface ActionButtonProps {
    label: string;
    tooltip: string;
    disabled: boolean;
    onClick?: () => void;
    w?: string;
}

export function ActionButton({ label, tooltip, disabled, onClick, w }: ActionButtonProps) {
    return (
        <>
            <Button
                backgroundColor="#2C7D75"
                color="white"
                _hover={{ backgroundColor: "teal.700" }}
                onClick={onClick}
                w={w}
                disabled={disabled}
            >
                {label}
            </Button>
        </>

    );
}