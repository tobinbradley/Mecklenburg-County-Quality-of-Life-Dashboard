// Ye olde prototypes. A big man would have more stuff here. I AM NOT A BIG MAN.

String.prototype.commafy = function () {
    return this.replace(/(^|[^\w.])(\d{4,})/g, function($0, $1, $2) {
        return $1 + $2.replace(/\d(?=(?:\d\d\d)+(?!\d))/g, "$&,");
    });
};
Number.prototype.commafy = function () {
    return String(this).commafy();
};

// adds an element to the array if it does not already exist using a comparer
// function
Array.prototype.pushIfNotExist = function(element) {
    if (this.indexOf(element) === -1) {
        this.push(element);
    }
    return this;
};
