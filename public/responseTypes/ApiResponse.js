"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
const ApiResponse = (data, message, status) => {
    return {
        data: data || null,
        message: message || '',
        status: status || 200,
    };
};
exports.ApiResponse = ApiResponse;
//# sourceMappingURL=ApiResponse.js.map