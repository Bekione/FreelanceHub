import { useEffect, useRef, memo } from "react";
import Hls from "hls.js";

const VideoPlayer = memo(() => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const src = "https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8";

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }
  }, []);

  return (
    <video
      ref={videoRef}
      className="w-full h-[80vh] object-cover absolute bottom-[-35vh]"
      autoPlay
      muted
      loop
      playsInline
    />
  );
});

VideoPlayer.displayName = "VideoPlayer";
export default VideoPlayer;
