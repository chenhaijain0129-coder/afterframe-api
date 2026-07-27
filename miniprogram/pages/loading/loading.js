Page({
  data: { frame: "01", progress: 0 },
  onLoad() {
    let value = 0;
    this.timer = setInterval(() => { value += 8; this.setData({ progress: Math.min(value, 100), frame: String(Math.min(36, Math.ceil(value / 3))).padStart(2, "0") }); }, 90);
    setTimeout(() => { clearInterval(this.timer); wx.switchTab({ url: "/pages/home/home" }); }, 1200);
  },
  onUnload() { clearInterval(this.timer); }
});
