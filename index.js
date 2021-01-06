var rect = {
  perimeter: (x, y) => 2 * (x + y),
  area: (x, y) => x * y,
};

function solveRect(length, breadth) {
  console.log(
    "Solving for rectangle with length =  " + length + " breadth =  " + breadth
  );
  if (length <= 0 || breadth <= 0) {
    console.log(
      "Rectangle dimensions should be greater than zero:length =  " +
        length +
        " breadth = " +
        breadth
    );
  } else {
    console.log("The area of the rectangle is " + rect.area(length, breadth));
    console.log(
      "The perimeter of the rectangle is " + rect.perimeter(length, breadth)
    );
  }
}
solveRect(2, 4);
solveRect(3, 5);
solveRect(0, 5);
solveRect(-3, 5);
