
export interface ShareOptions {
  title: string;
  text: string;
  url?: string;
}

export const getWhatsAppUrl = (text: string) => {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
};

export const getEmailUrl = (subject: string, body: string) => {
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

export const getTelegramUrl = (text: string) => {
  return `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
};

export const getXUrl = (text: string) => {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
};

export const getFacebookUrl = (url: string) => {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
};

export const getMessengerUrl = (url: string) => {
  // Using the FB Send dialog which works for Messenger on desktop and mobile web
  // Note: For a perfect experience, a Facebook App ID is usually required.
  return `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=498163867458&redirect_uri=${encodeURIComponent(url)}`;
};

export const getQRCodeUrl = (text: string) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text.slice(0, 500))}`;
};

export const copyToClipboard = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (err) {
    console.error("Clipboard failed", err);
    return false;
  }
};

export const shareContentNative = async (options: ShareOptions) => {
  if (navigator.share && navigator.canShare && navigator.canShare(options)) {
    try {
      await navigator.share(options);
      return true;
    } catch (err) {
      return false;
    }
  }
  return false;
};

/**
 * Shared logic for content distribution.
 */
export const shareContent = async (title: string, text: string) => {
  const cleanText = text.replace(/[*#_~]/g, '');
  const url = window.location.href;
  const fullText = `${title}\n\n${cleanText}\n\nApp Link: ${url}`;
  const options = { title, text: fullText, url };
  
  const nativeShared = await shareContentNative(options);
  if (nativeShared) {
    return { success: true, method: 'native' };
  } else {
    const copied = await copyToClipboard(fullText);
    return { success: copied, method: 'clipboard' };
  }
};
