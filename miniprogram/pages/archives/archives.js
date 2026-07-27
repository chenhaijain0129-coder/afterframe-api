const app = getApp();

const toDate = (value) => value.replace(/\./g, "-");
const toRange = (start, end) => `${start.replace(/-/g, ".")} — ${end.replace(/-/g, ".")}`;

Page({
  data: { archives: [], current: null, startDate: "", endDate: "" },
  onShow() {
    const archives = wx.getStorageSync("roll-archives") || app.globalData.archives;
    const requestedId = wx.getStorageSync("roll-edit-archive") || wx.getStorageSync("roll-selected-archive") || wx.getStorageSync("roll-current-archive");
    wx.removeStorageSync("roll-edit-archive");
    this.setCurrent(archives.find((item) => item.id === requestedId) || archives[0], archives);
  },
  setCurrent(current, archives = this.data.archives) {
    if (!current) return;
    const copy = { ...current };
    const dates = (copy.range || "").split(" — ").map(toDate);
    wx.setStorageSync("roll-selected-archive", copy.id);
    wx.setStorageSync("roll-current-archive", copy.id);
    this.setData({ archives, current: copy, startDate: dates[0] || "2025-01-01", endDate: dates[1] || dates[0] || "2025-01-01" });
  },
  select(e) { this.setCurrent(this.data.archives.find((item) => item.id === e.currentTarget.dataset.id)); },
  input(e) { this.setData({ [`current.${e.currentTarget.dataset.field}`]: e.detail.value }); },
  date(e) {
    const key = e.currentTarget.dataset.key;
    const value = e.detail.value;
    const start = key === "start" ? value : this.data.startDate;
    const end = key === "end" ? value : this.data.endDate;
    if (start > end) return wx.showToast({ title: "结束日期不能早于开始日期", icon: "none" });
    this.setData({ [key === "start" ? "startDate" : "endDate"]: value, "current.range": toRange(start, end) });
  },
  pickLocation() {
    wx.chooseLocation({
      success: (res) => {
        const current = {
          ...this.data.current,
          location: res.name || res.address || "已选择地点",
          locationDetail: { name: res.name || "", address: res.address || "", latitude: res.latitude, longitude: res.longitude }
        };
        this.persistCurrent(current, "地点已更新");
      },
      fail: () => wx.showToast({ title: "未选择地点", icon: "none" })
    });
  },
  persistCurrent(current, message) {
    const archives = this.data.archives.map((item) => item.id === current.id ? current : item);
    app.globalData.archives = archives;
    wx.setStorageSync("roll-archives", archives);
    wx.setStorageSync("roll-selected-archive", current.id);
    wx.setStorageSync("roll-current-archive", current.id);
    this.setData({ archives, current });
    if (message) wx.showToast({ title: message, icon: "success" });
  },
  save() { this.persistCurrent(this.data.current, "档案已保存"); },
  deleteArchive() {
    if (this.data.archives.length <= 1) return wx.showToast({ title: "最后一卷先留在这里吧", icon: "none" });
    const archive = this.data.current;
    wx.showModal({
      title: "让这一卷谢幕？",
      content: `「${archive.title}」和其中的记录会一起离场，之后无法找回。`,
      confirmText: "让它谢幕",
      confirmColor: "#dff33b",
      success: (res) => {
        if (!res.confirm) return;
        const archives = this.data.archives.filter((item) => item.id !== archive.id);
        const entries = (wx.getStorageSync("roll-entries") || []).filter((item) => item.archiveId !== archive.id);
        const next = archives[0];
        app.globalData.archives = archives;
        wx.setStorageSync("roll-archives", archives);
        wx.setStorageSync("roll-entries", entries);
        wx.setStorageSync("roll-selected-archive", next.id);
        wx.setStorageSync("roll-current-archive", next.id);
        wx.showToast({ title: "这一卷已安静谢幕", icon: "none" });
        setTimeout(() => wx.switchTab({ url: "/pages/home/home" }), 500);
      }
    });
  }
});
