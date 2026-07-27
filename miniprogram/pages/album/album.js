const app = getApp();
const normalisePhotos = (entry) => (entry.photos || entry.images || []).map((photo, index) => typeof photo === "string" ? { id: `${entry.id || entry.date}-${index}`, url: photo, uploadedAt: entry.uploadedAt || "" } : photo);

Page({
  data: { entry: null, photos: [], dragging: false, dragIndex: -1, editing: false, bodyDraft: "" },
  onLoad(query) { this.archiveId = query.archiveId; this.entryId = query.entryId; this.refresh(); },
  refresh() {
    const source = wx.getStorageSync("roll-entries") || [];
    const entry = source.map((item, index) => ({ ...item, id: item.id || `legacy-${item.date || index}` })).find((item) => item.id === this.entryId);
    if (!entry) return wx.navigateBack();
    this.setData({ entry: { ...entry, photos: normalisePhotos(entry) }, photos: normalisePhotos(entry), bodyDraft: entry.body || "" });
  },
  preview(e) {
    if (this.data.dragging) return;
    const current = this.data.photos[e.currentTarget.dataset.index];
    wx.previewImage({ current: current.url, urls: this.data.photos.map((item) => item.url) });
  },
  startDrag(e) {
    if (!this.data.editing) return wx.showToast({ title: "先点击编辑记录", icon: "none" });
    const index = e.currentTarget.dataset.index;
    this.setData({ dragging: true, dragIndex: index });
    wx.createSelectorQuery().select(".photo-grid").boundingClientRect((rect) => { this.gridTop = rect ? rect.top : 0; }).exec();
    wx.showToast({ title: "拖动照片调整顺序", icon: "none", duration: 1200 });
  },
  moveDrag(e) {
    if (!this.data.dragging || !e.touches.length) return;
    const touch = e.touches[0];
    const info = wx.getSystemInfoSync();
    const pxPerRpx = info.windowWidth / 750;
    const padding = 32 * pxPerRpx;
    const cell = 210 * pxPerRpx;
    const gap = 14 * pxPerRpx;
    const col = Math.max(0, Math.min(2, Math.floor((touch.clientX - padding) / (cell + gap))));
    const row = Math.max(0, Math.floor((touch.clientY - this.gridTop) / (cell + gap)));
    const target = Math.min(this.data.photos.length - 1, row * 3 + col);
    const from = this.data.dragIndex;
    if (target === from || target < 0) return;
    const photos = [...this.data.photos]; const moving = photos.splice(from, 1)[0]; photos.splice(target, 0, moving);
    this.setData({ photos, dragIndex: target });
  },
  endDrag() {
    if (!this.data.dragging) return;
    this.persistPhotos(this.data.photos);
    this.setData({ dragging: false, dragIndex: -1 });
  },
  toggleEdit() {
    if (this.data.editing) { this.refresh(); this.setData({ editing: false }); return; }
    this.setData({ editing: true, bodyDraft: this.data.entry.body || "" });
  },
  inputBody(e) { this.setData({ bodyDraft: e.detail.value }); },
  choosePhotos() {
    wx.chooseMedia({ count: Math.max(1, 9 - this.data.photos.length), mediaType: ["image"], sourceType: ["album", "camera"], success: (res) => {
      const uploadedAt = new Date().toLocaleString("zh-CN", { hour12: false });
      const photos = [...this.data.photos, ...res.tempFiles.map((item, index) => ({ id: `photo-${Date.now()}-${index}`, url: item.tempFilePath, uploadedAt }))];
      this.setData({ photos });
    } });
  },
  saveEntry() {
    const body = this.data.bodyDraft.trim(); const photos = this.data.photos;
    const entries = (wx.getStorageSync("roll-entries") || []).map((item, index) => (item.id || `legacy-${item.date || index}`) === this.entryId ? { ...item, id: item.id || this.entryId, body, photos } : item);
    wx.setStorageSync("roll-entries", entries);
    this.setData({ entry: { ...this.data.entry, body, photos }, editing: false });
    wx.showToast({ title: "记录已更新", icon: "success" });
  },
  deleteEntry() {
    wx.showModal({ title: "让这段记录离场？", content: "文字、照片和情绪会一起消失，无法找回。", confirmText: "一起离场", confirmColor: "#dff33b", success: (res) => {
      if (!res.confirm) return;
      const entryPhotos = this.data.photos.map((photo) => photo.id);
      const entries = (wx.getStorageSync("roll-entries") || []).filter((item, index) => (item.id || `legacy-${item.date || index}`) !== this.entryId);
      const archives = (wx.getStorageSync("roll-archives") || app.globalData.archives).map((archive) => archive.id === this.archiveId && entryPhotos.includes(archive.coverPhotoId) ? { ...archive, coverPhotoId: null } : archive);
      wx.setStorageSync("roll-entries", entries); app.globalData.archives = archives; wx.setStorageSync("roll-archives", archives);
      wx.showToast({ title: "这一段已安静离场", icon: "none" }); setTimeout(() => wx.navigateBack(), 420);
    } });
  },
  photoMenu(e) {
    this.photoId = e.currentTarget.dataset.id;
    wx.showActionSheet({ itemList: ["设为档案封面", "加入情绪卡片", "删除此照片"], success: (res) => { if (res.tapIndex === 0) this.setCover(); if (res.tapIndex === 1) this.addMoodCard(); if (res.tapIndex === 2) this.deletePhoto(); } });
  },
  persistPhotos(photos) {
    const entries = (wx.getStorageSync("roll-entries") || []).map((item, index) => (item.id || `legacy-${item.date || index}`) === this.entryId ? { ...item, id: item.id || this.entryId, photos } : item);
    wx.setStorageSync("roll-entries", entries);
  },
  setCover() {
    const photo = this.data.photos.find((item) => item.id === this.photoId); if (!photo) return;
    const archives = (wx.getStorageSync("roll-archives") || app.globalData.archives).map((item) => item.id === this.archiveId ? { ...item, cover: photo.url, coverPhotoId: photo.id } : item);
    app.globalData.archives = archives; wx.setStorageSync("roll-archives", archives); wx.showToast({ title: "已设为档案封面", icon: "success" });
  },
  addMoodCard() {
    const entries = (wx.getStorageSync("roll-entries") || []).map((item, index) => (item.id || `legacy-${item.date || index}`) === this.entryId ? { ...item, id: item.id || this.entryId, isMoodCard: true } : item);
    wx.setStorageSync("roll-entries", entries); wx.showToast({ title: "已加入情绪卡片", icon: "success" });
  },
  deletePhoto() {
    const photo = this.data.photos.find((item) => item.id === this.photoId); if (!photo) return;
    wx.showModal({ title: "删除此照片？", content: "只会删除这一张，记录和其他照片会保留", confirmColor: "#dff33b", success: (res) => {
      if (!res.confirm) return;
      const photos = this.data.photos.filter((item) => item.id !== this.photoId);
      this.persistPhotos(photos);
      const archives = (wx.getStorageSync("roll-archives") || app.globalData.archives).map((item) => item.id !== this.archiveId || item.coverPhotoId !== this.photoId ? item : (photos[0] ? { ...item, cover: photos[0].url, coverPhotoId: photos[0].id } : { ...item, coverPhotoId: null }));
      app.globalData.archives = archives; wx.setStorageSync("roll-archives", archives);
      this.setData({ photos }); wx.showToast({ title: "已删除这一张", icon: "success" });
    } });
  }
});
