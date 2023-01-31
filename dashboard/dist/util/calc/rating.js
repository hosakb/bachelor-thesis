"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoundedQuestionnaireAverages =
  exports.getWeightedPoints =
  exports.getRating =
  exports.getQuestionnaireAverages =
    void 0;
function getQuestionnaireAverages(questionnaire) {
  const q1_2_4_block_1 =
    (questionnaire.q1_2_4 +
      questionnaire.q1_2_5 +
      questionnaire.q1_2_6 +
      questionnaire.q1_2_7 +
      questionnaire.q1_2_8 +
      questionnaire.q1_2_9 +
      questionnaire.q1_2_10) /
    7;
  const q1_2_block_2 =
    (questionnaire.q1_2_12 +
      questionnaire.q1_2_13 +
      questionnaire.q1_2_14 +
      questionnaire.q1_2_15 +
      questionnaire.q1_2_16 +
      questionnaire.q1_2_17) /
    7;
  const q1_2_block_3 =
    (questionnaire.q1_2_18 +
      questionnaire.q1_2_19 +
      questionnaire.q1_2_20 +
      questionnaire.q1_2_21 +
      questionnaire.q1_2_22) /
    5;
  const h1_2 =
    (questionnaire.q1_2_1 +
      questionnaire.q1_2_2 +
      questionnaire.q1_2_3 +
      q1_2_4_block_1 +
      q1_2_block_2 +
      q1_2_block_3 +
      questionnaire.q1_2_23 +
      questionnaire.q1_2_24) /
    8;
  const h1_3 = (questionnaire.q1_3_1 + questionnaire.q1_3_2) / 2;
  const h1_4 =
    (questionnaire.q1_4_1 +
      questionnaire.q1_4_2 +
      questionnaire.q1_4_3 +
      questionnaire.q1_4_4) /
    4;
  const h1_5 =
    (questionnaire.q1_5_1 +
      questionnaire.q1_5_2 +
      questionnaire.q1_5_3 +
      questionnaire.q1_5_4 +
      questionnaire.q1_5_5 +
      questionnaire.q1_5_6 +
      questionnaire.q1_5_7) /
    7;
  const h1 = (questionnaire.q1_1_1 + h1_2 + h1_3 + h1_4 + h1_5) / 5;
  const h2_1 =
    (questionnaire.q2_1_1 +
      questionnaire.q2_1_2 +
      questionnaire.q2_1_3 +
      questionnaire.q2_1_4 +
      questionnaire.q2_1_5 +
      questionnaire.q2_1_6 +
      questionnaire.q2_1_7 +
      questionnaire.q2_1_8 +
      questionnaire.q2_1_9 +
      questionnaire.q2_1_10) /
    10;
  const h2_2 =
    (questionnaire.q2_2_1 + questionnaire.q2_2_2 + questionnaire.q2_2_3) / 3;
  const h2_3 =
    (questionnaire.q2_3_1 +
      questionnaire.q2_3_2 +
      questionnaire.q2_3_3 +
      questionnaire.q2_3_4 +
      questionnaire.q2_3_5 +
      questionnaire.q2_3_6) /
    6;
  const h2_4 =
    (questionnaire.q2_4_1 +
      questionnaire.q2_4_2 +
      questionnaire.q2_4_3 +
      questionnaire.q2_4_4 +
      questionnaire.q2_4_5 +
      questionnaire.q2_4_6 +
      questionnaire.q2_4_7) /
    7;
  const h2_5 =
    (questionnaire.q2_5_1 +
      questionnaire.q2_5_2 +
      questionnaire.q2_5_3 +
      questionnaire.q2_5_4 +
      questionnaire.q2_5_5 +
      questionnaire.q2_5_6 +
      questionnaire.q2_5_7 +
      questionnaire.q2_5_8) /
    8;
  const h2 = (h2_1 + h2_2 + h2_3 + h2_4 + h2_5) / 5;
  const h3_1 =
    (questionnaire.q3_1_1 +
      questionnaire.q3_1_2 +
      questionnaire.q3_1_3 +
      questionnaire.q3_1_4) /
    4;
  const h3_2 =
    (questionnaire.q3_2_1 +
      questionnaire.q3_2_2 +
      questionnaire.q3_2_3 +
      questionnaire.q3_2_4) /
    4;
  const h3 = (h3_1 + h3_2) / 2;
  const h4_1 = (questionnaire.q4_1_1 + questionnaire.q4_1_2) / 2;
  const h4_2 =
    (questionnaire.q4_2_1 +
      questionnaire.q4_2_2 +
      questionnaire.q4_2_3 +
      questionnaire.q4_2_4) /
    4;
  const h4 = (h4_1 + h4_2) / 2;
  const h5 =
    (questionnaire.q5_1_1 +
      questionnaire.q5_1_2 +
      questionnaire.q5_1_3 +
      questionnaire.q5_1_4) /
    4;
  const h6_1 =
    (questionnaire.q6_1_1 +
      questionnaire.q6_1_2 +
      questionnaire.q6_1_3 +
      questionnaire.q6_1_4 +
      questionnaire.q6_1_5) /
    5;
  const h6_2 = (questionnaire.q6_2_1 + questionnaire.q6_2_2) / 2;
  const h6_3 =
    (questionnaire.q6_3_1 +
      questionnaire.q6_3_2 +
      questionnaire.q6_3_3 +
      questionnaire.q6_3_4 +
      questionnaire.q6_3_5) /
    5;
  const h6_4 =
    (questionnaire.q6_4_1 +
      questionnaire.q6_4_2 +
      questionnaire.q6_4_3 +
      questionnaire.q6_4_4) /
    4;
  const h6_5 =
    (questionnaire.q6_5_1 + questionnaire.q6_5_2 + questionnaire.q6_5_3) / 3;
  const h6 = (h6_1 + h6_1 + h6_3 + h6_4 + h6_5) / 5;
  const h7_1 =
    (questionnaire.q7_1_1 +
      questionnaire.q7_1_2 +
      questionnaire.q7_1_3 +
      questionnaire.q7_1_4 +
      questionnaire.q7_1_5) /
    5;
  const h7_2 = (questionnaire.q7_2_1 + questionnaire.q7_2_2) / 2;
  const h7_3 =
    (questionnaire.q7_3_1 + questionnaire.q7_3_2 + questionnaire.q7_3_3) / 3;
  const h7_4 = questionnaire.q7_4_1;
  const h7_5 = questionnaire.q7_5_1;
  const h7 = (h7_1 + h7_2 + h7_3 + h7_4 + h7_5) / 5;
  const h8 =
    (questionnaire.q8_1_1 +
      questionnaire.q8_1_2 +
      questionnaire.q8_1_3 +
      questionnaire.q8_1_4 +
      questionnaire.q8_1_5 +
      questionnaire.q8_1_6) /
    8;
  const sum = h1 + h2 + h3 + h4 + h5 + h6 + h7 + h8;
  return {
    h1,
    h1_2,
    q1_2_4_block_1,
    q1_2_block_2,
    q1_2_block_3,
    h1_3,
    h1_4,
    h1_5,
    h2,
    h2_1,
    h2_2,
    h2_3,
    h2_4,
    h2_5,
    h3,
    h3_1,
    h3_2,
    h4,
    h4_1,
    h4_2,
    h5,
    h6,
    h6_1,
    h6_2,
    h6_3,
    h6_4,
    h6_5,
    h7,
    h7_1,
    h7_2,
    h7_3,
    h7_4,
    h7_5,
    h8,
    sum,
  };
}
exports.getQuestionnaireAverages = getQuestionnaireAverages;
function getRating(qAvg, weighting) {
  const h1_2 = parseFloat(getStandardRating(qAvg.h1_2).toFixed(1));
  const h1_3 = parseFloat(getStandardRating(qAvg.h1_3).toFixed(1));
  const h1_4 = parseFloat(getStandardRating(qAvg.h1_4).toFixed(1));
  const h1_5 = parseFloat(getStandardRating(qAvg.h1_5).toFixed(1));
  const h1 = parseFloat(getWeightedRating(qAvg.h1, weighting.h1).toFixed(1));
  const h2_1 = parseFloat(getStandardRating(qAvg.h2_1).toFixed(1));
  const h2_2 = parseFloat(getStandardRating(qAvg.h2_2).toFixed(1));
  const h2_3 = parseFloat(getStandardRating(qAvg.h2_3).toFixed(1));
  const h2_4 = parseFloat(getStandardRating(qAvg.h2_4).toFixed(1));
  const h2_5 = parseFloat(getStandardRating(qAvg.h2_5).toFixed(1));
  const h2 = parseFloat(getWeightedRating(qAvg.h2, weighting.h2).toFixed(1));
  const h3_1 = parseFloat(getStandardRating(qAvg.h3_1).toFixed(1));
  const h3_2 = parseFloat(getStandardRating(qAvg.h3_2).toFixed(1));
  const h3 = parseFloat(getWeightedRating(qAvg.h3, weighting.h3).toFixed(1));
  const h4_1 = parseFloat(getStandardRating(qAvg.h4_1).toFixed(1));
  const h4_2 = parseFloat(getStandardRating(qAvg.h4_2).toFixed(1));
  const h4 = parseFloat(getWeightedRating(qAvg.h4, weighting.h4).toFixed(1));
  const h5 = parseFloat(getWeightedRating(qAvg.h5, weighting.h5).toFixed(1));
  const h6_1 = parseFloat(getStandardRating(qAvg.h6_1).toFixed(1));
  const h6_2 = parseFloat(getStandardRating(qAvg.h6_2).toFixed(1));
  const h6_3 = parseFloat(getStandardRating(qAvg.h6_3).toFixed(1));
  const h6_4 = parseFloat(getStandardRating(qAvg.h6_4).toFixed(1));
  const h6_5 = parseFloat(getStandardRating(qAvg.h6_5).toFixed(1));
  const h6 = parseFloat(getWeightedRating(qAvg.h6, weighting.h6).toFixed(1));
  const h7_1 = parseFloat(getStandardRating(qAvg.h7_1).toFixed(1));
  const h7_2 = parseFloat(getStandardRating(qAvg.h7_2).toFixed(1));
  const h7_3 = parseFloat(getStandardRating(qAvg.h7_3).toFixed(1));
  const h7_4 = parseFloat(getStandardRating(qAvg.h7_4).toFixed(1));
  const h7_5 = parseFloat(getStandardRating(qAvg.h7_5).toFixed(1));
  const h7 = parseFloat(getWeightedRating(qAvg.h7, weighting.h7).toFixed(1));
  const h8 = parseFloat(getWeightedRating(qAvg.h8, weighting.h8).toFixed(1));
  const total = h1 + h2 + h3 + h4 + h5 + h6 + h7 + h8;
  return {
    h1,
    h1_2,
    h1_3,
    h1_4,
    h1_5,
    h2,
    h2_1,
    h2_2,
    h2_3,
    h2_4,
    h2_5,
    h3,
    h3_1,
    h3_2,
    h4,
    h4_1,
    h4_2,
    h5,
    h6,
    h6_1,
    h6_2,
    h6_3,
    h6_4,
    h6_5,
    h7,
    h7_1,
    h7_2,
    h7_3,
    h7_4,
    h7_5,
    h8,
    total,
  };
}
exports.getRating = getRating;
function getWeightedPoints(points, weights) {
  const h1 = parseFloat((points.h1 * weights.h1).toFixed(1));
  const h2 = parseFloat((points.h2 * weights.h2).toFixed(1));
  const h3 = parseFloat((points.h3 * weights.h3).toFixed(1));
  const h4 = parseFloat((points.h4 * weights.h4).toFixed(1));
  const h5 = parseFloat((points.h5 * weights.h5).toFixed(1));
  const h6 = parseFloat((points.h6 * weights.h6).toFixed(1));
  const h7 = parseFloat((points.h7 * weights.h7).toFixed(1));
  const h8 = parseFloat((points.h8 * weights.h8).toFixed(1));
  const sum = parseFloat((h1 + h2 + h3 + h4 + h5 + h6 + h7 + h8).toFixed(1));
  return {
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    h7,
    h8,
    sum,
  };
}
exports.getWeightedPoints = getWeightedPoints;
function getRoundedQuestionnaireAverages(avg) {
  return {
    h1: parseFloat(avg.h1.toFixed(1)),
    h1_2: parseFloat(avg.h1_2.toFixed(1)),
    q1_2_4_block_1: parseFloat(avg.q1_2_4_block_1.toFixed(1)),
    q1_2_block_2: parseFloat(avg.q1_2_block_2.toFixed(1)),
    q1_2_block_3: parseFloat(avg.q1_2_block_3.toFixed(1)),
    h1_3: parseFloat(avg.h1_3.toFixed(1)),
    h1_4: parseFloat(avg.h1_4.toFixed(1)),
    h1_5: parseFloat(avg.h1_5.toFixed(1)),
    h2: parseFloat(avg.h2.toFixed(1)),
    h2_1: parseFloat(avg.h2_1.toFixed(1)),
    h2_2: parseFloat(avg.h2_2.toFixed(1)),
    h2_3: parseFloat(avg.h2_3.toFixed(1)),
    h2_4: parseFloat(avg.h2_4.toFixed(1)),
    h2_5: parseFloat(avg.h2_5.toFixed(1)),
    h3: parseFloat(avg.h3.toFixed(1)),
    h3_1: parseFloat(avg.h3_1.toFixed(1)),
    h3_2: parseFloat(avg.h3_2.toFixed(1)),
    h4: parseFloat(avg.h4.toFixed(1)),
    h4_1: parseFloat(avg.h4_1.toFixed(1)),
    h4_2: parseFloat(avg.h4_2.toFixed(1)),
    h5: parseFloat(avg.h5.toFixed(1)),
    h6: parseFloat(avg.h6.toFixed(1)),
    h6_1: parseFloat(avg.h6_1.toFixed(1)),
    h6_2: parseFloat(avg.h6_2.toFixed(1)),
    h6_3: parseFloat(avg.h6_3.toFixed(1)),
    h6_4: parseFloat(avg.h6_4.toFixed(1)),
    h6_5: parseFloat(avg.h6_5.toFixed(1)),
    h7: parseFloat(avg.h7.toFixed(1)),
    h7_1: parseFloat(avg.h7_1.toFixed(1)),
    h7_2: parseFloat(avg.h7_2.toFixed(1)),
    h7_3: parseFloat(avg.h7_3.toFixed(1)),
    h7_4: parseFloat(avg.h7_4.toFixed(1)),
    h7_5: parseFloat(avg.h7_5.toFixed(1)),
    h8: parseFloat(avg.h8.toFixed(1)),
    sum: parseFloat(avg.sum.toFixed(1)),
  };
}
exports.getRoundedQuestionnaireAverages = getRoundedQuestionnaireAverages;
function getWeightedRating(points, weighting) {
  return 18 - (17 * points * weighting) / (5 * weighting);
}
function getStandardRating(points) {
  return 18 - (17 * points) / 5;
}
