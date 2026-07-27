import { Archive, Entry } from "./types";
export const archives: Archive[] = [
 { id:"west", title:"西行", subtitle:"ROLL 01", range:"2025.07.09 — 2025.08.08", cover:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=85", color:"#c8c3b0", description:"沿着山脉、盐湖和风的方向。", position: 1 },
 { id:"north", title:"北岸", subtitle:"ROLL 02", range:"2025.05.18 — 2025.05.24", cover:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85", color:"#9aa5a1", description:"潮声、海鸥和晚归的船。", position: 2 },
 { id:"quiet", title:"静物", subtitle:"ROLL 03", range:"2025.03.01 — 2025.03.31", cover:"https://images.unsplash.com/photo-1519608487953-e999c86e7454?auto=format&fit=crop&w=1800&q=85", color:"#ad876f", description:"那些没有发生大事的下午。", position: 3 }
];
export const entries: Entry[] = [
 { id:"e1", archiveId:"west", date:"2025-07-12", title:"风把山脊削得很薄", body:"下午四点抵达垭口。云影在地上移动得比我们快，所有人都安静了一会。", location:"青海 · 祁连", mood:"辽阔", tags:["山", "公路", "夏天"], status:"published", photos:[{id:"p1",url:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=85",alt:"山脉",position:0},{id:"p2",url:"https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=85",alt:"山谷",position:1}] },
 { id:"e2", archiveId:"west", date:"2025-07-16", title:"雨后的盐湖", body:"鞋底沾满白色结晶。天色渐晚，湖面像一整块被打磨过的金属。", location:"青海 · 茫崖", mood:"平静", tags:["湖", "雨后"], status:"published", photos:[{id:"p3",url:"https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1600&q=85",alt:"湖",position:0}] },
 { id:"e3", archiveId:"north", date:"2025-05-20", title:"潮汐表失效的早晨", body:"我们没有赶上退潮，却捡到了很久没见过的耐心。", location:"舟山", mood:"松弛", tags:["海", "清晨"], status:"published", photos:[{id:"p4",url:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85",alt:"海浪",position:0}] }
];
