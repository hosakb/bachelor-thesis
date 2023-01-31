"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonth = exports.getTodaysDate = void 0;
function getTodaysDate() {
  const date = new Date();
  return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
}
exports.getTodaysDate = getTodaysDate;
function getMonth(date) {
  return date.getMonth() + "-" + date.getFullYear();
}
exports.getMonth = getMonth;
