(function(sdk) {
    'use strict';

    var navLanguages, language;
    var languages = ['en'];
    var enableLanguages = ['ja', 'en', 'zh-CN', 'zh-TW'];

    function check() {
        navLanguages = navigator.languages || [
            navigator.language ||
            navigator.userLanguage ||
            navigator.browserLanguage
        ];
        update();
    }

    function compareArray(a, b) {
        return a.length != b.length || a.some(function(o, i) {
            return o != b[i];
        });
    }

    function fire(type, value) {
        var ev = document.createEvent('CustomEvent');
        ev.initCustomEvent(type, false, false, {value:value});
        window.dispatchEvent(ev);
    }

    function update() {
        var old = languages.slice();
        var langs = navLanguages.concat('en');
        if (language) {
            langs.unshift(language);
        }
        languages = langs.map(sdk.utils.normalizeLanguage).filter(function(l, i, arr) {
            return arr.indexOf(l) == i && enableLanguages.indexOf(l) >= 0;
        });
        if (old[0] != languages[0]) {
            fire('language-changed', languages[0]);
        }
        if (compareArray(old, languages)) {
            fire('languages-changed', languages.slice());
        }
    }

    Object.defineProperties(sdk.config, {

        languages: {
            get: function() {
                return languages.slice();
            }
        },

        language: {
            get: function() {
                return languages[0];
            },
            set: function(val) {
                if (typeof val == 'string' && /^[a-z]{2}\b/i.test(val)) {
                    language = sdk.utils.normalizeLanguage(val);
                    update();
                }
                else if (val == null || val == '') {
                    language = null;
                    update();
                }
            }
        },

        enableLanguages: {
            get: function() {
                return enableLanguages.slice();
            },
            set: function(val) {
                if (val instanceof Array) {
                    enableLanguages = val.concat('en').filter(function(l) {
                        return typeof l == 'string' && /^[a-z]{2}\b/i.test(l);
                    }).map(sdk.utils.normalizeLanguage).filter(function(l, i, arr) {
                        return arr.indexOf(l) == i;
                    });
                    update();
                }
            }
        }
    });

    setInterval(check, 500);
    check();

}(CIOS));