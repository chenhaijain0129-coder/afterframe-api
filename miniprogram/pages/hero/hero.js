Page({
  data: { flash: true, focusing: false },
  onLoad() { setTimeout(() => this.setData({ flash: false }), 520); },
  onReady() { this.initCamera(); },
  initCamera() {
    wx.createSelectorQuery().select("#filmCamera").fields({ node: true, size: true }).exec((result) => {
      const item = result[0]; if (!item) return;
      const dpr = wx.getSystemInfoSync().pixelRatio;
      this.canvas = item.node; this.ctx = this.canvas.getContext("2d"); this.rect = item;
      this.canvas.width = item.width * dpr; this.canvas.height = item.height * dpr; this.ctx.scale(dpr, dpr);
      this.drawCamera(0, 0, 0);
    });
  },
  rounded(ctx, x, y, width, height, radius) { ctx.beginPath(); ctx.moveTo(x + radius, y); ctx.arcTo(x + width, y, x + width, y + height, radius); ctx.arcTo(x + width, y + height, x, y + height, radius); ctx.arcTo(x, y + height, x, y, radius); ctx.arcTo(x, y, x + width, y, radius); ctx.closePath(); },
  drawCamera(tiltX, tiltY, focus) {
    if (!this.ctx) return;
    const ctx = this.ctx, width = this.rect.width, height = this.rect.height, cx = width / 2, cy = height / 2;
    ctx.clearRect(0, 0, width, height); ctx.save(); ctx.translate(cx + tiltX, cy + tiltY); ctx.rotate(tiltX / 500);
    ctx.shadowColor = "rgba(0,0,0,.52)"; ctx.shadowBlur = 28; ctx.shadowOffsetY = 18;
    const body = ctx.createLinearGradient(-250, -120, 260, 170); body.addColorStop(0, "#d1cec2"); body.addColorStop(.12, "#77786f"); body.addColorStop(.38, "#262824"); body.addColorStop(.76, "#141512"); body.addColorStop(1, "#77786f");
    // 用更大的圆角把机身处理成一台柔和的 35mm 胶片机，而不是一块硬边矩形。
    this.rounded(ctx, -270, -128, 540, 290, 76); ctx.fillStyle = body; ctx.fill(); ctx.shadowColor = "transparent"; ctx.lineWidth = 3; ctx.strokeStyle = "#bebcb0"; ctx.stroke();
    ctx.fillStyle = "#c6c3b8"; this.rounded(ctx, -205, -164, 168, 44, 22); ctx.fill(); ctx.strokeStyle = "#74756d"; ctx.stroke();
    ctx.fillStyle = "#141512"; this.rounded(ctx, -70, -185, 140, 64, 30); ctx.fill(); ctx.strokeStyle = "#a8a69a"; ctx.stroke();
    ctx.fillStyle = "#c4c1b5"; ctx.fillRect(114, -160, 48, 24); ctx.fillStyle = "#e6e3d7"; ctx.beginPath(); ctx.arc(198, -145, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#0d0e0c"; this.rounded(ctx, -238, -72, 96, 52, 16); ctx.fill(); ctx.strokeStyle = "#8d8e84"; ctx.stroke();
    const leather = ctx.createLinearGradient(-250, 0, 250, 120); leather.addColorStop(0, "#11120f"); leather.addColorStop(.5, "#272824"); leather.addColorStop(1, "#0d0e0c"); this.rounded(ctx, -250, -8, 500, 142, 30); ctx.fillStyle = leather; ctx.fill();
    for (let x = -235; x < 240; x += 12) { ctx.strokeStyle = "rgba(220,220,205,.05)"; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - 18, 126); ctx.stroke(); }
    ctx.fillStyle = "#dff33b"; ctx.font = "16px monospace"; ctx.fillText("36 EXP", 172, -72); ctx.fillStyle = "#dad7ca"; ctx.font = "16px sans-serif"; ctx.fillText("余帧", -230, -88); ctx.font = "11px monospace"; ctx.fillStyle = "#999b90"; ctx.fillText("AFTERFRAME", -184, -88);
    const ring = focus ? 112 : 100; ctx.beginPath(); ctx.arc(0, 24, ring + 22, 0, Math.PI * 2); ctx.fillStyle = "#41423d"; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = "#bebbb0"; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 24, ring, 0, Math.PI * 2); ctx.fillStyle = "#0a0b09"; ctx.fill(); ctx.lineWidth = 14; ctx.strokeStyle = "#212521"; ctx.stroke();
    const glass = ctx.createRadialGradient(-28, -14, 4, 0, 24, ring - 22); glass.addColorStop(0, "#c7f0de"); glass.addColorStop(.08, "#50796e"); glass.addColorStop(.38, "#13241f"); glass.addColorStop(1, "#010201"); ctx.beginPath(); ctx.arc(0, 24, ring - 24, 0, Math.PI * 2); ctx.fillStyle = glass; ctx.fill();
    ctx.fillStyle = "rgba(255,255,245,.72)"; ctx.beginPath(); ctx.arc(-38, -20, 13, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#adaea3"; ctx.font = "10px monospace"; ctx.fillText("50mm · 1:1.8", -37, -69); ctx.fillText("∞ · 8 · 4 · 2", -32, 116);
    ctx.restore();
  },
  startMove(e) { const touch = e.touches[0]; this.start = { x: touch.clientX, y: touch.clientY }; },
  moveCamera(e) { if (!this.start) return; const touch = e.touches[0]; this.drawCamera((touch.clientX - this.start.x) * .22, (touch.clientY - this.start.y) * .12, 1); this.setData({ focusing: true }); },
  endMove() { this.start = null; this.setData({ focusing: false }); this.drawCamera(0, 0, 0); },
  capture() { if (this.data.flash) return; wx.vibrateShort({ type: "light" }); this.setData({ flash: true }); setTimeout(() => { this.setData({ flash: false }); wx.redirectTo({ url: "/pages/loading/loading" }); }, 520); }
});
