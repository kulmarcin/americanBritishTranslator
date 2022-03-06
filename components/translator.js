const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require('./american-to-british-titles.js');
const britishOnly = require('./british-only.js');

class Translator {
  reverseDict(obj) {
    return Object.assign(
      {},
      ...Object.entries(obj).map(([k, v]) => ({ [v]: k }))
    );
  }

  translate(text, dictionary, titles, time, locale) {
    const loweredText = text.toLowerCase();
    const matches = {};

    //titles
    Object.entries(titles).map(([a, b]) => {
      if (loweredText.includes(a)) {
        matches[a] = b.charAt(0).toUpperCase() + b.slice(1);
      }
    });

    const wordsWithSpace = Object.fromEntries(
      Object.entries(dictionary).filter(([a, b]) => {
        return a.includes(' ');
      })
    );

    Object.entries(wordsWithSpace).map(([a, b]) => {
      if (loweredText.includes(a)) {
        matches[a] = b;
      }
    });

    loweredText.match(/(\w+([-'])(\w+)?['-]?(\w+))|\w+/g).forEach(word => {
      if (dictionary[word]) {
        matches[word] = dictionary[word];
      }
    });

    const matchedTimes = loweredText.match(time);

    if (matchedTimes) {
      matchedTimes.map(e => {
        if (locale === 'toBritish') {
          return (matches[e] = e.replace(':', '.'));
        }
        return (matches[e] = e.replace('.', ':'));
      });
    }

    if (Object.keys(matches).length === 0) return null;

    const translation = this.replaceAll(text, matches);

    const translationWithHighlight = this.replaceAllWithHighlight(
      text,
      matches
    );

    return [translation, translationWithHighlight];
  }

  replaceAll(text, matches) {
    const re = new RegExp(Object.keys(matches).join('|'), 'gi');

    return text.replace(re, matched => matches[matched.toLowerCase()]);
  }

  replaceAllWithHighlight(text, matches) {
    const re = new RegExp(Object.keys(matches).join('|'), 'gi');

    return text.replace(re, matched => {
      return `<span class="highlight">${matches[matched.toLowerCase()]}</span>`;
    });
  }

  toBritishEnglish(text) {
    const dict = { ...americanOnly, ...americanToBritishSpelling };
    const titles = americanToBritishTitles;
    const timeRegex = /([1-9]|1[012]):[0-5][0-9]/g;
    const translated = this.translate(
      text,
      dict,
      titles,
      timeRegex,
      'toBritish'
    );
    if (!translated) {
      return text;
    }

    return translated;
  }

  toAmericanEnglish(text) {
    const dict = {
      ...britishOnly,
      ...this.reverseDict(americanToBritishSpelling)
    };
    const titles = this.reverseDict(americanToBritishTitles);
    const timeRegex = /([1-9]|1[012]).[0-5][0-9]/g;
    const translated = this.translate(
      text,
      dict,
      titles,
      timeRegex,
      'toAmerican'
    );
    if (!translated) {
      return text;
    }
    return translated;
  }
}

module.exports = Translator;
