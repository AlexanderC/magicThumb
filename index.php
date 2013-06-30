<!DOCTYPE html>
<html>
<head>
    <title>jQuery Thumb Maker Plugin test page</title>

    <script src="js/jquery.min.js"></script>
    <script src="js/jquery.magicThumbMaker.js"></script>

    <script>
        (function($) {
            $().ready(function() {
                var start = $(".start");
                var moving = $(".moving");
                var end = $(".end");

                $(".image-area").magicThumbMaker("init", {
                    startMovingCallback: function(moveInfo, container, image) {
                        start.css({
                            border: "2px solid #000"
                        });
                        moving.css({
                            border: "2px solid #40E0D0"
                        });

                        console.log("start");
                    },
                    whileMovingCallback: function(moveInfo, container, image) {
                        start.css({
                            border: "2px solid #40E0D0"
                        });
                        moving.css({
                            border: "2px solid #000"
                        });

                        console.log("moving...");
                    },
                    endMovingCallback: function(moveInfo, container, image) {
                        start.css({
                            border: "2px solid #40E0D0"
                        });
                        moving.css({
                            border: "2px solid #40E0D0"
                        });
                        end.html("T-" + moveInfo.top + "/L-" + moveInfo.left);

                        console.log(moveInfo);
                    }
                });
            });
        })(jQuery);
    </script>

    <style>
        html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
        }

        .container {
            width: 100%;
            height: 100%;
            overflow-x: hidden;
            position: relative;
            margin: 20px;
        }

        .container .image-area {
            margin: auto;
            height: 200;
            width: 200;
            padding: 0;
            border: 3px solid #40E0D0;
            border-radius: 10px;
            width: 200px;
            height: 200px;
            cursor: pointer;
        }

        .container .info {
            width: 100%:
            height: 100%;
            text-align: center;
            padding: 20px;
        }

        .container .info .info-block {
            display: inline-block;
            width: 100px;
            height: 60px;
            border-radius: 50px;
            background-color: #40E0D0;
            text-transform: UPPERCASE;
            border: 2px solid #40E0D0;
            padding-top: 40px;
        }

        h4 {
            padding: 0 0 0 20px;
        }
    </style>
</head>
<body>
    <h4><a href="#" rel="me follow">Back to the blog...</a></h4>
    <div class="container">
        <div class="image-area" data-img="img/homealone.jpg" data-size='{"width": 200, "height": 200}'>
            <!-- Thumbnail Container -->
        </div>

        <div class="info">
            <div class="info-block start">start</div>
            <div class="info-block moving">moving</div>
            <div class="info-block end">&ndash;</div>
        </div>
    </div>
</body>
</html>