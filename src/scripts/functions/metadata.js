// ****************************************
// Return the nth instance of a substring
// ****************************************
function getSubstringIndex(str, substring, n) {
    var times = 0, index = null;
    while (times < n && index !== -1) {
        index = str.indexOf(substring, index+1);
        times++;
    }
    return index;
}

// ****************************************
// Update the meta fields
// ****************************************
function updateMeta() {
    // Eyes wide open for this giant hack. I'm reading the metric HTML (converted from
    // markdown in build process) and pulling substrings out to place on the page via
    // ill-advised lefty-righty kind of crap. I should probably be beaten for this.
    // Given the proclivity of the project partners to edit the metadata nearly
    // continuously for years, markdown made the most sense, and to process the result
    // into my various buckets requires this kind of hacky stuff. Needless to say you'll
    // need to update this if you screw with the metadata markdown layout at all.
    $.ajax({
        url: 'data/meta/' + $("#metric").val() + '.html',
        type: 'GET',
        dataType: 'text',
        success: function (data) {
            document.querySelector('.meta-subtitle').innerHTML = data.substring(getSubstringIndex(data, '</h2>', 1) + 5, getSubstringIndex(data, '<h3', 1));
            document.querySelector('.meta-important').innerHTML = data.substring(getSubstringIndex(data, '</h3>', 1) + 5, getSubstringIndex(data, '<h3', 2));
            document.querySelector('.meta-about').innerHTML = data.substring(getSubstringIndex(data, '</h3>', 2) + 5, getSubstringIndex(data, '<h3', 3));
            document.querySelector('.meta-resources').innerHTML = data.substring(getSubstringIndex(data, '</h3>', 3) + 5, data.length);
            // make meta tables (jesus tables really?) from markdown get the bootstrap table class
            var tables = document.querySelectorAll('.meta-container table');
            for (i = 0; i < tables.length; i++) {
                tables[i].classList.add('table', 'table-condensed');
            }
        },
        error: function (error, status, desc) {
            console.log(status, desc);
        }
    });

}
