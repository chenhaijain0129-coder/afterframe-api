const app = getApp();
const normalisePhotos = (entry) => (entry.photos || entry.images || []).map((photo, index) => typeof photo === "string" ? { id: `${entry.id || entry.date}-${index}`, url: photo, uploadedAt: entry.uploadedAt } : photo);

Page({
  data: { archive: null, entries: [] },
  onLoad(q) { this.archiveId = q.id; this.refresh(); },
  onShow() { this.refresh(); },
  refresh() {
    const archives = wx.getStorageSync("roll-archives") || app.globalData.archives;
    const archive = archives.find((item) => item.id === this.archiveId);
    const entries = (wx.getStorageSync("roll-entries") || []).filter((item) => item.archiveId === this.archiveId).map((item, index) => ({ ...item, id: item.id || `legacy-${item.date || index}`, photos: normalisePhotos(item), activePhoto: 0 }));
    this.setData({ archive, entries });
  },
  stackChange(e) { const index = this.data.entries.findIndex((item) => item.id === e.currentTarget.dataset.entryId); if (index >= 0) this.setData({ [`entries[${index}].activePhoto`]: e.detail.current }); },
  openAlbum(e) { wx.navigateTo({ url: `/pages/album/album?archiveId=${this.archiveId}&entryId=${e.currentTarget.dataset.entryId}` }); },
  photoMenu(e) {
    this.menuEntryId = e.currentTarget.dataset.entryId; this.menuPhotoId = e.currentTarget.dataset.photoId;
    wx.showActionSheet({
      itemList: ["设为档案封面", "加入情绪卡片", "删除这张图片"],
      success: (res) => { if (res.tapIndex === 0) this.setCover(); if (res.tapIndex === 1) this.addMoodCard(); if (res.tapIndex === 2) this.deletePhoto(); }
    });
  },
  setCover() {
    const entry = this.data.entries.find((item) => item.id === this.menuEntryId); const photo = normalisePhotos(entry).find((item) => item.id === this.menuPhotoId);
    if (!photo) return;
    const archives = (wx.getStorageSync("roll-archives") || app.globalData.archives).map((item) => item.id === this.archiveId ? { ...item, cover: photo.url, coverPhotoId: photo.id } : item);
    app.globalData.archives = archives; wx.setStorageSync("roll-archives", archives); wx.showToast({ title: "已设为档案封面", icon: "success" }); this.refresh();
  },
  addMoodCard() { this.updateEntry((entry) => ({ ...entry, isMoodCard: true })); wx.showToast({ title: "已加入情绪卡片", icon: "success" }); },
  deletePhoto() {
    wx.showModal({ title: "删除这张图片？", content: "删除后无法恢复", confirmColor: "#dff33b", success: (res) => {
      if (!res.confirm) return;
      const entry = this.data.entries.find((item) => item.id === this.menuEntryId);
      const remaining = normalisePhotos(entry).filter((item) => item.id !== this.menuPhotoId);
      this.updateEntry((item) => ({ ...item, photos: remaining }));
      const archives = (wx.getStorageSync("roll-archives") || app.globalData.archives).map((item) => {
        if (item.id !== this.archiveId || item.coverPhotoId !== this.menuPhotoId) return item;
        return remaining[0] ? { ...item, cover: remaining[0].url, coverPhotoId: remaining[0].id } : { ...item, coverPhotoId: null };
      });
      app.globalData.archives = archives; wx.setStorageSync("roll-archives", archives);
      wx.showToast({ title: "图片已删除", icon: "success" }); this.refresh();
    } });
  },
  updateEntry(transform) {
    const entries = (wx.getStorageSync("roll-entries") || []).map((item, index) => (item.id || `legacy-${item.date || index}`) === this.menuEntryId ? transform({ ...item, id: item.id || this.menuEntryId }) : item);
    wx.setStorageSync("roll-entries", entries); this.refresh();
  }
});
