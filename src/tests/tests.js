// fake data for testing
var metric = [
  {
    "id": "1",
    "y_2010": "20.39"
  },
  {
    "id": "2",
    "y_2010": "65.63"
  },
  {
    "id": "3",
    "y_2010": "10.02"
  },
  {
    "id": "4",
    "y_2010": "6.03"
  },
  {
    "id": "5",
    "y_2010": ""
  },
  {
    "id": "6",
    "y_2010": "11.93"
  },
  {
    "id": "7",
    "y_2010": "17.61"
  },
  {
    "id": "8",
    "y_2010": "5.38"
  },
  {
    "id": "9",
    "y_2010": "33.55"
  },
  {
    "id": "10",
    "y_2010": "23.57"
  }
];

var metric2 = [
  {
    "id": "1",
    "y_2010": "59967"
  },
  {
    "id": "2",
    "y_2010": "238992"
  },
  {
    "id": "3",
    "y_2010": "44106"
  },
  {
    "id": "4",
    "y_2010": "18030"
  },
  {
    "id": "5",
    "y_2010": ""
  },
  {
    "id": "6",
    "y_2010": "46732"
  },
  {
    "id": "7",
    "y_2010": "63759"
  },
  {
    "id": "8",
    "y_2010": "14575"
  },
  {
    "id": "9",
    "y_2010": "130282"
  },
  {
    "id": "10",
    "y_2010": "102920"
  }
];

// test sum calculation
QUnit.test( "Calculation - Sum", function( assert ) {
    // test county
    assert.equal( dataSum(metric, "y_2010").toFixed(2), 194.11, "Check County Sum" );
    // test selected
    assert.equal( dataSum(metric, "y_2010", ["5", "6", "7", "8", "9", "10"]).toFixed(2), 92.04, "Check Selected Sum" );
    // test selected are null
    assert.equal( dataSum(metric, "y_2010", ["5"]), "N/A", "Check Selected Sum is Null" );
});

// test mean calculation
QUnit.test( "Calculation - Mean", function( assert ) {
    // test county
    assert.equal( dataMean(metric, "y_2010").toFixed(2), 21.57, "Check County Mean" );
    // test selected
    assert.equal( dataMean(metric, "y_2010", ["5", "6", "7", "8", "9", "10"]).toFixed(2), 18.41, "Check Selected Mean" );
    // test selected are null
    assert.equal( dataMean(metric, "y_2010", ["5"]), "N/A", "Check Selected Mean is Null" );
});

// test normalize calculation
QUnit.test( "Calculation - Weighted", function( assert ) {
    // test county
    assert.equal( dataWeighted(metric2, metric, "y_2010").toFixed(2), 3705.96, "Check County Normalized" );
    // test selected
    assert.equal( dataWeighted(metric2, metric, "y_2010", ["5", "6", "7", "8", "9", "10"]).toFixed(2), 3892.52, "Check Selected Normalized" );
    // test selected are null
    assert.equal( dataWeighted(metric2, metric, "y_2010", ["5"]), "N/A", "Check Selected Normalized is Null" );
});

// test normalize calculation
QUnit.test( "Calculation - Median", function( assert ) {
    // test median
    assert.equal( median([5, 13, 54, 32, 100, 12, 5]), 13, "Check Median - Odd number of values");
    // test median even number of values
    assert.equal( median([5, 13, 54, 32, 100, 12]), 22.5, "Check Median - Even number of values");
});
