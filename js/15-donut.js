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
  const overdueCount = opts.overdueCount || 0;
  const total = opts.total !== undefined ? opts.total : segments.reduce((a, s) => a + s.value, 0);

  // Vòng chính bên trong (Main Ring) và Vòng cảnh báo Quá hạn bên ngoài (Outer Accent Ring)
  const showOverdueRing = overdueCount > 0 && total > 0;
  const outerGap = opts.outerGap !== undefined ? opts.outerGap : (size >= 120 ? 4 : 2);
  const outerThickness = opts.outerThickness !== undefined ? opts.outerThickness : (size >= 120 ? 4 : 2.5);

  // Đảm bảo tổng đường kính tính cả outerRing + nửa stroke không vượt quá viewBox (size)
  const margin = showOverdueRing ? (outerThickness + 1) : 1;
  const outerRadius = (size / 2) - margin;
  const radius = showOverdueRing
    ? outerRadius - (outerThickness / 2) - outerGap - (thickness / 2)
    : (size - thickness) / 2;

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

  // Vòng cảnh báo Quá hạn bên ngoài (Outer Accent Ring - Đỏ)
  let outerRing = "";
  if (showOverdueRing) {
    const outerCircumference = 2 * Math.PI * outerRadius;
    const overdueFrac = Math.min(1, overdueCount / total);
    const overdueDash = overdueFrac * outerCircumference;
    const overdueTitle = `${t ? t("overdue") : "Quá hạn"}: ${overdueCount}/${total} (${Math.round(overdueFrac * 100)}%)`;

    outerRing = `
      <g class="donut-overdue-group">
        <title>${escapeHtml(overdueTitle)}</title>
        <circle cx="${size / 2}" cy="${size / 2}" r="${outerRadius}" fill="none" stroke="var(--red-soft)" stroke-width="${outerThickness}"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${outerRadius}" fill="none" stroke="var(--red)" stroke-width="${outerThickness}" stroke-linecap="round" stroke-dasharray="${overdueDash} ${outerCircumference - overdueDash}" stroke-dashoffset="0" transform="rotate(-90 ${size / 2} ${size / 2})"/>
      </g>
    `;
  }

  const centerFontSize = Math.max(12, Math.round(size * 0.15));
  const subFontSize = Math.max(8, Math.round(size * 0.065));

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="flex-shrink:0" aria-label="Donut Chart">
      ${circles}
      ${outerRing}
      <text x="50%" y="${centerSub ? '46%' : '52%'}" text-anchor="middle" dominant-baseline="${centerSub ? 'auto' : 'middle'}" class="mono" style="font-size:${centerFontSize}px;font-weight:700;fill:var(--text)">${escapeHtml(centerLabel)}</text>
      ${centerSub ? `<text x="50%" y="63%" text-anchor="middle" style="font-size:${subFontSize}px;fill:var(--text-faint)">${escapeHtml(centerSub)}</text>` : ""}
    </svg>
  `;
}
