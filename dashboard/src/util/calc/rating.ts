import { Weights } from "../../models/fund";
import {
  Questionnaire,
  QuestionnaireAvg,
  Rating,
  WeightedPoints,
} from "../../models/startup";

export function getQuestionnaireAverages(
  questionnaire: Questionnaire
): QuestionnaireAvg {
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
    (questionnaire.q1_2_11 +
      questionnaire.q1_2_12 +
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

  const h1 = (questionnaire.q1_1_1 + h1_2 + h1_3 + h1_4) / 4;

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
    (questionnaire.q2_3_1 + questionnaire.q2_3_2 + questionnaire.q2_3_3) / 3;

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
      questionnaire.q2_5_6) /
    6;

  const h2 = (h2_1 + h2_2 + h2_3 + h2_4 + h2_5) / 5;

  const h3 =
    (questionnaire.q3_1_1 +
      questionnaire.q3_1_2 +
      questionnaire.q3_1_3 +
      questionnaire.q3_1_4) /
    4;

  const h4 = (questionnaire.q4_1_1 + questionnaire.q4_1_2) / 2;

  const h5 =
    (questionnaire.q5_1_1 + questionnaire.q5_1_2 + questionnaire.q5_1_3) / 3;

  const h6_1 = (questionnaire.q6_1_1 + questionnaire.q6_1_2) / 2;

  const h6_2 =
    (questionnaire.q6_2_1 +
      questionnaire.q6_2_2 +
      questionnaire.q6_2_3 +
      questionnaire.q6_2_4 +
      questionnaire.q6_2_5) /
    5;

  const h6_3 =
    (questionnaire.q6_3_1 +
      questionnaire.q6_3_2 +
      questionnaire.q6_3_3 +
      questionnaire.q6_3_4) /
    4;

  const h6_4 =
    (questionnaire.q6_4_1 + questionnaire.q6_4_2 + questionnaire.q6_4_3) / 3;

  const h6 = (h6_1 + h6_1 + h6_3 + h6_4) / 4;

  const h7_1 =
    (questionnaire.q7_1_1 +
      questionnaire.q7_1_2 +
      questionnaire.q7_1_3 +
      questionnaire.q7_1_4 +
      questionnaire.q7_1_5 +
      questionnaire.q7_1_6) /
    6;

  const h7_2 = (questionnaire.q7_2_1 + questionnaire.q7_2_2) / 2;

  const h7 = (h7_1 + h7_2) / 2;

  const h8 = (questionnaire.q8_1_1 + questionnaire.q8_1_2) / 2;

  const sum = h1 + h2 + h3 + h4 + h5 + h6 + h7 + h8;

  return {
    h1,
    h1_1: questionnaire.q1_1_1,
    h1_2,
    q1_2_4_block_1,
    q1_2_block_2,
    q1_2_block_3,
    h1_3,
    h1_4,
    h2,
    h2_1,
    h2_2,
    h2_3,
    h2_4,
    h2_5,
    h3,
    h4,
    h5,
    h6,
    h6_1,
    h6_2,
    h6_3,
    h6_4,
    h7,
    h7_1,
    h7_2,
    h8,
    sum,
  };
}

export function getAllRatings(qAvg: QuestionnaireAvg): Rating {
  const h1_2 = getRating(qAvg.h1_2);

  const h1_3 = getRating(qAvg.h1_3);

  const h1_4 = getRating(qAvg.h1_4);

  const h1 = getRating(qAvg.h1);

  const h2_1 = getRating(qAvg.h2_1);

  const h2_2 = getRating(qAvg.h2_2);

  const h2_3 = getRating(qAvg.h2_3);

  const h2_4 = getRating(qAvg.h2_4);

  const h2_5 = getRating(qAvg.h2_5);

  const h2 = getRating(qAvg.h2);

  const h3 = getRating(qAvg.h3);

  const h4 = getRating(qAvg.h4);

  const h5 = getRating(qAvg.h5);

  const h6_1 = getRating(qAvg.h6_1);

  const h6_2 = getRating(qAvg.h6_2);

  const h6_3 = getRating(qAvg.h6_3);

  const h6_4 = getRating(qAvg.h6_4);

  const h6 = getRating(qAvg.h6);

  const h7_1 = getRating(qAvg.h7_1);

  const h7_2 = getRating(qAvg.h7_2);

  const h7 = getRating(qAvg.h7);

  const h8 = getRating(qAvg.h8);

  return {
    h1,
    h1_2,
    h1_3,
    h1_4,
    h2,
    h2_1,
    h2_2,
    h2_3,
    h2_4,
    h2_5,
    h3,
    h4,
    h5,
    h6,
    h6_1,
    h6_2,
    h6_3,
    h6_4,
    h7,
    h7_1,
    h7_2,
    h8,
  };
}

export function getWeightedPoints(
  points: QuestionnaireAvg,
  weights: Weights
): WeightedPoints {
  const h1 = points.h1 * weights.h1;
  const h2 = points.h2 * weights.h2;
  const h3 = points.h3 * weights.h3;
  const h4 = points.h4 * weights.h4;
  const h5 = points.h5 * weights.h5;
  const h6 = points.h6 * weights.h6;
  const h7 = points.h7 * weights.h7;
  const h8 = points.h8 * weights.h8;
  const sum = h1 + h2 + h3 + h4 + h5 + h6 + h7 + h8;

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

function getRating(points: number): number {
  return 18 - (17 * points) / 5;
}
