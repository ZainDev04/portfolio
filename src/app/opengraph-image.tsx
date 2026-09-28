import { ImageResponse } from "next/og";

// Social preview card: the hero in miniature.
export const alt = "Shaikh Muhammad Zain, machine learning engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "radial-gradient(120% 80% at 55% 25%, #1E1E1E 0%, #101010 70%)",
          color: "#EDEBE6",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ position: "absolute", left: 800, top: 70, width: 200, height: 200, borderRadius: 9999, border: "50px solid #EDEBE6" }} />
        <div style={{ position: "absolute", left: 1000, top: 30, width: 180, height: 180, borderRadius: 9999, background: "#B481F8" }} />
        <div style={{ position: "absolute", left: 1010, top: 236, width: 72, height: 72, borderRadius: 9999, background: "#EDEBE6" }} />
        <div style={{ position: "absolute", left: 72, bottom: 72, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#B481F8" }}>retrieval · learning · deployment</div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 76, fontWeight: 700, lineHeight: 1 }}>
            <span>Shaikh Muhammad</span>
            <span style={{ display: "flex" }}>
              Zain<span style={{ color: "#B481F8" }}>.</span>
            </span>
          </div>
          <div style={{ fontSize: 26, color: "#999895" }}>machine learning engineer, karachi</div>
        </div>
      </div>
    ),
    size,
  );
}
