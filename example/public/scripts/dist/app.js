var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define("scripts/components/randomCat", ["require", "exports", "react", "lodash", "moment"], function (require, exports, react_1, lodash_1, moment_1) {
    "use strict";
    exports.__esModule = true;
    react_1 = __importDefault(react_1);
    lodash_1 = __importDefault(lodash_1);
    moment_1 = __importDefault(moment_1);
    exports.RandomCatComponent = function () {
        var _a = react_1["default"].useState(), cats = _a[0], setCats = _a[1];
        var _b = react_1["default"].useState(false), loading = _b[0], setLoading = _b[1];
        function fetchRandomCat() {
            return __awaiter(this, void 0, void 0, function () {
                var r, body, err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            setCats(null);
                            setLoading(true);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, fetch("https://api.thecatapi.com/v1/images/search", {
                                    credentials: 'omit',
                                    headers: {
                                        'x-api-key': '87b4a7d4-0a4f-4c20-a54d-c1ad0973e22c'
                                    }
                                })];
                        case 2:
                            r = _a.sent();
                            return [4 /*yield*/, r.json()];
                        case 3:
                            body = _a.sent();
                            setCats(body);
                            return [3 /*break*/, 5];
                        case 4:
                            err_1 = _a.sent();
                            console.error(err_1);
                            setLoading(false);
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }
        return react_1["default"].createElement("div", null,
            react_1["default"].createElement("h1", null,
                moment_1["default"]().format('dddd'),
                " is a good day for looking at cat pics"),
            react_1["default"].createElement("p", null,
                react_1["default"].createElement("button", { onClick: fetchRandomCat }, "Get random cat pic")),
            loading ? react_1["default"].createElement("p", null,
                react_1["default"].createElement("i", null, "Loading...")) : '',
            cats ? react_1["default"].createElement("p", null,
                react_1["default"].createElement("img", { width: "400", src: lodash_1["default"].get(cats, '0.url'), onLoad: function () { return setLoading(false); } })) : '',
            react_1["default"].createElement("p", null,
                react_1["default"].createElement("small", null,
                    "Cat pics provided by ",
                    react_1["default"].createElement("a", { href: "https://thecatapi.com/" }, "TheCatAPI"))));
    };
});
define("scripts/index", ["require", "exports", "react", "react-dom", "scripts/components/randomCat"], function (require, exports, react_2, react_dom_1, randomCat_1) {
    "use strict";
    exports.__esModule = true;
    react_2 = __importDefault(react_2);
    react_dom_1 = __importDefault(react_dom_1);
    function render() {
        react_dom_1["default"].render(react_2["default"].createElement(randomCat_1.RandomCatComponent), document.getElementById('root'));
    }
    exports.render = render;
    render();
});
//# sourceMappingURL=app.js.map