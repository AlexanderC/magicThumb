/**
 * @author AlexanderC
 */

(function ($) {
    //=============== init custom exceptions ================//
    function SomeDataExpectedException(message) {
        this.message = message || "Some data is expected here";
        console.log(this.message);
    }

    SomeDataExpectedException.prototype = new Error();
    SomeDataExpectedException.prototype.constructor = SomeDataExpectedException;

    function NotEnoughArgumentsException(message) {
        this.message = message || "Not enough arguments provided";
        console.log(this.message);
    }

    NotEnoughArgumentsException.prototype = new Error();
    NotEnoughArgumentsException.prototype.constructor = NotEnoughArgumentsException;

    function ElementNotFoundException(message) {
        this.message = message || "Missing required element";
        console.log(this.message);
    }

    ElementNotFoundException.prototype = new Error();
    ElementNotFoundException.prototype.constructor = ElementNotFoundException;
    //=============== end init custom exceptions ================//

    var debug = false; // debug mode flag
    var itemsSelector = ".item"; // items that should be found when applying
    var eventsNamespace = ".magicSelect"; // used for binding & unbinding certain events
    var lassoActiveClass = "active-lasso"; // Class applied when selecting area is active
    var selectionCallback = false; // Callback applied after selecting an area
    var selectionStartCallback = false; // Callback applied on start selecting
    var lassoHtml = '<div class="active-lasso-selection-zone"></div>'; // html of the selection zone
    var lassoStyle = {
        border: "1px solid #009874",
        opacity: "0.3",
        background: "#40E0D0",
        width: 0,
        height: 0,
        display: "none",
        position: "absolute"
    }; // object applied to style selecting area using css jquery method
    var activeAreaStyle = {
        "user-select": "none",
        "-webkit-tap-highlight-color": "rgba(0,0,0,0)",
        "user-drag": "none"
    }; // style extending main selecting area while doing selection
    var areaCloneHtml = '<div class="active-lasso-clone-area"></div>'; // html of the clone area inserted while selecting
    var areaCloneCss = {
        position: "fixed",
        margin: 0,
        padding: 0,
        "z-index": 10,
        background: "transparent",
        display: "none",
        top: 0,
        left: 0,
        overflow: "hidden"
    }; // style applied on area clone
    var lassoInfoDataAttribute = 'info'; // data attribute name that would contain some info

    /**
     *
     * @type {{init: Function}}
     */
    var methods = {
        init: function (options) {
            debug = options.debug || debug;

            if (debug && this.length <= 0)
                throw new ElementNotFoundException("No selecting area chosen");

            itemsSelector = options.itemsSelector || itemsSelector;
            eventsNamespace = options.eventsNamespace || eventsNamespace;
            lassoActiveClass = options.lassoActiveClass || lassoActiveClass;
            selectionCallback = options.selectionCallback || selectionCallback;
            lassoHtml = options.lassoHtml || lassoHtml;
            lassoStyle = options.lassoStyle || lassoStyle;
            activeAreaStyle = options.activeAreaStyle || activeAreaStyle;
            areaCloneHtml = options.areaCloneHtml || areaCloneHtml;
            areaCloneCss = options.areaCloneCss || areaCloneCss;
            lassoInfoDataAttribute = options.lassoInfoDataAttribute || lassoInfoDataAttribute;
            selectionStartCallback = options.selectionStartCallback || selectionStartCallback;

            this.each(function () {
                var element = $(this);
                var items = element.find(itemsSelector);
                var eventsString = "mousedown" + eventsNamespace + " mouseup" + eventsNamespace;
                var action = {
                    start: null,
                    end: null
                };
                var lassoObj = null;
                var elementStyleDump = fn.getElementComputedStyle(this);

                element.unbind(eventsString);
                element.bind(eventsString, function (event) {
                    if (event.type == "mousedown") { // start selecting
                        action.start = event;
                        element.addClass(lassoActiveClass);
                        lassoObj = logic.keepLassoMoving(element);
                        element.css($.extend(elementStyleDump, activeAreaStyle));

                        if (fn.isCallback(selectionStartCallback)) {
                            selectionStartCallback(element);
                        }
                    } else { // end selecting
                        if (element.hasClass(lassoActiveClass)) {
                            action.end = event;

                            if (fn.isCallback(selectionCallback)) {
                                selectionCallback(logic.getItemsSelected(element, logic.getAreaInfo(lassoObj)));
                            }
                            element.removeClass(lassoActiveClass)
                            logic.stopLassoMoving(lassoObj);
                            element.css(elementStyleDump);
                        }
                    }
                });
            });
        }
    };

    /**
     *
     * @type {{getItemsSelected: Function, keepLassoMoving: Function, stopLassoMoving: Function, getAreaInfo: Function}}
     */
    var logic = {
        getItemsSelected: function (area, areaInfo) {
            var stack = $();

            area.find(itemsSelector).each(function () {
                var element = $(this);
                var elementInfo = $.extend({
                    width: element.outerWidth(),
                    height: element.outerHeight()
                }, element.offset());

                if (fn.isElementCollidingWithArea(elementInfo, areaInfo)) {
                    $.merge(stack, element);
                }
            });

            return stack;
        },
        keepLassoMoving: function (area) {
            var areaEvent = "mousemove" + eventsNamespace;
            var mouseUpWindowEvent = "mouseup" + eventsNamespace;

            var areaClone = $(areaCloneHtml);
            areaClone.css(areaCloneCss);
            areaClone.appendTo(area);
            var areaDimensions = {
                width: area.outerWidth() + "px",
                height: area.outerHeight() + "px"
            };
            areaClone.css(areaDimensions);

            var lasso = $(lassoHtml);
            lasso.css(lassoStyle);
            lasso.appendTo(areaClone);

            areaClone.show();

            var lassoStartPosition = {};
            var lassoScrollStartPosition = {};

            var mainScrollEvent = "scroll" + eventsNamespace;

            // this can happen when mouseUp outside container
            $(window).bind(mouseUpWindowEvent, function () {
                logic.stopLassoMoving(areaClone);
                area.unbind(mainScrollEvent);
                $("body").unbind(mainScrollEvent);
                $(window).unbind(mouseUpWindowEvent);
            });

            var lastMouseEventOnArea = null;

            $("body").bind(mainScrollEvent, function(event) {
                var areaOffset = area.offset();

                if(areaOffset.top > 0) {
                    areaClone.trigger(lastMouseEventOnArea);
                }
            });

            area.bind(mainScrollEvent, function(event) {
                areaClone.trigger(lastMouseEventOnArea);
            });

            areaClone.bind(areaEvent, function (event) {
                lastMouseEventOnArea = $.extend($.Event(event.type), event);

                if (fn.elementExistsAlongsideRemoving(areaClone)) {
                    var realOffset = {left: event.pageX, top: event.pageY};

                    var areaOffset = area.offset();

                    var newLassoScrollPosition = {
                        top: area.scrollTop() - (areaOffset.top > 0 ? areaOffset.top : 0),
                        left: area.scrollLeft() - (areaOffset.left > 0 ? areaOffset.left : 0)
                    };
                    var info = {};

                    if ($.isEmptyObject(lassoStartPosition)) {
                        lassoStartPosition = {
                            left: realOffset.left,
                            top: realOffset.top
                        };

                        lasso.css({
                            top: lassoStartPosition.top + "px",
                            left: lassoStartPosition.left + "px"
                        });

                        info = $.extend({width: 0, height: 0}, lassoStartPosition);

                        lassoScrollStartPosition = newLassoScrollPosition;

                        lasso.show();
                    } else {
                        var lassoTopDiff = (newLassoScrollPosition.top - lassoScrollStartPosition.top);
                        var lassoLeftDiff = (newLassoScrollPosition.left - lassoScrollStartPosition.left);

                        lassoStartPosition.top -= lassoTopDiff;
                        lassoStartPosition.left -= lassoLeftDiff;
                        // and reset old position
                        lassoScrollStartPosition = newLassoScrollPosition;

                        var lassoTop = realOffset.top - lassoStartPosition.top;
                        var lassoLeft = realOffset.left - lassoStartPosition.left;

                        var newTop = lassoTop < 0 ? realOffset.top : lassoStartPosition.top;
                        var newLeft = lassoLeft < 0 ? realOffset.left : lassoStartPosition.left;
                        var lassoHeight = Math.abs(lassoTop);
                        var lassoWidth = Math.abs(lassoLeft);

                        lasso.css({
                            top: newTop + "px",
                            left: newLeft + "px",
                            width: lassoWidth,
                            height: lassoHeight
                        });

                        info = {
                            top: newTop,
                            left: newLeft,
                            width: lassoWidth,
                            height: lassoHeight
                        }
                    }

                    areaClone.data(lassoInfoDataAttribute, info);
                } else {
                    areaClone.unbind(areaEvent);
                }
            });

            return areaClone;
        },
        stopLassoMoving: function (lassoObj) {
            if (lassoObj) {
                lassoObj.remove();
            }
        },
        getAreaInfo: function (lassoObj) {
            return lassoObj.data(lassoInfoDataAttribute);
        }
    };

    /**
     *
     * @type {{isElementCollidingWithArea: Function, isCallback: Function, elementExistsAlongsideRemoving: Function, getElementComputedStyle: Function}}
     */
    var fn = {
        isElementCollidingWithArea: function (element, area) {
            if($.isEmptyObject(element) || $.isEmptyObject(area)) {
                return false;
            }

            return !(area.left > (element.left + element.width) ||
                (area.left + area.width) < element.left ||
                area.top > (element.top + element.height) ||
                (area.top + area.height) < element.top);
        },
        isCallback: function (func) {
            return func instanceof Function;
        },
        elementExistsAlongsideRemoving: function (element) {
            return element && element.is("html *");
        },
        getElementComputedStyle: function (dom) {
            var style;
            var returns = {};
            // FireFox and Chrome way
            if (window.getComputedStyle) {
                style = window.getComputedStyle(dom, null);
                for (var i = 0, l = style.length; i < l; i++) {
                    var prop = style[i];
                    var val = style.getPropertyValue(prop);
                    returns[prop] = val;
                }
                return returns;
            }
            // IE and Opera way
            if (dom.currentStyle) {
                style = dom.currentStyle;
                for (var prop in style) {
                    returns[prop] = style[prop];
                }
                return returns;
            }
            // Style from style attribute
            if (style = dom.style) {
                for (var prop in style) {
                    if (typeof style[prop] != 'function') {
                        returns[prop] = style[prop];
                    }
                }
                return returns;
            }
            return returns;
        }
    };

    /**
     * Init method of the plugin
     *
     * @param method
     * @returns {*}
     */
    $.fn.magicSelect = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.magicSelect');
        }
    };
})(jQuery);