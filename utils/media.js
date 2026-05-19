import { isYoutubeUrl } from "@/utils/youtube";

export function isVideoFileUrl(url) {
  if (!url || typeof url !== "string") return false;
  return /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(url);
}

export function isAudioFileUrl(url) {
  if (!url || typeof url !== "string") return false;
  return (
    /\.(mp3|m4a|wav|aac)(\?|#|$)/i.test(url) ||
    /\/podcast-player\//i.test(url) ||
    /\/podcast-download\//i.test(url)
  );
}

/** Pick the correct media URL for podcast audio vs video players. */
export function resolvePodcastMediaLink(post) {
  const episodeType = post.meta?.episode_type;
  const audioFile = post.meta?.audio_file;
  const playerLink = post.player_link;

  const hasVideoSource = [audioFile, playerLink].some(
    (url) => isYoutubeUrl(url) || isVideoFileUrl(url),
  );

  const isVideoEpisode =
    episodeType === "video" || hasVideoSource;

  if (isVideoEpisode) {
    const videoSource = [audioFile, playerLink].find(
      (url) => isYoutubeUrl(url) || isVideoFileUrl(url),
    );
    return {
      link: videoSource || audioFile || playerLink || null,
      type: "video",
    };
  }

  const audioSource = [playerLink, audioFile].find(
    (url) => url && isAudioFileUrl(url),
  );

  return {
    link: audioSource || playerLink || audioFile || null,
    type: "audio",
  };
}
