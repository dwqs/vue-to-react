exports.parseName = function parseName (name) {
    const val = name.toLowerCase().split('-');
    let str = '';
    val.forEach(v => {
        v = v[0].toUpperCase() + v.substr(1);
        str += v;
    });
    return str;
};
