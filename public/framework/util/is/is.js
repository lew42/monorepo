const is = {
    arr(value) {
        return Array.isArray(value);
    },
    obj(value) {
        return !!value && typeof value === 'object' && !is.arr(value);
    },
    str(value) {
        return typeof value === 'string';
    },
    num(value) {
        return typeof value === 'number';
    },
    bool(value) {
        return typeof value === 'boolean';
    },
    fn(value) {
        return typeof value === 'function';
    },
    def(value) {
        return typeof value !== 'undefined';
    },
    undef(value) {
        return typeof value === 'undefined';
    },
    // ⚠ false for an ARROW function — it has no prototype.
    class(value) {
        return typeof value === 'function' && value.prototype !== undefined;
    },
    // ⚠ false for Object.create(null) — no constructor at all.
    pojo(value) {
        return is.obj(value) && value.constructor === Object;
    },
    proto(value) {
        return is.obj(value) && !!value.constructor && value.constructor.prototype === value;
    },
    dom(value) {
        return !!value && value.nodeType > 0;
    },
    el(value) {
        return !!value && value.nodeType === 1;
    },
    // thenable, so a polyfill counts
    promise(value) {
        return !!value && typeof value.then === 'function';
    },
    // ⚠ browser only
    mobile() {
        return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop|Mobile/i.test(navigator.userAgent);
    }
};

export default is;
export { is };
