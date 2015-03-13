// script loader
function loadScript(loc) {
    $.ajax({
        url: loc,
        dataType: 'script',
        async: false
    });
}


QUnit.test( "hello test", function( assert ) {
    assert.ok( 1 == "1", "Check without type" );
    assert.ok( 1 === "1", "Check with type" );
});


// test sum calculation
QUnit.test( "Calculation - Sum", function( assert ) {
    // grab data

    // test county

    // test selected
    assert.ok( 1 == "1", "Check without type" );
    assert.ok( 1 === "1", "Check with type" );
});

// test mean calculation
QUnit.test( "Calculation - Mean", function( assert ) {
    // grab data

    // test county

    // test selected
    assert.ok( 1 == "1", "Check without type" );
    assert.ok( 1 === "1", "Check with type" );
});

// test normalize calculation
QUnit.test( "Calculation - Normalize", function( assert ) {
    // grab data

    // test county

    // test selected
    assert.ok( 1 == "1", "Check without type" );
    assert.ok( 1 === "1", "Check with type" );
});
