var CIOS = {};

(function(sdk) {
    'use strict';

    // 旧バージョン対応(削除予定)
    if (sdk.defaultConfig) {
        var dc = sdk.defaultConfig;
        sdk.config = {
            api: {
                origin: dc.apiOrigin || dc.api.origin,
                version: dc.apiVersion || dc.api.version
            },
            desktop: {
                origin: dc.desktopOrigin || dc.desktop.origin
            }
        };
    }

    sdk.ready = new Promise(function(resolve) {
        sdk.init = function(config) {
            if (typeof config == 'string') {
                config = {
                    api: {
                        token: config
                    }
                };
            }
            sdk.utils.mixin(sdk.config, config);
            resolve();
        };
    });

}(CIOS));