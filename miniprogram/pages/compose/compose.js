const tags = ["旅行", "日常", "风景", "朋友", "家人", "美食", "工作", "音乐"];
const moods = ["平静", "雀跃", "柔软", "想念", "疲惫", "明亮"];

Page({
  data: { tags, moods, selected: [], tagState: {}, selectedMood: "", images: [], body: "", custom: "", moodNote: "", showMoodNote: false, showCustom: false },
  toggle(e) {
    const tag = e.currentTarget.dataset.tag;
    const selected = this.data.selected.includes(tag) ? this.data.selected.filter((item) => item !== tag) : [...this.data.selected, tag];
    const tagState = {}; selected.forEach((item) => tagState[item] = true);
    this.setData({ selected, tagState });
  },
  choose() {
    wx.chooseMedia({ count: Math.max(1, 9 - this.data.images.length), mediaType: ["image"], sourceType: ["album", "camera"], success: (res) => this.setData({ images: [...this.data.images, ...res.tempFiles.map((item) => item.tempFilePath)] }) });
  },
  remove(e) { this.setData({ images: this.data.images.filter((_, index) => index !== e.currentTarget.dataset.index) }); },
  selectMood(e) { this.setData({ selectedMood: e.currentTarget.dataset.mood }); },
  toggleOptional(e) { const key = e.currentTarget.dataset.key; this.setData({ [key]: !this.data[key] }); },
  input(e) { this.setData({ [e.currentTarget.dataset.field]: e.detail.value }); },
  publish() {
    if (!this.data.body.trim() && !this.data.images.length) return wx.showToast({ title: "写一点文字或留下一张照片", icon: "none" });
    const now = new Date(); const createdAt = now.toISOString();
    const uploadedAt = now.toLocaleString("zh-CN", { hour12: false });
    const archiveId = wx.getStorageSync("roll-selected-archive") || wx.getStorageSync("roll-current-archive") || "west";
    const entry = {
      id: `entry-${Date.now()}`, archiveId, createdAt, uploadedAt, body: this.data.body.trim(),
      photos: this.data.images.map((url, index) => ({ id: `photo-${Date.now()}-${index}`, url, uploadedAt })),
      tags: [...this.data.selected, ...this.data.custom.split(/[，,]/).map((item) => item.trim()).filter(Boolean)],
      mood: this.data.selectedMood, moodNote: this.data.moodNote.trim()
    };
    const entries = wx.getStorageSync("roll-entries") || [];
    wx.setStorageSync("roll-entries", [entry, ...entries]);
    this.setData({ images: [], body: "", selected: [], tagState: {}, custom: "", selectedMood: "", moodNote: "", showMoodNote: false, showCustom: false });
    wx.showToast({ title: "已归入当前档案", icon: "success" });
  }
});
