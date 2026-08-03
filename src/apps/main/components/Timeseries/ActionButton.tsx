// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Button } from "@chakra-ui/react";
import { Tooltip } from "../../components/tooltip";
import { ReactElement } from "react";

interface ActionButtonProps {
    icon?: ReactElement;
    label: string;
    tooltip?: string;
    disabled?: boolean;
    onClick?: () => void;
    w?: string;
}

export function ActionButton({ icon, label, tooltip, disabled, onClick, w }: ActionButtonProps) {
    return (
        <>
            <Tooltip content={tooltip}>
                <Button
                    backgroundColor="#2C7D75"
                    color="white"
                    _hover={{ backgroundColor: "teal.700" }}
                    onClick={onClick}
                    w={w}
                    disabled={disabled}
                >
                    {icon} {label}
                </Button>
            </Tooltip>
        </>

    );
}