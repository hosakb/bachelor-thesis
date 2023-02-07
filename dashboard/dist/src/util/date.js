"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = exports.getMonth = exports.getTodaysDate = void 0;
function getTodaysDate() {
    const date = new Date();
    return (date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate());
}
exports.getTodaysDate = getTodaysDate;
function getMonth(date) {
    return date.getMonth() + 1 + "." + (date.getFullYear() % 100);
}
exports.getMonth = getMonth;
function formatDate(date) {
    return date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear();
}
exports.formatDate = formatDate;
