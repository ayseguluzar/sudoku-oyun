import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 112,
        }}
      >
        <div
          style={{
            width: 336,
            height: 336,
            borderRadius: 40,
            background: "#ccfbf1",
            display: "flex",
            flexDirection: "column",
            border: "20px solid #134e4a",
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", left: 112, top: 0, bottom: 0, width: 12, background: "#0f766e" }} />
          <div style={{ position: "absolute", left: 224, top: 0, bottom: 0, width: 12, background: "#0f766e" }} />
          <div style={{ position: "absolute", top: 112, left: 0, right: 0, height: 12, background: "#0f766e" }} />
          <div style={{ position: "absolute", top: 224, left: 0, right: 0, height: 12, background: "#0f766e" }} />
          <div
            style={{
              position: "absolute",
              left: 28,
              top: 36,
              fontSize: 72,
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
              left: 140,
              top: 140,
              fontSize: 72,
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
              left: 248,
              top: 236,
              fontSize: 72,
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
