/* Toastr Vanilla (without jQuery) */
/*
 * Toastr
 * Copyright 2012-2015
 * Authors: John Papa, Hans Fjällemark, and Tim Ferrell.
 * All Rights Reserved.
 * Use, reproduction, distribution, and modification of this code is subject to the terms and
 * conditions of the MIT license, available at http://www.opensource.org/licenses/mit-license.php
 *
 * ARIA Support: Greta Krafsig
 *
 * Project: https://github.com/CodeSeven/toastr MODIFIED TO REMOVE jQuery dependency
 */
/* global define */
(function (define) {
    define([], function () {
        return (function () {
            var container;
            var listener;
            var toastId = 0;
            var toastType = {
                error: 'error',
                info: 'info',
                success: 'success',
                warning: 'warning'
            };

            var toastr = {
                clear: clear,
                remove: remove,
                error: error,
                getContainer: getContainer,
                info: info,
                options: {},
                subscribe: subscribe,
                success: success,
                version: '2.1.4',
                warning: warning
            };

            var previousToast;

            return toastr;

            function error(message, title, optionsOverride) {
                return notify({
                    type: toastType.error,
                    iconClass: getOptions().iconClasses.error,
                    message: message,
                    optionsOverride: optionsOverride,
                    title: title
                });
            }

            function getContainer(options, create) {
                if (!options) { options = getOptions(); }
                container = document.getElementById(options.containerId);
                if (container) {
                    return container;
                }
                if (create) {
                    container = createContainer(options);
                }
                return container;
            }

            function info(message, title, optionsOverride) {
                return notify({
                    type: toastType.info,
                    iconClass: getOptions().iconClasses.info,
                    message: message,
                    optionsOverride: optionsOverride,
                    title: title
                });
            }

            function subscribe(callback) {
                listener = callback;
            }

            function success(message, title, optionsOverride) {
                return notify({
                    type: toastType.success,
                    iconClass: getOptions().iconClasses.success,
                    message: message,
                    optionsOverride: optionsOverride,
                    title: title
                });
            }

            function warning(message, title, optionsOverride) {
                return notify({
                    type: toastType.warning,
                    iconClass: getOptions().iconClasses.warning,
                    message: message,
                    optionsOverride: optionsOverride,
                    title: title
                });
            }

            function clear(toastElement, clearOptions) {
                var options = getOptions();
                if (!container) { getContainer(options); }
                if (!clearToast(toastElement, options, clearOptions)) {
                    clearContainer(options);
                }
            }

            function remove(toastElement) {
                var options = getOptions();
                if (!container) { getContainer(options); }
                if (toastElement && !toastElement.querySelector(':focus')) {
                    removeToast(toastElement);
                    return;
                }
                if (container.children.length) {
                    container.remove();
                }
            }

            function clearContainer(options) {
                var toastsToClear = container.children;
                for (var i = toastsToClear.length - 1; i >= 0; i--) {
                    clearToast(toastsToClear[i], options);
                }
            }

            function clearToast(toastElement, options, clearOptions) {
                var force = clearOptions && clearOptions.force ? clearOptions.force : false;
                if (toastElement && (force || !toastElement.querySelector(':focus'))) {
                    hideElement(toastElement, options.hideDuration, options.hideEasing, function () {
                        removeToast(toastElement);
                    });
                    return true;
                }
                return false;
            }

            function createContainer(options) {
                container = document.createElement('div');
                container.id = options.containerId;
                container.classList.add(options.positionClass);

                var target = document.querySelector(options.target);
                if (target) {
                    target.appendChild(container);
                }
                return container;
            }

            function getDefaults() {
                return {
                    tapToDismiss: true,
                    toastClass: 'toast',
                    containerId: 'toast-container',
                    debug: false,

                    showMethod: 'fadeIn',
                    showDuration: 300,
                    showEasing: 'swing',
                    onShown: undefined,
                    hideMethod: 'fadeOut',
                    hideDuration: 1000,
                    hideEasing: 'swing',
                    onHidden: undefined,
                    closeMethod: false,
                    closeDuration: false,
                    closeEasing: false,
                    closeOnHover: true,

                    extendedTimeOut: 1000,
                    iconClasses: {
                        error: 'toast-error',
                        info: 'toast-info',
                        success: 'toast-success',
                        warning: 'toast-warning'
                    },
                    iconClass: 'toast-info',
                    positionClass: 'toast-top-right',
                    timeOut: 5000,
                    titleClass: 'toast-title',
                    messageClass: 'toast-message',
                    escapeHtml: false,
                    target: 'body',
                    closeHtml: '<button type="button">&times;</button>',
                    closeClass: 'toast-close-button',
                    newestOnTop: true,
                    preventDuplicates: false,
                    progressBar: false,
                    progressClass: 'toast-progress',
                    rtl: false
                };
            }

            function publish(args) {
                if (!listener) { return; }
                listener(args);
            }

            function notify(map) {
                var options = getOptions();
                var iconClass = map.iconClass || options.iconClass;

                if (typeof (map.optionsOverride) !== 'undefined') {
                    options = extend(options, map.optionsOverride);
                    iconClass = map.optionsOverride.iconClass || iconClass;
                }

                if (shouldExit(options, map)) { return; }

                toastId++;

                container = getContainer(options, true);

                var intervalId = null;
                var toastElement = document.createElement('div');
                var titleElement = document.createElement('div');
                var messageElement = document.createElement('div');
                var progressElement = document.createElement('div');
                var closeElement = createElementFromHTML(options.closeHtml);
                var progressBar = {
                    intervalId: null,
                    hideEta: null,
                    maxHideTime: null
                };
                var response = {
                    toastId: toastId,
                    state: 'visible',
                    startTime: new Date(),
                    options: options,
                    map: map
                };

                personalizeToast();

                displayToast();

                handleEvents();

                publish(response);

                if (options.debug) {
                    console.log(response);
                }

                return toastElement;

                function escapeHtml(source) {
                    if (source == null) {
                        source = '';
                    }

                    return source
                        .replace(/&/g, '&amp;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#39;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
                }

                function personalizeToast() {
                    setIcon();
                    setTitle();
                    setMessage();
                    setCloseButton();
                    setProgressBar();
                    setRTL();
                    setSequence();
                    setAria();
                }

                function setAria() {
                    var ariaValue = '';
                    switch (map.iconClass) {
                        case 'toast-success':
                        case 'toast-info':
                            ariaValue =  'polite';
                            break;
                        default:
                            ariaValue = 'assertive';
                    }
                    toastElement.setAttribute('aria-live', ariaValue);
                }

                function handleEvents() {
                    if (options.closeOnHover) {
                        toastElement.addEventListener('mouseenter', stickAround);
                        toastElement.addEventListener('mouseleave', delayedHideToast);
                    }

                    if (!options.onclick && options.tapToDismiss) {
                        toastElement.addEventListener('click', hideToast);
                    }

                    if (options.closeButton && closeElement) {
                        closeElement.addEventListener('click', function (event) {
                            event.stopPropagation();
                            if (options.onCloseClick) {
                                options.onCloseClick(event);
                            }
                            hideToast(true);
                        });
                    }

                    if (options.onclick) {
                        toastElement.addEventListener('click', function (event) {
                            options.onclick(event);
                            hideToast();
                        });
                    }
                }

                function displayToast() {
                    toastElement.style.display = 'none';
                    container.appendChild(toastElement);

                    showElement(toastElement, options.showDuration, options.showEasing, options.onShown);

                    if (options.timeOut > 0) {
                        intervalId = setTimeout(hideToast, options.timeOut);
                        progressBar.maxHideTime = parseFloat(options.timeOut);
                        progressBar.hideEta = new Date().getTime() + progressBar.maxHideTime;
                        if (options.progressBar) {
                            progressBar.intervalId = setInterval(updateProgress, 10);
                        }
                    }
                }

                function setIcon() {
                    if (map.iconClass) {
                        toastElement.classList.add(options.toastClass);
                        toastElement.classList.add(iconClass);
                    }
                }

                function setSequence() {
                    if (options.newestOnTop) {
                        container.insertBefore(toastElement, container.firstChild);
                    } else {
                        container.appendChild(toastElement);
                    }
                }

                function setTitle() {
                    if (map.title) {
                        var suffix = map.title;
                        if (options.escapeHtml) {
                            suffix = escapeHtml(map.title);
                        }
                        titleElement.innerHTML = suffix;
                        titleElement.classList.add(options.titleClass);
                        toastElement.appendChild(titleElement);
                    }
                }

                function setMessage() {
                    if (map.message) {
                        var suffix = map.message;
                        if (options.escapeHtml) {
                            suffix = escapeHtml(map.message);
                        }
                        messageElement.innerHTML = suffix;
                        messageElement.classList.add(options.messageClass);
                        toastElement.appendChild(messageElement);
                    }
                }

                function setCloseButton() {
                    if (options.closeButton) {
                        closeElement.classList.add(options.closeClass);
                        closeElement.setAttribute('role', 'button');
                        toastElement.insertBefore(closeElement, toastElement.firstChild);
                    }
                }

                function setProgressBar() {
                    if (options.progressBar) {
                        progressElement.classList.add(options.progressClass);
                        toastElement.insertBefore(progressElement, toastElement.firstChild);
                    }
                }

                function setRTL() {
                    if (options.rtl) {
                        toastElement.classList.add('rtl');
                    }
                }

                function shouldExit(options, map) {
                    if (options.preventDuplicates) {
                        if (map.message === previousToast) {
                            return true;
                        } else {
                            previousToast = map.message;
                        }
                    }
                    return false;
                }

                function hideToast(override) {
                    var method = override && options.closeMethod !== false ? options.closeMethod : options.hideMethod;
                    var duration = override && options.closeDuration !== false ?
                        options.closeDuration : options.hideDuration;
                    var easing = override && options.closeEasing !== false ? options.closeEasing : options.hideEasing;
                    if (toastElement.querySelector(':focus') && !override) {
                        return;
                    }
                    clearTimeout(progressBar.intervalId);
                    hideElement(toastElement, duration, easing, function () {
                        removeToast(toastElement);
                        clearTimeout(intervalId);
                        if (options.onHidden && response.state !== 'hidden') {
                            options.onHidden();
                        }
                        response.state = 'hidden';
                        response.endTime = new Date();
                        publish(response);
                    });
                }

                function delayedHideToast() {
                    if (options.timeOut > 0 || options.extendedTimeOut > 0) {
                        intervalId = setTimeout(hideToast, options.extendedTimeOut);
                        progressBar.maxHideTime = parseFloat(options.extendedTimeOut);
                        progressBar.hideEta = new Date().getTime() + progressBar.maxHideTime;
                    }
                }

                function stickAround() {
                    clearTimeout(intervalId);
                    progressBar.hideEta = 0;
                    showElement(toastElement, options.showDuration, options.showEasing);
                }

                function updateProgress() {
                    var percentage = ((progressBar.hideEta - (new Date().getTime())) / progressBar.maxHideTime) * 100;
                    progressElement.style.width = percentage + '%';
                }
            }

            function getOptions() {
                return extend(getDefaults(), toastr.options);
            }

            function removeToast(toastElement) {
                if (!container) { container = getContainer(); }
                if (toastElement.style.display !== 'none') {
                    return;
                }
                toastElement.remove();
                if (container.children.length === 0) {
                    container.remove();
                    previousToast = undefined;
                }
            }

            function extend() {
                var extended = {};
                for (var key in arguments) {
                    var argument = arguments[key];
                    for (var prop in argument) {
                        if (Object.prototype.hasOwnProperty.call(argument, prop)) {
                            extended[prop] = argument[prop];
                        }
                    }
                }
                return extended;
            }

            function createElementFromHTML(htmlString) {
                var div = document.createElement('div');
                div.innerHTML = htmlString.trim();
                return div.firstChild;
            }

            function showElement(element, duration, easing, callback) {
                element.style.opacity = 0;
                element.style.display = 'block';
                var opacity = 0;
                var last = +new Date();
                var tick = function () {
                    opacity += (new Date() - last) / duration;
                    element.style.opacity = opacity;
                    last = +new Date();

                    if (opacity < 1) {
                        requestAnimationFrame(tick);
                    } else {
                        if (callback) callback();
                    }
                };
                tick();
            }

            function hideElement(element, duration, easing, callback) {
                var opacity = 1;
                var last = +new Date();
                var tick = function () {
                    opacity -= (new Date() - last) / duration;
                    element.style.opacity = opacity;
                    last = +new Date();

                    if (opacity > 0) {
                        requestAnimationFrame(tick);
                    } else {
                        element.style.display = 'none';
                        if (callback) callback();
                    }
                };
                tick();
            }

        })();
    });
}(typeof define === 'function' && define.amd ? define : function (deps, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        window.toastr = factory();
    }
}));
