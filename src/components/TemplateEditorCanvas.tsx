"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, FabricImage, Textbox } from "fabric";

import type { FieldKey, TemplateField } from "@/lib/types";

const FIELD_LABELS: Record<FieldKey, string> = {
  payee: "Payee Name",
  amountNumber: "Amount Number",
  amountWords: "Amount in Words",
  date: "Date",
};

const FIELD_ORDER: FieldKey[] = ["payee", "amountNumber", "amountWords", "date"];

type Props = {
  imageUrl: string;
  baseWidth?: number;
  baseHeight?: number;
  initialFields: TemplateField[];
  onFieldsChange: (fields: TemplateField[]) => void;
};

type FabricTextbox = Textbox & { fieldKey?: FieldKey };

export function TemplateEditorCanvas({
  imageUrl,
  baseWidth = 1000,
  baseHeight = 450,
  initialFields,
  onFieldsChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<Canvas | null>(null);
  const backgroundImageRef = useRef<FabricImage | null>(null);
  const hasInitializedRef = useRef(false);
  const [canvasWidth, setCanvasWidth] = useState(baseWidth);
  const canvasHeight = useMemo(
    () => Math.round((canvasWidth / baseWidth) * baseHeight),
    [baseHeight, baseWidth, canvasWidth]
  );

  const syncFields = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const fields = canvas
      .getObjects()
      .filter((obj) => obj.type === "textbox")
      .map((obj) => obj as FabricTextbox)
      .filter((obj) => obj.fieldKey)
      .map((obj) => {
        const key = obj.fieldKey as FieldKey;
        return {
          key,
          label: obj.text || FIELD_LABELS[key],
          x: ((obj.left || 0) / canvasWidth) * baseWidth,
          y: ((obj.top || 0) / canvasHeight) * baseHeight,
          fontSize: obj.fontSize || 24,
          width: (((obj.width || 260) * (obj.scaleX || 1)) / canvasWidth) * baseWidth,
          color: (obj.fill as string) || "#111111",
        } satisfies TemplateField;
      });

    onFieldsChange(fields);
  }, [baseHeight, baseWidth, canvasHeight, canvasWidth, onFieldsChange]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const width = Math.min(Math.floor(entries[0].contentRect.width), baseWidth);
      setCanvasWidth(width || baseWidth);
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [baseWidth]);

  useEffect(() => {
    if (!canvasElementRef.current || canvasRef.current) return;

    const canvas = new Canvas(canvasElementRef.current, {
      selection: true,
      preserveObjectStacking: true,
      enableRetinaScaling: false,
    });
    canvasRef.current = canvas;

    return () => {
      canvas.dispose();
      canvasRef.current = null;
      backgroundImageRef.current = null;
      hasInitializedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setDimensions({ width: canvasWidth, height: canvasHeight });
    canvas.setZoom(1);

    const backgroundImage = backgroundImageRef.current;
    if (backgroundImage) {
      backgroundImage.set({
        scaleX: canvasWidth / (backgroundImage.width || baseWidth),
        scaleY: canvasHeight / (backgroundImage.height || baseHeight),
      });
      canvas.requestRenderAll();
    }
  }, [baseHeight, baseWidth, canvasHeight, canvasWidth]);

  useEffect(() => {
    const load = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const image = await FabricImage.fromURL(imageUrl);
      backgroundImageRef.current = image;
      image.selectable = false;
      image.evented = false;
      image.set({
        left: 0,
        top: 0,
        originX: "left",
        originY: "top",
        scaleX: canvasWidth / Math.max(image.width || baseWidth, 1),
        scaleY: canvasHeight / Math.max(image.height || baseHeight, 1),
      });
      canvas.backgroundImage = image;
      canvas.requestRenderAll();

      if (!hasInitializedRef.current) {
        initialFields.forEach((field) => {
          const text = new Textbox(field.label, {
            left: (field.x / baseWidth) * canvasWidth,
            top: (field.y / baseHeight) * canvasHeight,
            fontSize: field.fontSize,
            width: (field.width / baseWidth) * canvasWidth,
            fill: field.color,
            editable: true,
          }) as FabricTextbox;
          text.fieldKey = field.key;
          canvas.add(text);
        });
        hasInitializedRef.current = true;
      }
      syncFields();
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handler = () => syncFields();
    canvas.on("object:modified", handler);
    canvas.on("object:moving", handler);
    canvas.on("object:scaling", handler);

    return () => {
      canvas.off("object:modified", handler);
      canvas.off("object:moving", handler);
      canvas.off("object:scaling", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasWidth, canvasHeight]);

  const addField = (key: FieldKey) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const exists = canvas
      .getObjects()
      .filter((obj) => obj.type === "textbox")
      .some((obj) => (obj as FabricTextbox).fieldKey === key);

    if (exists) return;

    const textbox = new Textbox(FIELD_LABELS[key], {
      left: canvasWidth * 0.2,
      top: canvasHeight * 0.2,
      fontSize: 24,
      width: canvasWidth * 0.28,
      fill: "#111111",
      editable: true,
    }) as FabricTextbox;

    textbox.fieldKey = key;
    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    canvas.requestRenderAll();
    syncFields();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FIELD_ORDER.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => addField(key)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm hover:bg-slate-50"
          >
            Add Field: {FIELD_LABELS[key]}
          </button>
        ))}
      </div>

      <div ref={containerRef} className="w-full overflow-auto rounded-xl border border-slate-200 bg-white p-3">
        <canvas ref={canvasElementRef} />
      </div>
    </div>
  );
}
