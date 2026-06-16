import React from 'react';

export default function AnimatedLogo({ size = 200, color = '#000000', className = '', style = {} }) {
  const uid = React.useId().replace(/:/g, 'r');
  const clipF   = `lf-${uid}`;
  const clipDot = `ld-${uid}`;

  // Path lengths in LOCAL coordinate space (before each path's transform):
  // - Horizontal line: path goes M≈0,9 L 1557.817,9  → length ≈ 1557.817
  // - Vertical line:   path goes M≈0,9 L 1860.891,9  → length ≈ 1860.891
  //   (matrix(0,−0.75,0.75,0,…) rotates it into a vertical stroke in viewport space)
  const H_LEN = 1557.817;
  const V_LEN = 1860.891;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1500 1500"
      width={size}
      height={size}
      className={className}
      style={{ color, display: 'block', ...style }}
      aria-label="Finia"
    >
      <defs>
        <clipPath id={clipF}>
          <rect x="0" y="0" width="768" height="1248" />
        </clipPath>
        <clipPath id={clipDot}>
          <rect x="0" y="0" width="239" height="1332" />
        </clipPath>

        <style>{`
          /* F + dot: fade in on mount */
          .${uid}-letter {
            opacity: 0;
            animation: ${uid}FadeIn 0.3s ease both;
          }

          /* Orange lines: stroke-dashoffset draw */
          .${uid}-h {
            stroke-dasharray: ${H_LEN} ${H_LEN};
            stroke-dashoffset: ${H_LEN};
            animation: ${uid}Draw 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.18s forwards;
          }
          .${uid}-v {
            stroke-dasharray: ${V_LEN} ${V_LEN};
            stroke-dashoffset: ${V_LEN};
            animation: ${uid}Draw 0.65s cubic-bezier(0.4, 0, 0.2, 1) 0.32s forwards;
          }

          @keyframes ${uid}FadeIn {
            to { opacity: 1; }
          }
          @keyframes ${uid}Draw {
            to { stroke-dashoffset: 0; }
          }
        `}</style>
      </defs>

      {/* ── F letter (black / currentColor) ─────────────────────── */}
      <g className={`${uid}-letter`} transform="matrix(1,0,0,1,202,138)">
        <g clipPath={`url(#${clipF})`}>
          <g fill="currentColor" fillOpacity="1">
            <g transform="translate(0.661705,1003.773451)">
              <path d="M 84.8125 -788.515625 L 722.046875 -788.515625 L 722.046875 -599.40625 L 338.09375 -599.40625 L 338.09375 -464.171875 L 668.171875 -464.171875 L 668.171875 -283.078125 L 338.09375 -283.078125 L 338.09375 0 L 84.8125 0 Z" />
            </g>
          </g>
        </g>
      </g>

      {/* ── Dot (circle drawn as beziers, currentColor) ──────────── */}
      <g className={`${uid}-letter`} transform="matrix(1,0,0,1,909,38)">
        <g clipPath={`url(#${clipDot})`}>
          <g fill="currentColor" fillOpacity="1">
            <g transform="translate(2.071888,1083.408616)">
              <path d="M 25.421875 -70.96875 C 25.421875 -94.269531 34.070312 -114.921875 51.375 -132.921875 C 68.675781 -150.929688 89.679688 -159.9375 114.390625 -159.9375 C 138.398438 -159.9375 159.226562 -151.109375 176.875 -133.453125 C 194.53125 -115.804688 203.359375 -94.976562 203.359375 -70.96875 C 203.359375 -45.539062 194.707031 -24.175781 177.40625 -6.875 C 160.113281 10.414062 139.109375 19.0625 114.390625 19.0625 C 90.378906 19.0625 69.546875 10.585938 51.890625 -6.359375 C 34.242188 -23.304688 25.421875 -44.84375 25.421875 -70.96875 Z" />
            </g>
          </g>
        </g>
      </g>

      {/* ── Horizontal orange line ────────────────────────────────── */}
      <path
        className={`${uid}-h`}
        strokeLinecap="butt"
        strokeLinejoin="miter"
        strokeMiterlimit="4"
        transform="matrix(0.75,0,0,0.75,172.059175,1144.054801)"
        fill="none"
        stroke="#ff6b35"
        strokeWidth="18"
        d="M -0.000774373 8.999849 L 1557.817068 8.999849"
      />

      {/* ── Vertical orange line ──────────────────────────────────── */}
      <path
        className={`${uid}-v`}
        strokeLinecap="butt"
        strokeLinejoin="miter"
        strokeMiterlimit="4"
        transform="matrix(0,-0.75,0.75,0,924.20369,1447.827983)"
        fill="none"
        stroke="#ff6b35"
        strokeWidth="18"
        d="M -0.000188942 8.999248 L 1860.890596 8.999248"
      />
    </svg>
  );
}
