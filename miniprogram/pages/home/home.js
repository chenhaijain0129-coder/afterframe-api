const app = getApp();
Page({
  data: { archives: [], current: null, selectedId: "" },
  onLoad() { this.refresh(); }, onShow() { this.refresh(); },
  refresh() {
    const archives = wx.getStorageSync("roll-archives") || app.globalData.archives;
    const savedId = wx.getStorageSync("roll-selected-archive") || wx.getStorageSync("roll-current-archive");
    const current = archives.find((item) => item.id === savedId) || archives[0];
    this.setData({ archives, current, selectedId: savedId || "" });
  },
  selectArchive(e) { const id = e.currentTarget.dataset.id; if (this.data.selectedId === id) return wx.navigateTo({ url: `/pages/detail/detail?id=${id}` }); wx.setStorageSync("roll-selected-archive", id); wx.setStorageSync("roll-current-archive", id); this.refresh(); },
  editArchive(e) { wx.setStorageSync("roll-edit-archive", e.currentTarget.dataset.id || this.data.current.id); wx.switchTab({ url: "/pages/archives/archives" }); }
});
