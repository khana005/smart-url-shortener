const QRCode = require('qrcode');

/**
 * Generate a QR code as a base64 PNG data URL
 * @param {string} url - The URL to encode in the QR code
 * @param {object} options - Optional QR code options
 * @returns {Promise<string>} Base64 PNG data URL
 */
const generateQRCode = async (url, options = {}) => {
  const defaultOptions = {
    type: 'image/png',
    quality: 0.92,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    width: 300,
    ...options,
  };

  return QRCode.toDataURL(url, defaultOptions);
};

/**
 * Generate a QR code as a buffer (for direct file download)
 * @param {string} url
 * @returns {Promise<Buffer>}
 */
const generateQRCodeBuffer = async (url) => {
  return QRCode.toBuffer(url, {
    type: 'png',
    margin: 1,
    width: 400,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });
};

module.exports = {
  generateQRCode,
  generateQRCodeBuffer,
};
