export const maskSensitiveData = (text: string): string => {
  // Mask IP addresses (both IPv4 and IPv6)
  text = text.replace(
    /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b|(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}\b/gi,
    '[MASKED_IP]'
  );

  // Mask transaction IDs (assuming format like 2025...)
  text = text.replace(/\b20\d{2}[0-9a-zA-Z]{16,}\b/g, '[MASKED_TXN_ID]');

  // Mask email addresses
  text = text.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    '[MASKED_EMAIL]'
  );

  // Mask phone numbers (various formats)
  text = text.replace(
    /\b\+?[\d()\-\s.]{10,}\b|\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
    '[MASKED_PHONE]'
  );

  // Mask hostnames
  text = text.replace(
    /\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b/g,
    (match) => {
      // Don't mask common TLDs like .com, .org when they appear alone
      return match.match(/^(com|org|net|edu|gov|mil)$/i) 
        ? match 
        : '[MASKED_HOSTNAME]';
    }
  );

  return text;
};