export type Photo = { id: string; url: string; alt: string; caption?: string; position: number };
export type Entry = { id: string; archiveId: string; date: string; title: string; body: string; location?: string; mood?: string; tags: string[]; status: "draft" | "published"; photos: Photo[] };
export type Archive = { id: string; title: string; subtitle: string; range: string; cover: string; color: string; description: string; position: number; archived?: boolean };
