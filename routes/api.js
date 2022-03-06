'use strict';

const Translator = require('../components/translator.js');

module.exports = function (app) {
  const translator = new Translator();

  app.route('/api/translate').post((req, res) => {
    const { text, locale } = req.body;

    if (!locale || text === undefined) {
      res.json({ error: 'Required field(s) missing' });
      return;
    }

    if (text === '') {
      res.json({ error: 'No text to translate' });
      return;
    }
    let translated = '';

    if (locale === 'american-to-british') {
      translated = translator.toBritishEnglish(text)[1];
    } else if (locale === 'british-to-american') {
      translated = translator.toAmericanEnglish(text)[1];
    } else {
      res.json({ error: 'Invalid value for locale field' });
      return;
    }

    if (translated === text || !translated || translated.length < 2) {
      res.json({ text, translation: 'Everything looks good to me!' });
      return;
    }

    res.json({ text, translation: translated });
  });
};
