/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "(pages-dir-node)/./src/lib/trpc/client.ts":
/*!********************************!*\
  !*** ./src/lib/trpc/client.ts ***!
  \********************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   trpc: () => (/* binding */ trpc)\n/* harmony export */ });\n/* harmony import */ var _trpc_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @trpc/client */ \"@trpc/client\");\n/* harmony import */ var _trpc_next__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @trpc/next */ \"@trpc/next\");\n/* harmony import */ var superjson__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! superjson */ \"superjson\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_trpc_client__WEBPACK_IMPORTED_MODULE_0__, _trpc_next__WEBPACK_IMPORTED_MODULE_1__, superjson__WEBPACK_IMPORTED_MODULE_2__]);\n([_trpc_client__WEBPACK_IMPORTED_MODULE_0__, _trpc_next__WEBPACK_IMPORTED_MODULE_1__, superjson__WEBPACK_IMPORTED_MODULE_2__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\n\n\nfunction getBaseUrl() {\n    if (false) {}\n    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;\n    return 'http://localhost:3000';\n}\nconst trpc = (0,_trpc_next__WEBPACK_IMPORTED_MODULE_1__.createTRPCNext)({\n    config () {\n        return {\n            transformer: superjson__WEBPACK_IMPORTED_MODULE_2__[\"default\"],\n            links: [\n                (0,_trpc_client__WEBPACK_IMPORTED_MODULE_0__.httpBatchLink)({\n                    url: `${getBaseUrl()}/api/trpc`\n                })\n            ]\n        };\n    },\n    ssr: false\n});\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL3NyYy9saWIvdHJwYy9jbGllbnQudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUE2QztBQUNEO0FBRVY7QUFFbEMsU0FBU0c7SUFDUCxJQUFJLEtBQTZCLEVBQUUsRUFBVTtJQUM3QyxJQUFJQyxRQUFRQyxHQUFHLENBQUNDLFVBQVUsRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFRixRQUFRQyxHQUFHLENBQUNDLFVBQVUsRUFBRTtJQUN0RSxPQUFPO0FBQ1Q7QUFFTyxNQUFNQyxPQUFPTiwwREFBY0EsQ0FBWTtJQUM1Q087UUFDRSxPQUFPO1lBQ0xDLGFBQWFQLGlEQUFTQTtZQUN0QlEsT0FBTztnQkFDTFYsMkRBQWFBLENBQUM7b0JBQ1pXLEtBQUssR0FBR1IsYUFBYSxTQUFTLENBQUM7Z0JBQ2pDO2FBQ0Q7UUFDSDtJQUNGO0lBQ0FTLEtBQUs7QUFDUCxHQUFHIiwic291cmNlcyI6WyIvaG9tZS9sb2ZlcnJpcy9Db2RlL2NoYXQtYXBwL3NyYy9saWIvdHJwYy9jbGllbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaHR0cEJhdGNoTGluayB9IGZyb20gJ0B0cnBjL2NsaWVudCc7XG5pbXBvcnQgeyBjcmVhdGVUUlBDTmV4dCB9IGZyb20gJ0B0cnBjL25leHQnO1xuaW1wb3J0IHR5cGUgeyBBcHBSb3V0ZXIgfSBmcm9tICcuLi8uLi9zZXJ2ZXIvcm9vdCc7XG5pbXBvcnQgc3VwZXJqc29uIGZyb20gJ3N1cGVyanNvbic7XG5cbmZ1bmN0aW9uIGdldEJhc2VVcmwoKSB7XG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykgcmV0dXJuICcnO1xuICBpZiAocHJvY2Vzcy5lbnYuVkVSQ0VMX1VSTCkgcmV0dXJuIGBodHRwczovLyR7cHJvY2Vzcy5lbnYuVkVSQ0VMX1VSTH1gO1xuICByZXR1cm4gJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCc7XG59XG5cbmV4cG9ydCBjb25zdCB0cnBjID0gY3JlYXRlVFJQQ05leHQ8QXBwUm91dGVyPih7XG4gIGNvbmZpZygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHJhbnNmb3JtZXI6IHN1cGVyanNvbixcbiAgICAgIGxpbmtzOiBbXG4gICAgICAgIGh0dHBCYXRjaExpbmsoe1xuICAgICAgICAgIHVybDogYCR7Z2V0QmFzZVVybCgpfS9hcGkvdHJwY2AsXG4gICAgICAgIH0pLFxuICAgICAgXSxcbiAgICB9O1xuICB9LFxuICBzc3I6IGZhbHNlLFxufSk7XG4iXSwibmFtZXMiOlsiaHR0cEJhdGNoTGluayIsImNyZWF0ZVRSUENOZXh0Iiwic3VwZXJqc29uIiwiZ2V0QmFzZVVybCIsInByb2Nlc3MiLCJlbnYiLCJWRVJDRUxfVVJMIiwidHJwYyIsImNvbmZpZyIsInRyYW5zZm9ybWVyIiwibGlua3MiLCJ1cmwiLCJzc3IiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(pages-dir-node)/./src/lib/trpc/client.ts\n");

