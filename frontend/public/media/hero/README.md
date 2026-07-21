# Hero media

Drop these two files in this folder — no code changes needed, `App.jsx` already
points at these exact paths.

| File | Used as | Recommended spec |
|---|---|---|
| `hero-loop.mp4` | Looping video behind the hero headline | 1920×1080 (16:9), H.264 MP4, 8–15s, muted-friendly (no important audio — it always plays muted), under ~6MB so it loads fast |
| `hero-poster.jpg` | Poster frame shown before the video loads / if it fails | Same crop as the video's first frame, 1920×1080, JPG, under ~300KB |

Until these files exist, the hero section simply shows its dark gradient
background — nothing breaks.
