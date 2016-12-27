(function(sdk) {
    'use strict';

    var setExtensions;

    sdk.extensions = new Promise(function(resolve) {
        setExtensions = resolve;
    });

    Promise.all([
        sdk.api.prefix,
        {} //sdk.api.get('/extensions') // TODO extension API実装待ち
    ]).then(function(e) {

        var apiPrefix = e[0];
        var extensions = e[1].response || [];

        extensions.forEach(function(ext) {
            ext.baseUrl = apiPrefix + '/extensions/' + ext.id + '/' + ext.hash + '/';
        });

        extensions = (sdk.config.extensionUrls || []).map(function(url) {
            if (/[^/]$/.test(url)) url += '/';
            return {
                id: btoa(url).replace(/[+/=]/g,'').substr(-16),
                baseUrl: url
            };
        }).concat(extensions);

        var count = extensions.length;
        var tmp = new Array(count);

        extensions.forEach(function(ext, i) {
            fetch(ext.baseUrl + 'manifest.json').then(function(res) {
                if (200 <= res.status && res.status < 300) {
                    return res.json();
                }
                else {
                    throw Error('manifest.json Not Found');
                }
            }).then(function(data) {
                tmp[i] = sdk.utils.mixin({}, data, ext);
            }).catch(function(ex) {
                console.error(ex);
            }).then(function() {
                count--;
                if (count <= 0) imports(tmp);
            });
        });

        if (!count) {
            imports(tmp);
        }

        function imports(exts) {
            exts = exts.filter(function(ext) {
                return ext;
            });
            setExtensions(exts);
            exts.forEach(function(ext) {
                if (ext.index) {
                    var link = document.createElement('link');
                    link.rel = 'import';
                    link.href = ext.baseUrl + ext.index;
                    document.head.appendChild(link);
                }
            });
        }
    });

}(CIOS));
