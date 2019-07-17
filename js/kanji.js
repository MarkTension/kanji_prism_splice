$(document).ready(function() {
  paper.setup("myCanvas");
  with (paper) {
    var global_item_var = null;

    var all_symbols = new Array();

    // url to kanjivg DB
    const KanjiVG_url =
      "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/";
    // get random kanji name
    const random_kanji =
      KanjiArray[Math.floor(Math.random() * KanjiArray.length)];
    // make path to random kanji in DB
    const url = KanjiVG_url + random_kanji;

    var itemer = project.importSVG(url, {
      expandShapes: true,
      onLoad: function(item) {
        console.log("imported SVG!");

        const center_w = paper.view.bounds.width / 2;
        const center_h = paper.view.bounds.height / 2;

        // place in middle of canvas
        item.translate(center_w - 50, center_h - 50);

        item.scale(2);

        // var circle = new Path.Circle(new Point(center_w, center_h), 100);
        // // circle.fillColor = "white";
        // // circle.opacity = 0.2;

        // Get all imported paths.
        var paths = project.getItems({
          class: Path
        });

        // remove stroke numbers
        // get ID
        let filename = Object.keys(item._namedChildren)[1];
        var numbering = project.getItem({
          name: filename
        });
        numbering.opacity = 0.0;

        // change paths initially
        for (var i = 0; i < paths.length; i++) {
          paths[i].strokeWidth = 2.0;
          paths[i].dashArray = [1, 5];
          paths[i].strokeCap = "round";

          // path line information
          let start = paths[i].segments[0].point;
          let end = paths[i].segments[paths[i].segments.length - 1].point;
          var dx = start.x - end.x;
          var dy = start.y - end.y;
          var slope = dy / dx;
          var b = start.y - slope * start.x;
          var y_intercept = [0, b];
          var x_intercept = [-b / slope, 0];

          if (y_intercept[1] > 0) {
            if (y_intercept[1] < view.bounds.height) {
              // all cases where y intercept is within bounds
              var from = new Point(0, y_intercept[1]);
              var to = new Point(
                view.bounds.width,
                view.bounds.width * slope + b
              ); // x intercept

              var path = new Path.Line(from, to);
            } else {
              // all cases where y intercept is not within bounds
              var from = new Point(
                0,
                Math.max(y_intercept[1], view.bounds.height)
              );
              var to = new Point(
                view.bounds.width,
                view.bounds.width * slope + b
              ); // x intercept
            }

            var orth_slope = -1 / slope;
            var orth_b = start.y - orth_slope * start.x;
            var orth_x_intercept = -orth_b / orth_slope;

            var edge0 = new Point(0, 0);
            var edge1 = new Point(view.bounds.width, 0);
            var pather = new Path(from, to, edge1, edge0);
            // const colors = ["Blue"].sort(function() {
            //   return 0.5 - Math.random();
            // });
            // pather.fillColor = colors[0];
            // do gradient instead
            pather.fillColor = {
              gradient: {
                stops: [["blue", 0.95], ["black", 0.05]]
              },
              origin: new Point(orth_x_intercept, 0),
              destination: new Point(start.x, start.y)
            };
          }
          if (y_intercept[1] < 0) {
            // where will it cross x?
            var from = new Point(x_intercept[0], 0);
            var to = new Point(
              (view.bounds.height - b) / slope,
              view.bounds.height
            );
            var path = new Path.Line(from, to);

            var edge0 = new Point(view.bounds.width, view.bounds.height);
            var edge1 = new Point(view.bounds.width, 0);
            var pather = new Path(from, to, edge0, edge1);
            const colors = ["red"].sort(function() {
              return 0.5 - Math.random();
            });
            pather.fillColor = colors[0];

            var orth_slope = -1 / slope;
            var orth_b = start.y - orth_slope * start.x;
            var orth_y_intercept = orth_slope * view.bounds.width + orth_b;
            console.log(
              "x intercept is " + orth_x_intercept + " for line " + (i + 1)
            );

            pather.fillColor = {
              gradient: {
                stops: [["red", 0.8], ["black", 0.2]]
              },
              origin: new Point(view.bounds.width, orth_y_intercept),
              destination: new Point(start.x, start.y)
            };
          }

          pather.opacity = "0.2";
        }

        var rect = new Path.Rectangle({
          point: [0, 0],
          size: [view.size.width, view.size.height]
        });
        rect.fillColor = "black";
        // rect.insertBelow();
        rect.sendToBack();

        var group = new Group(paths);
        group.strokeColor = "white";
        group.strokeWidth = 2;

        global_item_var = group;
      },
      onError: console.log("something went wrong importing")
    });
  }

  setTimeout(function() {
    console.log(global_item_var);
  }, 1500);
});
