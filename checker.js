//Protobowl's checking algorithm, transcribed into js

var check_answer, equivalence_map, fuzzy_search, safeCheckAnswer, stemmer_cleanup, tokenize_line,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

tokenize_line = function(answer) {
  var back, bold, buffer, completed, front, group, i, j, k, l, len, len1, len2, len3, len4, m, n, o, prefix, prefix_words, preposition, processed, ref, ref1, ref2, ref3, ref4, ref5, ref6, results, splitters, suffix, suffix_words, token, tokens;
  if (answer.split(' ').length === 1 && answer.indexOf('{') === -1 && answer.indexOf('}') === -1) {
    answer = '{' + answer + '}';
  }
  tokens = answer.replace(/([\{\}\[\]\;\-\:\,\&\(\)\/])/g, " $1 ").replace(/'|"/g, '').replace(/\./g, ' ').replace(/\ +/g, ' ').trim().split(' ');
  bold = false;
  processed = [];
  for (j = 0, len = tokens.length; j < len; j++) {
    token = tokens[j];
    if (token === '{') {
      bold = true;
    } else if (token === '}') {
      bold = false;
    } else if (token !== '-' && token !== ':' && token !== '=' && token !== '&' && token !== '%' && token !== '/') {
      processed.push([bold, token]);
    }
  }
  buffer = [];
  completed = [];
  for (k = 0, len1 = processed.length; k < len1; k++) {
    ref = processed[k], bold = ref[0], token = ref[1];
    if ((ref1 = token.toLowerCase().trim()) === '[' || ref1 === 'or' || ref1 === ';' || ref1 === ']' || ref1 === '(' || ref1 === ')' || ref1 === ',' || ref1 === 'and' || ref1 === 'but') {
      if (buffer.length) {
        completed.push(buffer);
      }
      buffer = [];
    } else {
      buffer.push([bold, token]);
    }
  }
  if (buffer.length) {
    completed.push(buffer);
  }
  ref2 = completed.reverse();
  results = [];
  for (l = 0, len2 = ref2.length; l < len2; l++) {
    group = ref2[l];
    prefix_words = ["do", "not", "accept", "or", "prompt", "on", "just", "don't", "either", "i", "guess"];
    suffix_words = ["is", "read", "stated", "mentioned", "at", "any", "time"];
    splitters = ["before", "after", "during", "while", "until", "but"];
    prefix = [];
    for (m = 0, len3 = group.length; m < len3; m++) {
      ref3 = group[m], bold = ref3[0], token = ref3[1];
      if (indexOf.call(prefix_words, token) >= 0) {
        prefix.push(token);
      } else {
        break;
      }
    }
    suffix = [];
    for (i = n = ref4 = group.length; ref4 <= 0 ? n < 0 : n > 0; i = ref4 <= 0 ? ++n : --n) {
      ref5 = group[i - 1], bold = ref5[0], token = ref5[1];
      if (prefix.length > 0 && indexOf.call(suffix_words, token) >= 0) {
        suffix.push(token);
      } else {
        break;
      }
    }
    suffix.reverse();
    front = [];
    back = [];
    preposition = null;
    for (o = 0, len4 = group.length; o < len4; o++) {
      ref6 = group[o], bold = ref6[0], token = ref6[1];
      if (preposition) {
        back.push([bold, token]);
      } else if (indexOf.call(splitters, token) >= 0 && bold === false) {
        preposition = token;
      } else if (indexOf.call(prefix, token) >= 0 || indexOf.call(suffix, token) >= 0) {
        0;
      } else {
        front.push([bold, token]);
      }
    }
    results.push([prefix, front, preposition, back, suffix]);
  }
  return results;
};

equivalence_map = (function() {
  var group, item, j, k, len, len1, list, map;
  list = [['zero', 'zeroeth', 'zeroth', '0'], ['one', 'first', 'i', '1', '1st'], ['two', 'second', 'ii', '2', '2nd'], ['three', 'third', 'iii', 'turd', '3', '3rd'], ['four', 'forth', 'fourth', 'iv', '4', '4th'], ['fifth', 'five', '5', '5th', 'v', 'versus', 'vs', 'against'], ['sixth', 'six', 'vi', 'emacs', '6', '6th'], ['seventh', 'seven', 'vii', '7', '7th'], ['eight', 'eighth', '8', 'viii', 'iix', '8th'], ['nine', 'nein', 'ninth', 'ix', '9', '9th'], ['ten', 'tenth', '10', '10th', 'x', 'by', 'times', 'product', 'multiplied', 'multiply'], ['eleventh', 'eleven', 'xi', '11th'], ['twelfth', 'twelveth', 'twelve', '12', 'xii', '12th'], ['thirteenth', 'thirteen', '13', 'xiii', '13th'], ['fourteenth', 'fourteen', 'ixv', '14th'], ['fifteenth', 'fifteen', '15', 'xv', '15th'], ['sixteenth', 'sixteen', '16', 'xvi', '16th'], ['seventeenth', 'seventeen', '17', 'xvii', '17th'], ['eighteenth', 'eighteen', 'eightteen', '18', 'xviii', '18th'], ['nineteenth', 'ninteenth', 'ninteen', 'nineteen', '19', 'ixx', '19th'], ['twentieth', 'twenty', 'xx', '20', '20th'], ['thirtieth', 'thirty', 'xxx', '30', '30th'], ['hundred', 'c', '100', '100th'], ['dr', 'doctor', 'drive'], ['mr', 'mister'], ['ms', 'miss', 'mrs'], ['st', 'saint', 'street'], ['rd', 'road'], ['albert', 'al'], ['robert', 'bob', 'rob'], ['william', 'will', 'bill'], ['richard', 'rich', 'dick'], ['jim', 'james'], ['gregory', 'greg'], ['christopher', 'chris'], ['benjamin', 'ben'], ['nicholas', 'nick'], ['anthony', 'tony'], ['lawrence', 'larry'], ['edward', 'edvard', 'edouard', 'ed'], ['kim', 'kimball'], ['vladimir', 'vlad'], ['samuel', 'samantha', 'sam'], ['log', 'logarithm'], ['constant', 'number']];
  map = {};
  for (j = 0, len = list.length; j < len; j++) {
    group = list[j];
    for (k = 0, len1 = group.length; k < len1; k++) {
      item = group[k];
      if (item in map) {
        console.warn("ITEM ALREADY EXISTS", item);
      }
      map[item] = group;
    }
  }
  return map;
})();

stemmer_cleanup = function(text) {
  var stemmer;
  if (typeof PorterStemmer !== "undefined" && PorterStemmer !== null) {
    stemmer = PorterStemmer;
  } else {
    stemmer = require('./lib/porter').stemmer;
  }
  return stemmer(text).replace(/ph/ig, 'f');
};

fuzzy_search = function(needle, haystack) {
  var ERROR_RATIO, composite_acronym, damlev, diff, frac, j, k, l, len, len1, len2, plaid, plain, plainneedle, plainstack, ref, ref1, ref2, ref3, ref4, ref5, remove_diacritics, stem, word, xylem;
  if (typeof removeDiacritics !== "undefined" && removeDiacritics !== null) {
    remove_diacritics = removeDiacritics;
  } else {
    remove_diacritics = require('./lib/removeDiacritics').removeDiacritics;
  }
  if (typeof levenshtein !== "undefined" && levenshtein !== null) {
    damlev = levenshtein;
  } else {
    damlev = require('./lib/levenshtein').levenshtein;
  }
  haystack = remove_diacritics(haystack).replace(/\.\s?/g, ' ');
  needle = remove_diacritics(needle.toLowerCase());
  if ((2 <= (ref = haystack.length) && ref <= 4)) {
    haystack = haystack.toUpperCase();
  }
  plainstack = haystack.toLowerCase().replace(/[^a-z]/g, '');
  plainneedle = needle.replace(/[^a-z]/g, '');
  stem = stemmer_cleanup(needle);
  ERROR_RATIO = 0.25;
  composite_acronym = '';
  ref1 = haystack.split(/\s|\-/);
  for (j = 0, len = ref1.length; j < len; j++) {
    word = ref1[j];
    if (/^[A-Z]+$/.test(word) && (1 <= (ref2 = word.length) && ref2 <= 4)) {
      composite_acronym += word;
    }
  }
  ref3 = haystack.split(/\s|\-/);
  for (k = 0, len1 = ref3.length; k < len1; k++) {
    word = ref3[k];
    word = word.toLowerCase();
    if (needle === word) {
      return true;
    }
    plain = damlev(word, needle);
    plaid = plain / Math.min(word.length, needle.length);
    if (plaid <= ERROR_RATIO) {
      return true;
    }
    xylem = stemmer_cleanup(word);
    diff = damlev(xylem, stem);
    frac = diff / Math.min(xylem.length, stem.length);
    if (frac <= ERROR_RATIO) {
      return true;
    }
    if (needle.length > 6 && word.indexOf(needle.slice(0, 4)) === 0) {
      return true;
    }
    if (needle.length === 1 && word.indexOf(needle) === 0) {
      return true;
    }
  }
  if (needle in equivalence_map) {
    ref4 = equivalence_map[needle];
    for (l = 0, len2 = ref4.length; l < len2; l++) {
      word = ref4[l];
      if ((" " + (haystack.toLowerCase()) + " ").indexOf(" " + word + " ") !== -1) {
        return 'EQUIV' + word;
      }
    }
  }
  if ((2 <= (ref5 = composite_acronym.length) && ref5 <= 4)) {
    if (composite_acronym.toLowerCase().indexOf(needle[0]) !== -1) {
      return 'ACRONYM';
    }
  }
  if (plainneedle.length >= 3 && plainstack.indexOf(plainneedle) !== -1) {
    return 'PARTIAL';
  }
  return false;
};

check_answer = function(tokens, text, question, config) {
  var a, acronym_matches, all_tokens, back, bold, bold_match, bold_miss, bolded, cat_tokens, front, index, j, judgement, judgement_prime, judgements, jury, k, l, len, len1, len2, len3, len4, level, lower_all_tokens, lower_cat_tokens, m, match, match_diff, match_frac, matchiness, matchiness_prime, mode_either, n, partial_matches, prefix, preposition, processed, question_match, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, sorted, stopwords, suffix, text_matches, token, trivial, unbold, unbold_match, unbold_miss, word;
  if (question == null) {
    question = '';
  }
  if (config == null) {
    config = {};
  }
  text = text.replace(/l(ol)+/g, 'lol').replace(/\s+/g, ' ').replace(/'|"/g, '').replace(/\./g, ' ').replace(/\ +/g, ' ').trim();
  stopwords = "a and any as at election battle war by can de do for from have her him his in is it l la le my o of on or she so that the this to was y lol derp merp haha".split(' ');
  judgements = [];
  index = 0;
  mode_either = false;
  cat_tokens = [];
  all_tokens = [];
  for (j = 0, len = tokens.length; j < len; j++) {
    ref = tokens[j], prefix = ref[0], front = ref[1], preposition = ref[2], back = ref[3], suffix = ref[4];
    for (k = 0, len1 = front.length; k < len1; k++) {
      ref1 = front[k], bold = ref1[0], token = ref1[1];
      all_tokens.push(token);
    }
  }
  question_match = [];
  question = question.toLowerCase();
  lower_cat_tokens = (function() {
    var l, len2, results;
    results = [];
    for (l = 0, len2 = cat_tokens.length; l < len2; l++) {
      word = cat_tokens[l];
      results.push(word.toLowerCase());
    }
    return results;
  })();
  ref2 = text.split(/\s/);
  for (l = 0, len2 = ref2.length; l < len2; l++) {
    word = ref2[l];
    word = word.toLowerCase();
    if (indexOf.call(stopwords, word) >= 0) {
      question_match.push(word);
      continue;
    }
    if (!word || word.length <= 2 || indexOf.call(lower_cat_tokens, word) >= 0) {
      continue;
    }
    if (question.indexOf(word) !== -1) {
      question_match.push(word);
    }
  }
  for (m = 0, len3 = tokens.length; m < len3; m++) {
    ref3 = tokens[m], prefix = ref3[0], front = ref3[1], preposition = ref3[2], back = ref3[3], suffix = ref3[4];
    index++;
    bold_match = [];
    unbold_match = [];
    bold_miss = [];
    unbold_miss = [];
    bolded = [];
    unbold = [];
    acronym_matches = 0;
    text_matches = 0;
    partial_matches = 0;
    processed = (function() {
      var len4, n, ref4, results;
      results = [];
      for (n = 0, len4 = front.length; n < len4; n++) {
        ref4 = front[n], bold = ref4[0], token = ref4[1];
        match = fuzzy_search(token, text);
        if (match === 'PARTIAL') {
          if (config.no_partial) {
            match = false;
          } else {
            partial_matches++;
          }
        } else if (match === 'ACRONYM') {
          if (config.no_acronym) {
            match = false;
          } else {
            acronym_matches++;
          }
        } else if (match) {
          text_matches++;
        }
        results.push([bold, token, match]);
      }
      return results;
    })();
    for (n = 0, len4 = processed.length; n < len4; n++) {
      ref4 = processed[n], bold = ref4[0], token = ref4[1], match = ref4[2];
      if (acronym_matches + text_matches < 2 && match === 'ACRONYM') {
        match = false;
      }
      if (partial_matches < 2 && match === 'PARTIAL') {
        match = false;
      }
      trivial = (ref5 = token.toLowerCase(), indexOf.call(stopwords, ref5) >= 0);
      if (match && bold) {
        bold_match.push(token);
      }
      if (match && !bold && !trivial) {
        unbold_match.push(token);
      }
      if (!match && !bold && !trivial) {
        unbold_miss.push(token);
      }
      if (!match && bold) {
        bold_miss.push(token);
      }
      if (bold) {
        bolded.push(token);
      }
      if (!bold && !trivial) {
        unbold.push(token);
      }
      if (match.toString().slice(0, 5) === 'EQUIV') {
        cat_tokens.push(match.slice(5));
      } else {
        if (match) {
          cat_tokens.push(token);
        }
      }
    }
    matchiness = bold_match.length + unbold_match.length;
    level = 0;
    if (bold_match.length > 0) {
      if (mode_either) {
        level = 2;
      } else if (bold_miss.length > 0) {
        if (acronym_matches > text_matches && acronym_matches + text_matches < 4) {
          level = 0;
        } else {
          level = 1;
        }
      } else {
        level = 2;
      }
    } else {
      if (bolded.length === 0 && unbold_match.length > 0) {
        level = 2;
      } else if (unbold_match.length > unbold.length / 2) {
        level = 1;
      } else {
        level = 0;
      }
    }
    mode_either = false;
    if (indexOf.call(prefix, 'either') >= 0) {
      mode_either = true;
    } else if (indexOf.call(prefix, 'not') >= 0) {
      0;
    } else if (indexOf.call(prefix, 'prompt') >= 0) {
      if (level === 2) {
        judgements.push([matchiness, 1]);
      } else if (level === 1) {
        judgements.push([matchiness, 1]);
      } else {
        judgements.push([matchiness, 0]);
      }
    } else {
      if (level === 2) {
        judgements.push([matchiness, 2]);
      } else if (level === 1) {
        judgements.push([matchiness, 1]);
      } else {
        judgements.push([matchiness, 0]);
      }
    }
  }
  sorted = judgements.sort(function(arg, arg1) {
    var _a, _b, a, b;
    _a = arg[0], a = arg[1];
    _b = arg1[0], b = arg1[1];
    return b - a;
  });
  ref6 = sorted[0], matchiness_prime = ref6[0], judgement_prime = ref6[1];
  sorted = (function() {
    var len5, o, results;
    results = [];
    for (o = 0, len5 = sorted.length; o < len5; o++) {
      a = sorted[o];
      if (a[0] === matchiness_prime) {
        results.push(a);
      }
    }
    return results;
  })();
  jury = sorted.sort(function(arg, arg1) {
    var _a, _b, a, b;
    _a = arg[0], a = arg[1];
    _b = arg1[0], b = arg1[1];
    return b - a;
  });
  ref7 = jury[0], matchiness = ref7[0], judgement = ref7[1];
  lower_all_tokens = (function() {
    var len5, o, results;
    results = [];
    for (o = 0, len5 = all_tokens.length; o < len5; o++) {
      word = all_tokens[o];
      results.push(word.toLowerCase());
    }
    return results;
  })();
  question_match = (function() {
    var len5, o, results;
    results = [];
    for (o = 0, len5 = question_match.length; o < len5; o++) {
      word = question_match[o];
      if (indexOf.call(lower_all_tokens, word) < 0) {
        results.push(word);
      }
    }
    return results;
  })();
  match_frac = (cat_tokens.join(' ').length + question_match.join(' ').length) / text.length;
  match_diff = (cat_tokens.join(' ').length + question_match.join(' ').length) - text.length;
  if (match_frac < 0.6 || (match_diff < -7 && match_frac < 0.7)) {
    return 'reject';
  }
  if (judgement === 0) {
    return 'reject';
  }
  if (judgement === 1) {
    return 'prompt';
  }
  if (judgement === 2) {
    return 'accept';
  }
};

safeCheckAnswer = function(compare, answer, question, config) {
  var err, result, tokens;
  if (config == null) {
    config = {};
  }
  try {
    tokens = tokenize_line(answer);
    result = check_answer(tokens, compare, question, config);
    if (result === 'accept') {
      return true;
    } else if (result === 'prompt') {
      return 'prompt';
    } else {
      return false;
    }
  } catch (_error) {
    err = _error;
    console.log(err)
    return false;
  }
};

if (typeof exports !== "undefined" && exports !== null) {
  exports.checkAnswer = safeCheckAnswer;
} else if (typeof window !== "undefined" && window !== null) {
  window.checkAnswer = safeCheckAnswer;
}

// ---
// generated by coffee-script 1.9.2