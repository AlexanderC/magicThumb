<!DOCTYPE html>
<html>
<head>
    <title>jQuery Lasso Plugin test page</title>

    <script src="js/jquery.min.js"></script>
    <script src="js/jquery.magicSelect.js"></script>

    <script>
        (function($) {
            $().ready(function() {
                $(".container").magicSelect("init", {
                    selectionCallback: function(items) {
                        items.css("border", "3px outset red");
                    },
                    selectionStartCallback: function(element) {
                        element.find(".item").css("border", "3px outset #000");
                    }
                });
            });
        })(jQuery);
    </script>

    <style>
        html, body {
            width: 100%;
            height: 100%;
            overflow: hidden;
            margin: 0;
            padding: 0;
        }

        .container {
            width: 100%;
            height: 100%;
            overflow-x: hidden;
            position: relative;
            padding: 20px;
        }

        .container .item {
            display: inline-table;
            width: 50px;
            height: 50px;
            border: 3px outset #000;
            border-radius: 5px;
            margin: 10px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <?php for($i = 0; $i < 200; $i++): ?>
            <div class="item">Item #<?=$i?></div>
        <?php endfor; ?>
    </div>
</body>
</html>