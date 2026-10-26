"use client";

/**
 * A purely decorative, deterministic "QR code" for the mock Scan & Pay demo.
 * Not a real, scannable code — it just looks the part. A fixed seed keeps the
 * pattern stable across renders (no hydration mismatch).
 */
export default function FakeQR({
  size = 168,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const N = 25; // modules per side
  const cell = size / N;

  // Deterministic pseudo-random fill.
  const filled = (r: number, c: number) => {
    const v = Math.sin((r + 1) * 12.9898 + (c + 1) * 78.233) * 43758.5453;
    return (v - Math.floor(v)) > 0.5;
  };

  // Three finder squares (top-left, top-right, bottom-left).
  const inFinder = (r: number, c: number) => {
    const zones = [
      [0, 0],
      [0, N - 7],
      [N - 7, 0],
    ];
    return zones.some(([fr, fc]) => r >= fr && r < fr + 7 && c >= fc && c < fc + 7);
  };

  const cells: { r: number; c: number }[] = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (!inFinder(r, c) && filled(r, c)) cells.push({ r, c });
    }
  }

  const Finder = ({ fr, fc }: { fr: number; fc: number }) => (
    <>
      <rect x={fc * cell} y={fr * cell} width={cell * 7} height={cell * 7} rx={cell} fill="#1A1A1A" />
      <rect
        x={(fc + 1) * cell}
        y={(fr + 1) * cell}
        width={cell * 5}
        height={cell * 5}
        rx={cell * 0.8}
        fill="#fff"
      />
      <rect
        x={(fc + 2) * cell}
        y={(fr + 2) * cell}
        width={cell * 3}
        height={cell * 3}
        rx={cell * 0.6}
        fill="#1A1A1A"
      />
    </>
  );

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={className}
      shapeRendering="crispEdges"
    >
      <rect width={size} height={size} fill="#fff" />
      {cells.map(({ r, c }) => (
        <rect
          key={`${r}-${c}`}
          x={c * cell + cell * 0.08}
          y={r * cell + cell * 0.08}
          width={cell * 0.84}
          height={cell * 0.84}
          rx={cell * 0.2}
          fill="#1A1A1A"
        />
      ))}
      <Finder fr={0} fc={0} />
      <Finder fr={0} fc={N - 7} />
      <Finder fr={N - 7} fc={0} />
    </svg>
  );
}
