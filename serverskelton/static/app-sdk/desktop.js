(function(sdk) {

    var isIFrame = window.top != window.self;
    var desktopWindow = isIFrame ? window.parent : window.opener;
    var requests = [];

    function Desktop() {
        var eventTarget = document.createDocumentFragment();
        for (var name in EventTarget.prototype) {
            this[name] = eventTarget[name].bind(eventTarget);
        }
    }

    Desktop.prototype = {

        on: function(type, func) {
            this.addEventListener(type, func);
        },

        off: function(type, func) {
            this.removeEventListener(type, func);
        },

        fire: function(type, detail) {
            var ev = document.createEvent('CustomEvent');
            ev.initCustomEvent(type, false, false, detail);
            this.dispatchEvent(ev);
        },

        send: function(type, detail) {
            return sdk.ready.then(function() {
                return new Promise(function(resolve, reject) {
                    if (desktopWindow && !desktopWindow.closed) {
                        requests.push({resolve:resolve, reject:reject});
                        desktopWindow.postMessage({id:requests.length-1, type:type, detail:detail}, sdk.config.desktop.origin);
                    }
                    else {
                        reject(Error('not connected'));
                    }
                });
            });
        },

        get isOpener() {
            return !!desktopWindow && !isIFrame;
        },

        get isParent() {
            return !!desktopWindow && isIFrame;
        }
    };

    window.addEventListener('message', function(e) {
        var data = e.data;
        var origin = e.origin;

        sdk.ready.then(function() {
            if (origin != sdk.config.desktop.origin || !data) {
                return;
            }
            if (data.type) {
                sdk.desktop.fire(data.type, data.detail);
            }
            else if (requests[data.id]) {
                var req = requests[data.id];
                delete requests[data.id];

                if (!data.errorMsg) {
                    req.resolve(data.detail);
                }
                else {
                    var err = Error(data.errorMsg);
                    err.detail = data.detail;
                    req.reject(err);
                }
            }
        });
    });

    sdk.desktop = new Desktop();

}(CIOS));