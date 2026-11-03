import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d9488",
        }}
      >
        <div
          style={{
            width: 118,
            height: 118,
            borderRadius: 14,
            background: "#ccfbf1",
            display: "flex",
            border: "7px solid #134e4a",
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", left: 39, top: 0, bottom: 0, width: 4, background: "#0f766e" }} />
          <div style={{ position: "absolute", left: 78, top: 0, bottom: 0, width: 4, background: "#0f766e" }} />
          <div style={{ position: "absolute", top: 39, left: 0, right: 0, height: 4, background: "#0f766e" }} />
          <div style={{ position: "absolute", top: 78, left: 0, right: 0, height: 4, background: "#0f766e" }} />
          <div
            style={{
              position: "absolute",
              left: 10,
              top: 12,
              fontSize: 26,
              fontWeight: 700,
              color: "#134e4a",
              fontFamily: "system-ui",
            }}
          >
            5
          </div>
          <div
            style={{
              position: "absolute",
              left: 48,
              top: 48,
              fontSize: 26,
              fontWeight: 700,
              color: "#0d9488",
              fontFamily: "system-ui",
            }}
          >
            9
          </div>
          <div
            style={{
              position: "absolute",
              left: 86,
              top: 82,
              fontSize: 26,
              fontWeight: 700,
              color: "#134e4a",
              fontFamily: "system-ui",
            }}
          >
            2
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
