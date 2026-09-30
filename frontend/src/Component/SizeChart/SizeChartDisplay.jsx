import React, { useState } from "react";

const INCH_TO_CM = 2.54;

const convertValue = (value, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return value;

    const num = parseFloat(value);

    // Not a number → return as is (e.g. "M", "L", "XL")
    if (isNaN(num)) return value;

    const converted =
        fromUnit === "inch" && toUnit === "cm"
            ? num * INCH_TO_CM
            : num / INCH_TO_CM;

    // Round to 1 decimal, remove trailing ".0"
    const rounded = Math.round(converted * 10) / 10;

    return String(rounded);
};

const SizeChartDisplay = ({ chart }) => {
    // চার্টের default unit
    const chartUnit = chart?.unit || "inch";

    // User-selected unit (initially chart's unit)
    const [unit, setUnit] = useState(chartUnit);

    if (!chart) return null;

    const isImage = chart.type === "image" && chart.image;
    const isCustom =
        chart.type === "custom" &&
        chart.headers?.length > 0 &&
        chart.rows?.length > 0;

    if (!isImage && !isCustom) return null;

    // ---------- IMAGE CHART ----------
    if (isImage) {
        return (
            <div className="w-full">
                <img
                    src={chart.image}
                    alt={chart.name}
                    className="w-full max-w-[460px] rounded-md border border-gray-200 object-contain dark:border-gray-700"
                />
            </div>
        );
    }

    // ---------- CUSTOM CHART ----------
    return (
        <div className="w-full max-w-[460px]">
            {/* Unit Toggle */}
            <div className=" flex items-center justify-between gap-3">
                {/* <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Measurements in:
                </p> */}

                <div className="inline-flex overflow-hidden rounded-t-md border border-b-0 border-gray-300 dark:border-gray-600">
                    {["inch", "cm"].map((option) => {
                        const active = unit === option;

                        return (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setUnit(option)}
                                className={`px-3 py-1 text-[11px] font-medium uppercase transition ${active
                                        ? "bg-[#393635] text-white dark:bg-white dark:text-gray-900"
                                        : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/10"
                                    }`}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-md rounded-tl-none border border-gray-200 dark:border-gray-700">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#393635]">
                            {chart.headers.map((header, index) => (
                                <th
                                    key={header}
                                    className={`whitespace-normal px-1 py-2 text-center text-[8px] font-semibold uppercase leading-tight tracking-[0.02em] text-white sm:px-1.5 sm:py-2.5 sm:text-[10px] ${index !== chart.headers.length - 1
                                            ? "border-r border-white/30"
                                            : ""
                                        }`}
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {chart.rows.map((row, ri) => (
                            <tr
                                key={ri}
                                className={
                                    ri % 2 === 0
                                        ? "bg-white dark:bg-[#252728]"
                                        : "bg-[#f0f8ff] dark:bg-white/5"
                                }
                            >
                                {chart.headers.map((h, ci) => {
                                    const isSizeCol =
                                        String(h)
                                            .trim()
                                            .toLowerCase() === "size";

                                    // size column → don't convert
                                    // other columns → convert unit
                                    const displayValue = isSizeCol
                                        ? row[h]
                                        : convertValue(
                                            row[h],
                                            chartUnit,
                                            unit
                                        );

                                    return (
                                        <td
                                            key={h}
                                            className={`border-b border-gray-200 px-1 py-2 text-center text-[10px] text-gray-700 sm:px-1.5 sm:py-3 sm:text-xs dark:border-gray-700 dark:text-gray-200 ${ci !==
                                                    chart.headers.length - 1
                                                    ? "border-r border-gray-200 dark:border-gray-700"
                                                    : ""
                                                }`}
                                        >
                                            {isSizeCol ? (
                                                <span className="inline-flex min-w-[27px] items-center justify-center rounded-[4px] bg-[#73716d] px-1.5 py-0.5 text-[10px] font-semibold leading-tight text-white sm:min-w-[32px] sm:px-2 sm:py-1 sm:text-xs">
                                                    {row[h]}
                                                </span>
                                            ) : (
                                                displayValue
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer note */}
            {/* <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                {unit === chartUnit
                    ? `All measurements are in ${chartUnit}.`
                    : `Converted from ${chartUnit} to ${unit}.`}
            </p> */}
        </div>
    );
};

export default SizeChartDisplay;