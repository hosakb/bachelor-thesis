"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getTodaysDate() {
  const date = new Date();
  return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
}
exports.default = getTodaysDate;