/***/ }),

/***/ "(pages-dir-node)/./src/pages/_app.tsx":
/*!****************************!*\
  !*** ./src/pages/_app.tsx ***!
  \****************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _lib_trpc_client__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/trpc/client */ \"(pages-dir-node)/./src/lib/trpc/client.ts\");\n/* harmony import */ var _styles_index_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../styles/index.css */ \"(pages-dir-node)/./src/styles/index.css\");\n/* harmony import */ var _styles_index_css__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_styles_index_css__WEBPACK_IMPORTED_MODULE_3__);\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_lib_trpc_client__WEBPACK_IMPORTED_MODULE_2__]);\n_lib_trpc_client__WEBPACK_IMPORTED_MODULE_2__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n// src/pages/_app.tsx\n\n\n\n\nfunction MyApp({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(ErrorBoundary, {\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n            ...pageProps\n        }, void 0, false, {\n            fileName: \"/home/loferris/Code/chat-app/src/pages/_app.tsx\",\n            lineNumber: 10,\n            columnNumber: 9\n        }, this)\n    }, void 0, false, {\n        fileName: \"/home/loferris/Code/chat-app/src/pages/_app.tsx\",\n        lineNumber: 9,\n        columnNumber: 9\n    }, this);\n}\n// Simple error boundary component\nclass ErrorBoundary extends react__WEBPACK_IMPORTED_MODULE_1__.Component {\n    constructor(props){\n        super(props);\n        this.state = {\n            hasError: false\n        };\n    }\n    static getDerivedStateFromError() {\n        return {\n            hasError: true\n        };\n    }\n    render() {\n        if (this.state.hasError) {\n            return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h1\", {\n                children: \"Something went wrong. Please refresh the page.\"\n            }, void 0, false, {\n                fileName: \"/home/loferris/Code/chat-app/src/pages/_app.tsx\",\n                lineNumber: 28,\n                columnNumber: 20\n            }, this);\n        }\n        return this.props.children;\n    }\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_lib_trpc_client__WEBPACK_IMPORTED_MODULE_2__.trpc.withTRPC(MyApp));\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL3NyYy9wYWdlcy9fYXBwLnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLHFCQUFxQjs7QUFDb0I7QUFFQztBQUNiO0FBRTdCLFNBQVNHLE1BQU0sRUFBRUYsU0FBUyxFQUFFRyxTQUFTLEVBQVk7SUFDN0MscUJBQ0ksOERBQUNDO2tCQUNELDRFQUFDSjtZQUFXLEdBQUdHLFNBQVM7Ozs7Ozs7Ozs7O0FBR2hDO0FBRUEsa0NBQWtDO0FBQ2xDLE1BQU1DLHNCQUFzQkosNENBQVNBO0lBQ2pDLFlBQVlLLEtBQWtDLENBQUU7UUFDNUMsS0FBSyxDQUFDQTtRQUNOLElBQUksQ0FBQ0MsS0FBSyxHQUFHO1lBQUVDLFVBQVU7UUFBTTtJQUNuQztJQUVBLE9BQU9DLDJCQUEyQjtRQUM5QixPQUFPO1lBQUVELFVBQVU7UUFBSztJQUM1QjtJQUVBRSxTQUFTO1FBQ0wsSUFBSSxJQUFJLENBQUNILEtBQUssQ0FBQ0MsUUFBUSxFQUFFO1lBQ3JCLHFCQUFPLDhEQUFDRzswQkFBRzs7Ozs7O1FBQ2Y7UUFFQSxPQUFPLElBQUksQ0FBQ0wsS0FBSyxDQUFDTSxRQUFRO0lBQzlCO0FBQ0o7QUFFQSxpRUFBZVYsa0RBQUlBLENBQUNXLFFBQVEsQ0FBQ1YsTUFBTUEsRUFBQyIsInNvdXJjZXMiOlsiL2hvbWUvbG9mZXJyaXMvQ29kZS9jaGF0LWFwcC9zcmMvcGFnZXMvX2FwcC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLy8gc3JjL3BhZ2VzL19hcHAudHN4XG5pbXBvcnQgUmVhY3QsIHsgQ29tcG9uZW50IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHR5cGUgeyBBcHBQcm9wcyB9IGZyb20gJ25leHQvYXBwJztcbmltcG9ydCB7IHRycGMgfSBmcm9tICcuLi9saWIvdHJwYy9jbGllbnQnO1xuaW1wb3J0ICcuLi9zdHlsZXMvaW5kZXguY3NzJztcblxuZnVuY3Rpb24gTXlBcHAoeyBDb21wb25lbnQsIHBhZ2VQcm9wcyB9OiBBcHBQcm9wcykge1xuICAgIHJldHVybiAoXG4gICAgICAgIDxFcnJvckJvdW5kYXJ5PlxuICAgICAgICA8Q29tcG9uZW50IHsuLi5wYWdlUHJvcHN9IC8+XG4gICAgICAgIDwvRXJyb3JCb3VuZGFyeT5cbiAgICApO1xufVxuXG4vLyBTaW1wbGUgZXJyb3IgYm91bmRhcnkgY29tcG9uZW50XG5jbGFzcyBFcnJvckJvdW5kYXJ5IGV4dGVuZHMgQ29tcG9uZW50PHtjaGlsZHJlbjogUmVhY3QuUmVhY3ROb2RlfSwge2hhc0Vycm9yOiBib29sZWFufT4ge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzOiB7Y2hpbGRyZW46IFJlYWN0LlJlYWN0Tm9kZX0pIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0geyBoYXNFcnJvcjogZmFsc2UgfTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yKCkge1xuICAgICAgICByZXR1cm4geyBoYXNFcnJvcjogdHJ1ZSB9O1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuaGFzRXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiA8aDE+U29tZXRoaW5nIHdlbnQgd3JvbmcuIFBsZWFzZSByZWZyZXNoIHRoZSBwYWdlLjwvaDE+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMuY2hpbGRyZW47XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCB0cnBjLndpdGhUUlBDKE15QXBwKTtcbiJdLCJuYW1lcyI6WyJSZWFjdCIsIkNvbXBvbmVudCIsInRycGMiLCJNeUFwcCIsInBhZ2VQcm9wcyIsIkVycm9yQm91bmRhcnkiLCJwcm9wcyIsInN0YXRlIiwiaGFzRXJyb3IiLCJnZXREZXJpdmVkU3RhdGVGcm9tRXJyb3IiLCJyZW5kZXIiLCJoMSIsImNoaWxkcmVuIiwid2l0aFRSUEMiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(pages-dir-node)/./src/pages/_app.tsx\n");

/***/ }),

/***/ "(pages-dir-node)/./src/styles/index.css":
/*!******************************!*\
  !*** ./src/styles/index.css ***!
  \******************************/
/***/ (() => {



/***/ }),

/***/ "@trpc/client":
/*!*******************************!*\
  !*** external "@trpc/client" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = import("@trpc/client");;

/***/ }),

/***/ "@trpc/next":
/*!*****************************!*\
  !*** external "@trpc/next" ***!
  \*****************************/
/***/ ((module) => {

"use strict";
module.exports = import("@trpc/next");;

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "superjson":
/*!****************************!*\
  !*** external "superjson" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = import("superjson");;

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("(pages-dir-node)/./src/pages/_app.tsx"));
module.exports = __webpack_exports__;

})();