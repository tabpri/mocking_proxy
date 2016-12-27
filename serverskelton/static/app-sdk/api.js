(function(sdk) {
    'use strict';

    function API(config) {
        var me = this;
        var hasConfig = arguments.length > 0;

        this.config = {};
        this.ready = new Promise(function(resolve) {
            me.init = function(config) {
                if (typeof config == 'string') {
                    config = {token:config};
                }
                sdk.utils.mixin(me.config, config);
                resolve();
                return me;
            };

            if (config || !hasConfig) {
                me.init(config);
            }
        });
    }

    API.prototype = {
        get: function(url, config) {
            return ajax(this, 'GET', url, config);
        },
        getAll: function(url, config) {
            return ajaxAll(this, 'GET', url, config);
        },
        post: function(url, config) {
            return ajax(this, 'POST', url, config);
        },
        patch: function(url, config) {
            return ajax(this, 'PATCH', url, config);
        },
        put: function(url, config) {
            return ajax(this, 'PUT', url, config);
        },
        delete: function(url, config) {
            return ajax(this, 'DELETE', url, config);
        },
        websocket: function(url, config) {
            return websocket(this, url, config);
        },
        get prefix() {
            var me = this;
            return Promise.all([sdk.ready, this.ready]).then(function() {
                return buildPrefix(sdk.utils.mixin({}, sdk.config.api, me.config));
            });
        }
    };

    function buildPrefix(config) {
        var version = config.version || '';
        if (version) {
            version = '/' + version;
        }
        return config.baseUrl || (config.origin + version);
    }

    function buildUrl(prefix, url, params) {
        params = sdk.utils.mixin({}, params);
        url = url.replace(/:([^/?&=]+)|\{([^/?&=]+)\}/g, function(all, name1, name2) {
            var name = name1 || name2;
            var val = params[name];
            delete params[name];
            return val == null ? '' : val;
        });

        if (!/^[a-z0-9+.\-]+:\/\//i.test(url)) {
            if (url[0] != '/') {
                url = '/' + url;
            }
            url = prefix.replace(/\/$/, '') + url;
        }

        var query = Object.keys(params).map(function(key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]).replace(/%20/g, '+');
        }).join('&');
        if (query) {
            url += (url.indexOf('?') < 0 ? '?' : '&') + query;
        }
        return url;
    }

    function ajaxAll(api, method, url, config) {
        config = config || {};
        config.params = sdk.utils.mixin({}, config.params);
        config.params.top = 100;
        config.params.skip = 0;

        var items = [];

        return new Promise(function(resolve, reject) {
            function loop(data) {
                var res = data && data.response;
                if (res instanceof Array) {
                    [].push.apply(items, res);
                }
                if (res instanceof Array && res.length == 100) {
                    config.params.skip += 100;
                    ajax(api, method, url, config).then(loop).catch(reject);
                }
                else {
                    data.response = items;
                    resolve(data);
                }
            }
            ajax(api, method, url, config).then(loop).catch(reject);
        });
    }

    function ajax(api, method, url, config) {
        return Promise.all([sdk.ready, api.ready]).then(function() {

            config = sdk.utils.mixin({headers:{}, params:{}}, sdk.config.api, api.config, config);

            var responseType = config.responseType || 'json';
            var prefix = buildPrefix(config);

            if (config.language) {
                config.params.lang = sdk.config.languages.join(' ');
            }

            url = buildUrl(prefix, url, config.params);

            config.method = method;
            config.mode = 'cors';
            config.headers.Authorization = 'Bearer ' + config.token;

            delete config.origin;
            delete config.version;
            delete config.baseUrl;
            delete config.responseType;
            delete config.binaryType;
            delete config.params;
            delete config.token;

            if (config.method == 'GET') {
                delete config.body;
            }
            else if (config.body instanceof FormData) {
                //config.headers['Content-type'] = 'multipart/form-data';
            }
            else if (typeof config.body == 'string') {
                config.headers['Content-type'] = 'application/x-www-form-urlencoded';
            }
            else if (config.body instanceof Object) {
                config.headers['Content-type'] = 'application/json';
                config.body = sdk.utils.stringify(config.body);
            }

            return fetch(url, config).then(function(res) {
                if (200 <= res.status && res.status < 300) {
                    var f = res[responseType];
                    if (!f) {
                        throw Error('responseType Error');
                    }
                    return f.call(res).catch(function(){return null});
                }
                else {
                    var error = Error(res.status + ' ' + res.statusText);
                    error.response = res;
                    throw error
                }
            });
        });
    }

    function websocket(api, url, config) {

        var close = false;

        var socket = Promise.all([sdk.ready, api.ready]).then(function(data) {
            var sdkConfig = data[0];
            var apiConfig = data[1];

            config = sdk.utils.mixin({params:{}}, sdk.config.api, api.config, config);
            config.params.access_token = config.token;

            var prefix = buildPrefix(config);
            url = buildUrl(prefix, url, config.params).replace(/^http/, 'ws');

            var ws = new WebSocket(url);
            ws.binaryType = config.binaryType || 'blob';
            return ws;
        }).catch(function(ex) {
            console.error(ex);
        });

        var open = socket.then(function(ws) {
            return new Promise(function(resolve) {
                ws.addEventListener('open', resolve.bind(null, ws));
            });
        });

        return {
            on: function(type, func) {
                socket.then(function(ws) {
                    ws.addEventListener(type, function(e) {
                        if (!close) func.call(null, e);
                    });
                });
            },
            send: function(data) {
                open.then(function(ws) {
                    if (ws.readyState == 1) {
                        ws.send(data);
                    }
                });
            },
            close: function(code, reason) {
                if (!close) {
                    close = true;
                    var args = [].slice.call(arguments);
                    socket.then(function(ws) {
                        ws.close.apply(ws, args);
                    });
                }
            }
        };
    }

    sdk.API = API;
    sdk.api = new API();


}(CIOS));
