"use strict";
exports.__esModule = true;
var utils = require("util");
var BadConfigError = /** @class */ (function () {
    function BadConfigError(message) {
        this.name = "BadConfigError";
        this.message = message;
        var er = Error;
        er.captureStackTrace(this, BadConfigError);
    }
    return BadConfigError;
}());
exports.BadConfigError = BadConfigError;
utils.inherits(BadConfigError, Error);
var NullOrEmptyArgumentError = /** @class */ (function () {
    function NullOrEmptyArgumentError(message) {
        this.name = "NullOrEmptyArgumentError";
        this.message = message;
        var er = Error;
        er.captureStackTrace(this, InvalidArgumentError);
    }
    return NullOrEmptyArgumentError;
}());
exports.NullOrEmptyArgumentError = NullOrEmptyArgumentError;
utils.inherits(NullOrEmptyArgumentError, Error);
var InvalidArgumentError = /** @class */ (function () {
    function InvalidArgumentError(message) {
        this.name = "InvalidArgumentError";
        this.message = message;
        var er = Error;
        er.captureStackTrace(this, InvalidArgumentError);
    }
    return InvalidArgumentError;
}());
exports.InvalidArgumentError = InvalidArgumentError;
utils.inherits(InvalidArgumentError, Error);
//# sourceMappingURL=CustomErrors.js.map