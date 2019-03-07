
function indexToColumn(n: number) {
    var arr = [];
    while (n >= 0) {
        arr.push( String.fromCharCode(0x41 + (n % 26)));
        n = Math.floor(n /26) -1;
    }
    return arr.reverse().join("");
}

/**
 * Parses Excel indexing into numbers
 * @param str the econded string starting with the letter
 * @returns the idx of where we stopped reading and the number
 */
function columnToIndex(str: string, startptr?: number) : [number, number] {
    var res = 0;
    var ptr = startptr || 0;
    while (ptr < str.length && str[ptr].charCodeAt(0) - 'A'.charCodeAt(0) < 26 && str[ptr].charCodeAt(0) >= 'A'.charCodeAt(0)) {
        res = res*26 + 1;
        res += str[ptr].charCodeAt(0) - 'A'.charCodeAt(0);
        ptr++;
    }
    return [ptr, res - 1];
}

/**
 * Parses the number of cols and rows given a ref ie A1:Z20
 */
function parseRef(str: string) : [number, number] {
    var spt = str.split(":");
    if (spt.length != 2) return [0, 0];
    var [ptr, cols] = columnToIndex(spt[1]);
    var rows = parseInt(spt[1].slice(ptr), 10);
    return [cols + 1, rows];
}

export {columnToIndex, indexToColumn, parseRef}