(function(sdk) {
    'use strict';

    sdk.open = function(options) {
        if (typeof options == 'string') {
            options = {id:options};
        }
        options = options || {};

        if (sdk.desktop.isParent && !options.iframe) {
            return sdk.desktop.send('app-open', options);
        }

        var p = Promise.resolve();

        if (options.app) {
            p = p.then(function() {
                return options.app;
            });
        }
        else if (options.appId) {
            var opt = {params:{id:options.appId}};
            p = p.then(function() {
                return sdk.api.get('/catalog/apps/:id', opt);
            }).catch(function() {
                return sdk.api.get('/dev/apps/:id', opt);
            }).then(function(data) {
                return data.response;
            });
        }
        else {
            throw Error('options error');
        }

        var win = !options.iframe && window.open('abort:blank');

        return p.then(function(app) {

            function getAssocPath(type) {
                var path = app[type + '_assoc_path'];
                var id = options[type + 'Id'];
                var re = new RegExp('\\{' + type + '_id\\}', 'g');
                return path && id && path.replace(re, id);
            }

            var url = app.url || '';
            var path = getAssocPath('channel')
                    || getAssocPath('thing')
                    || getAssocPath('area')
                    || getAssocPath('network')
                    || options.path || '';

            try {
                url = new URL(path, url).href;
            } catch(ex) {}

            if (win) {
                win.location = url;
            }
            else {
                var iframe = options.iframe;
                iframe.sandbox.add('allow-same-origin', 'allow-scripts', 'allow-forms');
                iframe.src = url;
            }

            return app;
        });
    };

}(CIOS));