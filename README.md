# Bachelors Thesis: Development of a Business Intelligence Dashboard for Deep Tech Focused Venture Capitalists
This dashboard represents the artifact under development for my bachelor's thesis in Information Systems Management (Wirtschafsinformatik) at the University of Bamberg. In its core, it is a proof-of-concept for dashboard, designed to help venture capitalists and business angels to track the business development of deep-tech startups in their portfolio and to prove them with insights into the core technology, the founders, and the startup's composition.

The dashboard is designed to work with Microsoft Dynamics 365 Business Central. Financial metrics such as the burn-rate, the cash runway and the liquidity are calculated based on data scraped from a Business Central endpoint on a daily schedule. Non-financial information is provided manually by the founder during the onboarding or following a specific event (E.g., updating milestones achievement level).



## Features
The full list of features include:
- Level of milestone achievement (Timeline)
- Financial metrics (Burn rate, Cash Runway and Liquidity)
- Technology Readiness Level and Technology Readiness Level of Product
- Overview of Patents and the Patent filing process (including deadlines)
- Founder's track record and composition of founder's expertise in the startup
- Capitalization Table Upload and rendering
- Status of contacted investors
- Structural Rating
- Portfolio Overview
- VC Fund information

## User Groups
The dashboard has the following user groups:
| User Group   | Description                                                                                     |
|--------------|-------------------------------------------------------------------------------------------------|
| Founders     | Provide information about startup and themselves.                                               |
| VC/Incubator | Are presented with detailed insights into startups in their portfolio and some fund information |
| Stakeholder  | Same as VC/Incubator except for fund information information                                    |
| Admin        | Manages Users, Startups, and Funds                                                              |

## Getting Started
Please note that due to limited development time, the dashboard has only been tested and optimized for use on Windows 11 using Firefox as a browser. Appearance and behavior may vary on other systems. 

To get started: 
1. Clone the Repo or download and extract zip file. For example, via SSH:
```
git clone git@github.com:hosakb/bachelor-thesis.git
```

2. (Extract and) Open the folder bachelor-thesis. It should contain two other folders called `dashbaord` and `scraper`.

Note: Before progressing, make sure you have Node.js 14 and Node Package Manager Installed. For Windows, this can be done via Node Version Manager. 
Just head over to [this repo](https://github.com/coreybutler/nvm-windows/releases) to download the installer. More information on NVM and its 
installation and use can be found in [this post](https://tamalweb.com/which-nodejs-version).

Once Node.js 14 is installed, run the following command in both directories to install all the dependencies.
```
npm i
```

3. Both, the dashboard and scraper use environmental variables which have to be provided via .env file. For testing or examination purposes, feel free to use the `.env` 
file provided in the directory `bachelors-thesis`. Just copy the `.env` to the `dashboard` and `scraper` directory.  It contains credentials for the remote database and 
the Business Central instance used during development. 

The database already contains users, a fund, and startups for testing purposes (note: since I am using a free plan from a DB provider, there is only a single connection that has to be shared between all users. Please don't use the dashboard concurrently 
with this database connection). For demonstration, testing, and examination use of the scraper, the demo account `CRONUS AG` is used in Business Central. To test the scraper, with the 
provided credentials, please contact the Edmund Lutz GmbH & Co. KG for a VPN client and a connection to their Business Central instance. 

4. Both the scraper and the dashboard can be started by running:
```
npm run devStart
```

### Credentials
For testing and examination purposes the following credentials can be used to access the different user groups:
| User Group       | E-Mail                    | Password |
|------------------|---------------------------|----------|
| Founders/Startup | startup@dashboard.com     | 1234     |
| VC/Incubator     | fund@dashboard.com        | 1234     |
| Stakeholder      | stakeholder@dashboard.com | 1234     |
| Admin            | admin@dashboard.com       | 1234     |

