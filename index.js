var rect = require("./rectangle");

function solveRect(length, breadth) {
  console.log(
    "Solving for rectangle with length =  " + length + " breadth =  " + breadth
  );
  rect(length, breadth, (err, rectangle) => {
    if (err) {
      console.log("ERROR: ", err.message);
    } else {
      console.log(
        "The area of the rectangle of dimensions length =  " +
          length +
          " and breadth = " +
          breadth +
          " is " +
          rectangle.area()
      );
      console.log(
        "The perimeter of the rectangle of dimensions length =  " +
          length +
          " and breadth = " +
          breadth +
          " is " +
          rectangle.perimeter()
      );
    }
  });
}
console.log("This statement is after the call to rect()");
solveRect(2, 4);
solveRect(3, 5);
solveRect(0, 5);
solveRect(-3, 5);
