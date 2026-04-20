"use client";

import Image from "next/image";

import type { Template } from "@/lib/types";

type Values = {
  payee: string;
  amountNumber: string;
  amountWords: string;
  date: string;
};

type Props = {
  template: Template;
  values: Values;
  offsetXMM?: number;
  offsetYMM?: number;
  printable?: boolean;
};

export function ChequePreview({
  template,
  values,
  offsetXMM = 0,
  offsetYMM = 0,
  printable = false,
}: Props) {
  const ratio = (template.baseHeight / template.baseWidth) * 100;

  return (
    <div
      className={printable ? "print-sheet" : "w-full max-w-5xl"}
      style={
        printable
          ? {
              width: `${template.widthMM}mm`,
              height: `${template.heightMM}mm`,
              transform: `translate(${offsetXMM}mm, ${offsetYMM}mm)`,
            }
          : undefined
      }
    >
      <div className={printable ? "relative h-full w-full" : "relative w-full"} style={!printable ? { paddingTop: `${ratio}%` } : undefined}>
        <Image
          src={template.imageUrl}
          alt={`${template.bankName} cheque`}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />

        {template.fields.map((field) => {
          const value = values[field.key] || "";
          return (
            <div
              key={field.key}
              className="absolute whitespace-pre-wrap"
              style={{
                left: `${(field.x / template.baseWidth) * 100}%`,
                top: `${(field.y / template.baseHeight) * 100}%`,
                width: `${(field.width / template.baseWidth) * 100}%`,
                color: field.color,
                fontSize: `${(field.fontSize / template.baseHeight) * 100}%`,
                lineHeight: 1.1,
                transform: "translateY(-50%)",
              }}
            >
              {value}
            </div>
          );
        })}
      </div>
    </div>
  );
}
