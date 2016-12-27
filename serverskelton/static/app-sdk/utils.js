(function(sdk) {
    'use strict';

    function mixin(base) {
        if (!(base instanceof Object)) return base;

        [].slice.call(arguments, 1).forEach(function(arg) {
            for (var k in arg) {
                var v = arg[k];
                if (v && v.constructor == Object) {
                    if (!base[k] || base[k].constructor != Object) {
                        base[k] = {};
                    }
                    mixin(base[k], v);
                }
                else if (v instanceof Array) {
                    base[k] = JSON.parse(JSON.stringify(v));
                }
                else if (v !== undefined) {
                    base[k] = v;
                }
            }
        });

        return base;
    };

    function stringify(obj, space) {
        var cache = [];
        return JSON.stringify(obj, function(key, val) {
            if (key[0] == '_') {
                return undefined;
            }
            if (!(val instanceof Object)) {
                return val;
            }
            if (val.constructor != Array && val.constructor != Object) {
                return undefined;
            }
            if (cache.indexOf(val) >= 0) {
                return undefined;
            }
            cache.push(val);
            return val;
        }, space);
    }

    var LANGS = ['es', 'es-419', 'pt-BR', 'pt-PT', 'sr-ME', 'zh-CN', 'zh-TW',
                 'xx-pirate', 'xx-klingon', 'xx-hacker', 'xx-elmer', 'xx-bork'];

    var LANGS_LOW = LANGS.map(function(l) {
        return l.toLowerCase();
    });

    var LANGS_LOW_FIRST = LANGS_LOW.map(function(l) {
        return l.split('-')[0];
    });

    function normalizeLanguage(lang) {
        var lowLang = lang.toLowerCase();
        var lowLangFirst = lowLang.split('-')[0];
        var idx = LANGS_LOW.indexOf(lowLang);
        if (idx >= 0) {
            return LANGS[idx];
        }
        for (var i=0; i<LANGS_LOW_FIRST.length; i++){
            if (lowLangFirst == LANGS_LOW_FIRST[i]) {
                return LANGS[i];
            }
        }
        return lowLangFirst;
    }

    sdk.utils = {
        mixin: mixin,
        stringify: stringify,
        normalizeLanguage: normalizeLanguage
    };

}(CIOS));