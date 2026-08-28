/* =====================================================================
   15-donut.js — Hàm dựng biểu đồ donut (SVG) dùng chung
   
   ===================================================================== */

/* ===================== DONUT ===================== */
function buildDonut(segments, opts) {
  opts = opts || {};
  const size = opts.size || 148;
  const thickness = opts.thickness || 20;
  const centerLabel = opts.centerLabel || "";
  const centerSub = opts.centerSub || "";
  const total = segments.reduce((a, s) => a + s.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  let circles = "";
  if (total <= 0) {
    circles = `<circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="var(--border)" stroke-width="${thickness}"/>`;
  } else {
    segments.forEach((seg) => {
      if (seg.value <= 0) return;
      const frac = seg.value / total;
      const dash = frac * circumference;
      circles += `<circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="var(--${seg.color})" stroke-width="${thickness}" stroke-dasharray="${dash} ${circumference - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${size / 2} ${size / 2})"/>`;
      offset += dash;
    });
  }
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="flex-shrink:0">
      ${circles}
      <text x="50%" y="46%" text-anchor="middle" class="mono" style="font-size:22px;font-weight:700;fill:var(--text)">${escapeHtml(centerLabel)}</text>
      <text x="50%" y="63%" text-anchor="middle" style="font-size:9.5px;fill:var(--text-faint)">${escapeHtml(centerSub)}</text>
    </svg>
  `;
}
