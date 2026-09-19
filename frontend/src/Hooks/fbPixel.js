export const fbqTrack = (event, params = {}) => {
  if (typeof window.fbq !== 'undefined') {
    window.fbq('track', event, params);
    console.log(`[FBQ] Event Tracked: ${event}`, params);
  } else {
    console.warn('[FBQ] Pixel not initialized');
  }
};