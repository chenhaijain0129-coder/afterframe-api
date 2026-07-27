import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "ROLL 私密影像日记", short_name: "ROLL 日记", description: "仅自己可见的影像档案", display: "standalone", start_url: "/", background_color: "#060807", theme_color: "#060807" };
}
