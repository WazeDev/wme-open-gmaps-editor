// ==UserScript==
// @name         WME Open GMaps Editor
// @namespace    https://github.com/WazeDev/wme-open-gmaps-editor
// @version      0.0.4
// @description  Opens the Google Maps editor based on WME's map center.
// @author       Gavin Canon-Phratsachack (https://github.com/gncnpk)
// @match        https://beta.waze.com/*editor*
// @match        https://www.waze.com/*editor*
// @exclude      https://www.waze.com/*user/*editor/*
// @exclude      https://www.waze.com/discuss/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=waze.com
// @license      MIT
// @grant        none
// @downloadURL https://update.greasyfork.org/scripts/540549/WME%20Open%20GMaps%20Editor.user.js
// @updateURL https://update.greasyfork.org/scripts/540549/WME%20Open%20GMaps%20Editor.meta.js
// ==/UserScript==

(function() {
    'use strict';
    let wmeSdk;
    const zoomLevels = {
        1: 52428800,
        2: 26214400,
        3: 13107200,
        4: 6553600,
        5: 3276800,
        6: 1638400,
        7: 819200,
        8: 409600,
        9: 204800,
        10: 102400,
        11: 51200,
        12: 25600,
        13: 12800,
        14: 6400,
        15: 3200,
        16: 1600,
        17: 800,
        18: 400,
        19: 200,
        20: 100,
        21: 50,
        22: 25
    }

    function waitForElm(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            });

            // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }
    window.SDK_INITIALIZED.then(initialize)
    async function initialize() {
        wmeSdk = await getWmeSdk({
            scriptId: 'wme-open-gmaps-editor',
            scriptName: 'WME Open GMaps Editor'
        })
        wmeSdk.Events.on({
            eventHandler: replaceGoogleLink,
            eventName: "wme-map-move-end"
        })
        wmeSdk.Events.on({
            eventHandler: replaceGoogleLink,
            eventName: "wme-map-zoom-changed"
        })
        let GMELink = document.createElement("a");
        GMELink.id = "wme-open-gmaps-editor-url";
        GMELink.target = "_blank";
        let img = document.createElement("img");
        img.src = "https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg";
        img.style = "margin-right: 12px;margin-left: 12px;width: 16px;";
        img.title = "Open in Google Maps Editor (GME)"
        GMELink.appendChild(img);
        waitForElm('.secondary-toolbar-actions').then((elm) => {
            let toolbar = document.getElementsByClassName("secondary-toolbar-actions")[0];
            toolbar.insertBefore(GMELink, toolbar.children[0]);
            replaceGoogleLink();
        });
    }

    function replaceGoogleLink() {
        const coords = wmeSdk.Map.getMapCenter();
        const mapZoom = wmeSdk.Map.getZoomLevel();
        let url = `https://www.google.com/maps/place/@${coords.lat},${coords.lon},${zoomLevels[mapZoom]}m/data=!10m2!1e3!2e14!5m1!1e1`
        document.getElementById("wme-open-gmaps-editor-url").href = url;
    }
})();
