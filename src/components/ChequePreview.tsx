"use client";

import Image from "next/image";

import type { Template } from "@/lib/types";

type Values = {
  payee: string;
  amountNumber: string;
  amountWords: string;
  date: string;
  issuerName?: string;
  issuerPosition?: string;
};

type Props = {
  template: Template;
  values: Values;
  offsetXMM?: number;
  offsetYMM?: number;
  printable?: boolean;
  showBackground?: boolean;
};

export function ChequePreview({
  template,
  values,
  offsetXMM = 0,
  offsetYMM = 0,
  printable = false,
  showBackground = true,
}: Props) {
  const ratio = (template.baseHeight / template.baseWidth) * 100;
  const alignment = template.alignment || "left";
  const fontFamily = template.font?.family || "Arial";
  const fontSize = template.font?.size || 24;

  return (
    <div
      id={printable ? "cheque-print-root" : undefined}
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
      <div
        className={printable ? "relative h-full w-full" : "relative w-full"}
        style={!printable ? { paddingTop: `${ratio}%` } : undefined}
      >
        {showBackground ? (
          <Image
            src={template.imageUrl}
            alt={`${template.bankName} cheque`}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : null}

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
                fontFamily,
                textAlign: alignment,
                fontSize: `${(Math.max(field.fontSize, fontSize) / template.baseHeight) * 100}%`,
                lineHeight: 1.1,
                transform: "translateY(-50%)",
              }}
            >
              {value}
            </div>
          );
        })}

        {template.signaturePosition ? (
          <div
            className="absolute whitespace-pre-wrap"
            style={{
              left: `${(template.signaturePosition.x / template.baseWidth) * 100}%`,
              top: `${(template.signaturePosition.y / template.baseHeight) * 100}%`,
              width: "28%",
              color: "#111111",
              fontFamily,
              textAlign: alignment,
              fontSize: `${(fontSize / template.baseHeight) * 100}%`,
              lineHeight: 1.2,
              transform: "translateY(-50%)",
            }}
          >
            {(values.issuerName || template.issuerName || "").trim()}
            {(values.issuerPosition || template.issuerPosition || "").trim()
              ? `\n${(values.issuerPosition || template.issuerPosition || "").trim()}`
              : ""}
          </div>
        ) : null}
      </div>
    </div>
  );
}
