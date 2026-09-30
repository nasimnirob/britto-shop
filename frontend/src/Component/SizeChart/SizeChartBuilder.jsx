import React from "react";
import { Plus, Trash2, X } from "lucide-react";

const SizeChartBuilder = ({
    headers = [],
    rows = [],
    unit = "inch",
    disabled = false,
    onChange,
}) => {
    const updateHeader = (index, value) => {
        const oldKey = headers[index];
        const newKey = value;

        const newHeaders = [...headers];
        newHeaders[index] = newKey;

        const newRows = rows.map((row) => {
            const copy = { ...row };
            copy[newKey] = copy[oldKey] || "";
            if (oldKey !== newKey) delete copy[oldKey];
            return copy;
        });

        onChange({ headers: newHeaders, rows: newRows });
    };

    const addColumn = () => {
        const key = `Column ${headers.length + 1}`;
        onChange({
            headers: [...headers, key],
            rows: rows.map((r) => ({ ...r, [key]: "" })),
        });
    };

    const removeColumn = (index) => {
        if (headers.length <= 2) return;
        const key = headers[index];
        const newHeaders = headers.filter((_, i) => i !== index);
        const newRows = rows.map((row) => {
            const copy = { ...row };
            delete copy[key];
            return copy;
        });
        onChange({ headers: newHeaders, rows: newRows });
    };

    const addRow = () => {
        const empty = Object.fromEntries(headers.map((h) => [h, ""]));
        onChange({ rows: [...rows, empty] });
    };

    const removeRow = (index) => {
        if (rows.length <= 1) return;
        onChange({ rows: rows.filter((_, i) => i !== index) });
    };

    const updateCell = (rowIndex, key, value) => {
        const newRows = [...rows];
        newRows[rowIndex] = { ...newRows[rowIndex], [key]: value };
        onChange({ rows: newRows });
    };

    return (
        <div className="space-y-4">
            {/* Unit */}
            <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                    Unit
                </label>
                <select
                    value={unit}
                    disabled={disabled}
                    onChange={(e) => onChange({ unit: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none dark:border-white/10 dark:bg-white/5"
                >
                    <option value="inch">inch</option>
                    <option value="cm">cm</option>
                </select>
            </div>

            {/* Table Builder */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-white/10">
                <table className="w-full border-collapse">
                    <thead className="bg-[#393635] text-white">
                        <tr>
                            {headers.map((h, i) => (
                                <th key={i} className="p-2">
                                    <div className="flex items-center gap-1">
                                        <input
                                            value={h}
                                            disabled={disabled}
                                            onChange={(e) =>
                                                updateHeader(i, e.target.value)
                                            }
                                            className="w-full bg-transparent text-center text-[11px] font-semibold uppercase text-white outline-none"
                                        />
                                        {headers.length > 2 && (
                                            <button
                                                type="button"
                                                disabled={disabled}
                                                onClick={() => removeColumn(i)}
                                                className="shrink-0 text-red-300 hover:text-red-500"
                                            >
                                                <X size={12} />
                                            </button>
                                        )}
                                    </div>
                                </th>
                            ))}
                            <th className="w-8" />
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((row, ri) => (
                            <tr
                                key={ri}
                                className={
                                    ri % 2 === 0
                                        ? "bg-white dark:bg-transparent"
                                        : "bg-[#f0f8ff] dark:bg-white/5"
                                }
                            >
                                {headers.map((h, ci) => (
                                    <td
                                        key={ci}
                                        className="border border-white/40 p-1"
                                    >
                                        <input
                                            value={row[h] || ""}
                                            disabled={disabled}
                                            onChange={(e) =>
                                                updateCell(
                                                    ri,
                                                    h,
                                                    e.target.value
                                                )
                                            }
                                            className="w-full bg-transparent p-1 text-center text-xs text-gray-700 outline-none dark:text-gray-200"
                                        />
                                    </td>
                                ))}
                                <td className="border border-white/40 p-1 text-center">
                                    {rows.length > 1 && (
                                        <button
                                            type="button"
                                            disabled={disabled}
                                            onClick={() => removeRow(ri)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={addRow}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-[var(--text)] hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10"
                >
                    <Plus size={14} /> Add Size Row
                </button>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={addColumn}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-[var(--text)] hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10"
                >
                    <Plus size={14} /> Add Column
                </button>
            </div>
        </div>
    );
};

export default SizeChartBuilder;