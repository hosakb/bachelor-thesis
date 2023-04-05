import { CronJob } from "cron";
import {
  BusinessCentralUser,
  FinancialData,
  getBcUsers,
  getFinancialData,
  insertFinancialData,
} from "../models/business_central";
import { getStartupIds, Metrics, persistMetrics } from "../models/startup";
import { calculateMetrics } from "../calc/finance";
import { BusinessCentral } from "../api/business-central";

export const startJob = () => {
  new CronJob(
    "* * 5 * * *", // Scrapes data at 6 AM
    async function () {
      let bcUsers;
      console.info("Scraping Financial Data from Business Central");
      const startupIds: string[] = await getStartupIds();
      try {
        bcUsers = await fetchUsers(startupIds);
      } catch (error) {
        console.error(`Failed to fetch business central users due to: ${error}`)
      }

      if(bcUsers !== undefined) {
        for (const user of bcUsers) {
          try {
            await scrapeFinancialData(user);
          const financialData: FinancialData[] = await getFinancialData(
            user.startupId
          );
          console.info(`Scraped financial data for startup with id: ${user.startupId}.`)
          const metrics: Metrics = await calculateMetrics(financialData);
          console.info(`Calculated financial metrics for startup with id: ${user.startupId}.`)
          await persistMetrics(metrics, user.startupId);
          console.info(`Persisted financial metrics for startup with id: ${user.startupId}.`)
          } catch (error) {
            console.error(`Failed to scrape financial data for startup with id: ${user.startupId}.`)
          }
        }
      }
    },
    null,
    true,
    "Europe/Berlin"
  );
};

async function scrapeFinancialData(user: BusinessCentralUser) {
  const bc = new BusinessCentral(
    user.company,
    user.username,
    user.ntHashedPassword,
    user.lmHashedPassword
  );

  try {
    const balance = await bc.getBalance();
    console.info(`Successfully scraped balance for ${user.company}.`);
    const liabilities = await bc.getShortTermLiabilities();
    console.info(
      `Successfully scraped short term liabilities for ${user.company}.`
    );
    await insertFinancialData(
      Math.round((balance + Number.EPSILON) * 100) / 100,
      Math.round((liabilities + Number.EPSILON) * 100) / 100,
      user.startupId
    );
    console.info(`Successfully persisted financial data for ${user.company}.`);
  } catch (error) {
    console.error(error);
  }
}

async function fetchUsers(ids: string[]): Promise<BusinessCentralUser[]> {
  console.info(`Fetched ${ids.length} startups from database.`);
  const bcUsers = await getBcUsers(ids);
  console.info(
    `Fetched ${bcUsers.length} Business Central Users from database.`
  );

  return bcUsers;
}
