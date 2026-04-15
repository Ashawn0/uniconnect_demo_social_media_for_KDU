"use client";

import * as React from "react";
import { cn } from "./utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
    label?: string;
    containerClassName?: string;
    labelClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, icon, label, containerClassName, labelClassName, ...props }, ref) => {
        const inputElement = (
            <div className={cn("relative", !icon && "contents")}>
                {icon && (
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        icon && "pl-10",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
            </div>
        );

        if (!label) {
            return inputElement;
        }

        return (
            <div className={cn("space-y-2", containerClassName)}>
                <label className={cn("text-sm font-medium text-foreground", labelClassName)}>
                    {label}
                </label>
                {inputElement}
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };
