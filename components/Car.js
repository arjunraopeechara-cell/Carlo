import { useId } from "react";

// Studio-style car drawings, standing in for licensed photos. Each faces right, same angle and scale.
// The gradients they use (sheen, glass, rim, shade) are defined once in app/layout.js.
const SHAPES = {
  sedan: { body: "M40 176C34 150 40 126 62 118L132 106C178 70 236 52 306 52C372 52 418 66 462 104L556 116C590 122 606 146 604 176Z", glass: ["M152 106C190 78 238 64 298 63L304 106Z", "M316 63C368 63 408 76 442 106L316 106Z"], seams: [310, 200, 432] },
  coupe: { body: "M40 176C34 150 42 128 60 120L150 104C200 70 250 56 306 56C360 56 404 72 452 110L562 120C592 124 606 148 604 176Z", glass: ["M176 106C216 78 254 66 296 65L296 106Z", "M308 65C360 66 396 80 428 108L308 106Z"], seams: [304, 440] },
  hatch: { body: "M60 176C52 146 54 104 70 90L104 52C116 38 146 32 200 32L316 32C368 32 402 54 442 98L546 114C580 120 598 146 596 176Z", glass: ["M116 88L136 52Q146 43 176 42L244 42L244 88Z", "M254 42L312 42C356 42 388 60 420 90L254 88Z"], seams: [249, 424] },
  suv: { body: "M36 176C30 140 34 96 50 82L86 40C98 26 120 22 150 22L366 22C396 22 424 38 456 90L556 106C590 112 608 140 606 176Z", glass: ["M98 84L120 44Q128 34 150 34L222 34L222 84Z", "M232 34L310 34L310 84L232 84Z", "M320 34L362 34C388 34 412 50 438 86L320 84Z"], seams: [227, 315, 440] },
  truck: { body: "M36 176L36 104Q36 96 44 96L232 96L250 44Q256 28 280 28L380 28C408 28 428 46 452 94L560 108C592 114 608 140 606 176Z", glass: ["M266 88L276 46Q278 38 292 38L346 38L346 88Z", "M356 38L380 38C400 38 416 54 434 88L356 88Z"], seams: [240, 351, 438] },
};
const AXLES = [150, 490];

function Wheel({ cx }) {
  return (
    <>
      <circle cx={cx} cy="172" r="38" fill="#14151A" />
      <circle cx={cx} cy="172" r="27" fill="url(#rim)" stroke="#C7CBD2" strokeWidth="3" />
      {[0, 72, 144, 216, 288].map((a) => <rect key={a} x={cx - 3.5} y="146" width="7" height="22" rx="3" fill="#E4E6EA" transform={`rotate(${a} ${cx} 172)`} />)}
      <circle cx={cx} cy="172" r="7" fill="#E4E6EA" />
    </>
  );
}

export default function Car({ type, color }) {
  const s = SHAPES[type], id = useId();
  return (
    <svg viewBox="0 0 640 228" role="img" aria-label={`${type} illustration`}>
      <ellipse cx="320" cy="212" rx="310" ry="14" fill="url(#shade)" />
      <clipPath id={id}><path d={s.body} /></clipPath>
      <path d={s.body} fill={color} />
      <g clipPath={`url(#${id})`}>
        <path d={s.body} fill="url(#sheen)" />
        <path d="M20 128C200 112 420 112 620 134" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="2.5" />
        {s.seams.map((x) => <path key={x} d={`M${x} 96V168`} stroke="#000" strokeOpacity=".28" strokeWidth="1.5" />)}
        <rect x="0" y="160" width="640" height="20" fill="#14151A" />
        <path d="M568 116L612 128V148L576 142Z" fill="#F4F6FA" />
        <path d="M30 112L74 116L70 138L30 140Z" fill="#C8182B" />
        {AXLES.map((x) => <circle key={x} cx={x} cy="172" r="46" fill="#14151A" />)}
      </g>
      {s.glass.map((d) => <path key={d} d={d} fill="url(#glass)" />)}
      <rect x={s.seams[0] + 14} y="116" width="26" height="6" rx="3" fill="#000" fillOpacity=".35" />
      {AXLES.map((x) => <Wheel key={x} cx={x} />)}
    </svg>
  );
}
