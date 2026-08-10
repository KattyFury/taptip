/**
 * Copyright 2026 Circle Internet Group, Inc.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Nut dung TRONG MODAL. Nut o hang hanh dong cua man toan khung dung
 * <PrimaryButton> / <IconButton> trong components/screen.tsx (chung cao theo
 * % chieu cao hang, khong theo px).
 *
 * QUY DINH:
 * - variant `primary` la hanh dong chinh (vang). Moi modal chi mot cai.
 * - `dark` chi dung cho nut trung tinh xac nhan dong y (nut Done man quet QR).
 * - `link` la chu xanh khong nen: Close / Back / Skip.
 * - Khong tu them rounded-* / bg-* o call-site. Thieu kieu thi them variant.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-extrabold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-btn",
        dark: "bg-foreground text-background shadow-btn",
        outline: "border border-border bg-background text-foreground shadow-btn",
        ghost: "text-foreground hover:bg-surface",
        link: "text-accent",
        danger: "bg-danger text-background shadow-btn",
      },
      size: {
        /** Hang trong modal: cao 40px, bo 12px, full width */
        row: "w-full h-10 rounded-xl text-[17px]",
        /** Nut chinh trong modal: cao 44px, bo 12px, full width */
        block: "w-full h-11 rounded-xl text-[17px]",
        /** Nut vien tron o hang cuoi modal (Back / Done) */
        pill: "h-10 rounded-full text-[17px] px-4",
        /** Chip vien tron (Upload photo from gallery) */
        chip: "rounded-full border border-border shadow-btn px-4 py-2 text-[15px]",
        /** Nut chi co icon */
        icon: "h-9 w-9 rounded-full",
        /** Chu khong nen (Close / Back / Skip) */
        text: "h-9 text-[17px]",
        /** Nut nho trong hang xac nhan xoa */
        sm: "h-9 rounded-xl px-3 text-[15px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "row",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
