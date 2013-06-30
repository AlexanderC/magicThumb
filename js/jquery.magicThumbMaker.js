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
    var activeAreaStyle = {
        "user-select": "none",
        "-webkit-tap-highlight-color": "rgba(0,0,0,0)",
        "user-drag": "none"
    }; // style extending main moving area while doing thumb placements
    var imgDataAttribute = "img"; // data attribute containing image source
    var sizeDataAttribute = "size"; // attribute optionally used for getting area w/h, default is innerW/H
    var loaderHtml = '<div class="magic-thumb-maker-loader"></div>'; // html used for inserting loader
    var loaderSource = "data:image/gif;base64,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"; // Loader source shown while loading main image
    var startMovingCallback = false; // Callback applied when user starts moving image
    var whileMovingCallback = false; // Callback applied while user keep moving image
    var endMovingCallback = false; // Callback applied when user ends moving image
    var eventsNamespace = ".magicThumbMaker"; // Namespace used for all events

    /**
     *
     * @type {{init: Function}}
     */
    var methods = {
        init: function (options) {
            debug = options.debug || debug;

            if (debug && this.length <= 0)
                throw new ElementNotFoundException("No thumb area chosen");

            activeAreaStyle = options.activeAreaStyle || activeAreaStyle;
            imgDataAttribute = options.imgDataAttribute || imgDataAttribute;
            sizeDataAttribute = options.sizeDataAttribute || sizeDataAttribute;
            loaderSource = options.loaderSource || loaderSource;
            startMovingCallback = options.startMovingCallback || startMovingCallback;
            whileMovingCallback = options.whileMovingCallback || whileMovingCallback;
            endMovingCallback = options.endMovingCallback || endMovingCallback;
            eventsNamespace = options.eventsNamespace || eventsNamespace;
            loaderHtml = options.loaderHtml || loaderHtml;

            this.each(function () {
                var container = $(this);
                var containerSize = container.data(sizeDataAttribute) || {
                    width: container.width(),
                    height: container.height()
                };

                var containerStartEvents = "mousedown" + eventsNamespace + " mouseup" + eventsNamespace;
                var containerMoveEvents = "mousemove" + eventsNamespace + " mouseleave" + eventsNamespace;

                var isMoving = false;

                // define default background position
                var moveInfo = {
                    top: 0,
                    left: 0
                };
                moveInfo.height = containerSize.height;
                moveInfo.width = containerSize.width;

                var loader = $(loaderHtml);
                loader.css({
                    position: "absolute",
                    height: containerSize.height + "px",
                    width: containerSize.width + "px",
                    margin: 0,
                    padding: 0,
                    background: "url(" + loaderSource + ") no-repeat center",
                    display: "none"
                });
                loader.appendTo(container);
                loader.fadeIn("fast");

                var image = new Image();
                image.src = container.data(imgDataAttribute);
                var imageElement = $(image);
                imageElement.css({
                    width: 0,
                    height: 0
                });
                imageElement.appendTo("body");

                imageElement.load(function() {
                    loader.fadeOut("fast", function() {
                        loader.remove();
                    });
                    imageElement.remove();

                    // set background position
                    logic.moveBackground(moveInfo, container, image);

                    var startEvent = {};

                    container.unbind(containerStartEvents);
                    container.bind(containerStartEvents, function(event) {
                        if(event.type == "mousedown") {
                            logic.assureCompatibleEventData(event, container);

                            startEvent = $.extend(startEvent, event);
                            startEvent.offsetX += moveInfo.left;
                            startEvent.offsetY += moveInfo.top;

                            if(fn.isCallback(startMovingCallback)) {
                                var info = $.extend({}, moveInfo);
                                info.top = Math.abs(info.top);
                                info.left = Math.abs(info.left);

                                startMovingCallback(info, container, image);
                            }

                            isMoving = true;
                        } else {
                            if(isMoving) {
                                if(fn.isCallback(endMovingCallback)) {
                                    var info = $.extend({}, moveInfo);
                                    info.top = Math.abs(info.top);
                                    info.left = Math.abs(info.left);

                                    endMovingCallback(info, container, image);
                                }
                            }

                            isMoving = false;
                        }
                    });

                    var containerDiffImage = {
                        top: image.height - containerSize.height,
                        left: image.width - containerSize.width
                    };

                    container.unbind(containerMoveEvents);
                    container.bind(containerMoveEvents, function(event) {
                        if(event.type == "mousemove") {
                            if(isMoving) {
                                logic.assureCompatibleEventData(event, container);

                                moveInfo = {
                                    top: startEvent.offsetY - event.offsetY,
                                    left: startEvent.offsetX - event.offsetX
                                };

                                // do not allow image wrong positioning
                                moveInfo.top = moveInfo.top <= 0 ? moveInfo.top : 0;
                                moveInfo.left = moveInfo.left <= 0 ? moveInfo.left : 0;

                                moveInfo.top = moveInfo.top >= -containerDiffImage.top ? moveInfo.top : -containerDiffImage.top;
                                moveInfo.left = moveInfo.left >= -containerDiffImage.left ? moveInfo.left : -containerDiffImage.left;

                                logic.moveBackground(moveInfo, container, image);

                                if(fn.isCallback(whileMovingCallback)) {
                                    var info = $.extend({}, moveInfo);
                                    info.top = Math.abs(info.top);
                                    info.left = Math.abs(info.left);

                                    whileMovingCallback(info, container, image);
                                }
                            }
                        } else {
                            container.trigger("mouseup" + eventsNamespace);
                        }
                    });
                });
            });
        }
    };

    /**
     *
     * @type {{moveBackground: Function, assureCompatibleEventData: Function}}
     */
    var logic = {
        moveBackground: function(moveInfo, container, image) {
            container.css({
                background: "url(" + image.src + ") no-repeat",
                "background-position": moveInfo.left + "px " + moveInfo.top + "px"
            });
        },
        assureCompatibleEventData: function(event, container) {
            if(!event.offsetX && !event.offsetY) {
                var offset = container.offset();

                event.offsetX = event.pageX - offset.left;
                event.offsetY = event.pageY - offset.top;
            }
        }
    };

    /**
     *
     * @type {{isCallback: Function}}
     */
    var fn = {
        isCallback: function (func) {
            return func instanceof Function;
        }
    };

    /**
     * Init method of the plugin
     *
     * @param method
     * @returns {*}
     */
    $.fn.magicThumbMaker = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.magicThumbMaker');
        }
    };
})(jQuery);