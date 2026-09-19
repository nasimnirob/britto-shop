const sizes = [
  {
    size: "M",
    chest: "40",
    length: "27",
    sleeve: "23.5",
    cuffOpening: "3.5",
    bottom: "38",
    shoulder: "17",
  },
  {
    size: "L",
    chest: "42",
    length: "28",
    sleeve: "24",
    cuffOpening: "3.5",
    bottom: "38.5",
    shoulder: "17.5",
  },
  {
    size: "XL",
    chest: "44",
    length: "29",
    sleeve: "24.5",
    cuffOpening: "4",
    bottom: "40",
    shoulder: "18",
  },
  {
    size: "XXL",
    chest: "46",
    length: "30",
    sleeve: "25",
    cuffOpening: "4",
    bottom: "42",
    shoulder: "19",
  },
];

export default function SizeChart() {
  const headers = [
    "Size",
    "Chest",
    "Length",
    "Sleeve",
    "Cuff Opening",
    "Bottom",
    "Shoulder",
  ];

  return (
    <div className="w-full max-w-md py-2 sm:py-1">
      <div className="w-full overflow-hidden rounded-lg border border-b-0 border-white/80 bg-white shadow-sm">
        <table className="w-full table-fixed border-collapse">
          {/* Header */}
          <thead>
            <tr className="bg-[#393635]">
              {headers.map((header, index) => (
                <th
                  key={header}
                  className={`
                    whitespace-normal
                    px-1
                    py-2
                    text-center
                    text-[8px]
                    font-semibold
                    uppercase
                    leading-tight
                    tracking-[0.02em]
                    text-white

                    sm:px-1.5
                    sm:py-2.5
                    sm:text-[10px]
                    sm:tracking-[0.04em]

                    ${
                      index !== headers.length - 1
                        ? "border-r border-white/30"
                        : ""
                    }
                  `}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {sizes.map((item, index) => (
              <tr
                key={item.size}
                className={
                  index % 2 === 0
                    ? "bg-white"
                    : "bg-[#f0f8ff]"
                }
              >
                {/* Size */}
                <td className="border-b border-r border-white/80 px-1 py-2 text-center sm:px-1.5 sm:py-3">
                  <span
                    className="
                      inline-flex
                      min-w-[27px]
                      items-center
                      justify-center
                      rounded-[4px]
                      bg-[#73716d]
                      px-1.5
                      py-0.5
                      text-[10px]
                      font-semibold
                      leading-tight
                      text-white

                      sm:min-w-[32px]
                      sm:px-2
                      sm:py-1
                      sm:text-xs
                    "
                  >
                    {item.size}
                  </span>
                </td>

                {/* Chest */}
                <td className="border-b border-r border-white/80 px-1 py-2 text-center text-[10px] text-gray-700 sm:px-1.5 sm:py-3 sm:text-xs">
                  {item.chest}
                </td>

                {/* Length */}
                <td className="border-b border-r border-white/80 px-1 py-2 text-center text-[10px] text-gray-700 sm:px-1.5 sm:py-3 sm:text-xs">
                  {item.length}
                </td>

                {/* Sleeve */}
                <td className="border-b border-r border-white/80 px-1 py-2 text-center text-[10px] text-gray-700 sm:px-1.5 sm:py-3 sm:text-xs">
                  {item.sleeve}
                </td>

                {/* Cuff Opening */}
                <td className="border-b border-r border-white/80 px-1 py-2 text-center text-[10px] text-gray-700 sm:px-1.5 sm:py-3 sm:text-xs">
                  {item.cuffOpening}
                </td>

                {/* Bottom */}
                <td className="border-b border-r border-white/80 px-1 py-2 text-center text-[10px] text-gray-700 sm:px-1.5 sm:py-3 sm:text-xs">
                  {item.bottom}
                </td>

                {/* Shoulder */}
                <td className="border-b border-white/80 px-1 py-2 text-center text-[10px] text-gray-700 sm:px-1.5 sm:py-3 sm:text-xs">
                  {item.shoulder}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
