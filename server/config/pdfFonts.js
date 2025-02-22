const path = require('path');
const fonts = {
  Roboto: {
    normal: path.join(__dirname, '..', 'fonts', 'Roboto-Regular.ttf'),
    bold: path.join(__dirname, '..', 'fonts', 'Roboto-Bold.ttf'),
    italics: path.join(__dirname, '..', 'fonts', 'Roboto-Italic.ttf'),
    bolditalics: path.join(__dirname, '..', 'fonts', 'Roboto-BoldItalic.ttf'),
  }
};
module.exports = fonts;
