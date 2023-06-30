# OneDrive-Vercel-Index (One-Click Deploy Version)

English | [中文简体](./README.zh-CN.md)

This project is a fork from [spencerwooo/onedrive-vercel-index](https://github.com/spencerwooo/onedrive-vercel-index), based on the archived version from the original author dated June 24, 2023. It includes some minor modifications that allow you to deploy it on Vercel for free, showcasing, sharing, previewing, and downloading your OneDrive files on a webpage. For specific deployment methods, please refer to the instructions below.

> This version has only been tested with an E5 Developer account. Other types of OneDrive accounts need further testing.

## Demo

The [Demo](https://drive.swo.moe) provided by the original author | The [Demo](https://odi-demo.freeloop.one) of this One-Click Deployment version.

![demo](./public/demo.png)

## Getting Started

### Preparations

1. **Setting up the API permissions for your OneDrive account:**

  This project retrieves the file list and download links by calling OneDrive's API, so setting up the API permissions for your OneDrive account is essential. Please refer to the [Docs](https://ovi.swo.moe/docs/advanced#modify-api-permissions) written by the original author for retrieval methods.

  The three API permissions that need to be set up are: `user.read`, `files.read.all`, `offline_access`.

2. **Prepare the five environmental parameters to be filled in during deployment on Vercel:**

| Name | Description | Default | Note |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_TITLE` | Title of the displayed page | `null` | e.g., OneDrive of the Richest Man in Nicaragua |
| `NEXT_PUBLIC_USER_PRINCIPLE_NAME` | Your OneDrive account | `null` | **Case-sensitive** |
| `NEXT_PUBLIC_BASE_DIRECTORY` | The OneDrive directory you want to share | `null` | Format is `/directory-name`, for root directory, fill in `/` |
| `NEXT_PUBLIC_CLIENT_ID` | Client ID of the app you registered in Microsoft Azure | `null` | The one provided by the original author has expired, it's recommended to register your own, which can be valid for up to two years. Retrieval methods are the same as in the [Docs](https://ovi.swo.moe/docs/advanced#using-your-own-clientid-and-clientsecret) written by the original author |
| `NEXT_PUBLIC_CLIENT_SECRET` | Client Secret of the app you registered in Microsoft Azure | `null` | Retrieval methods are the same as above, note that you need to **AES encrypt the original secret** (can be done as described in the [Docs](https://ovi.swo.moe/docs/advanced#modify-configs-in-apiconfigjs)) |

### Deploying to Vercel

**Once you're prepared, you can click the button below to deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/clone?repository-url=https%3A%2F%2Fgithub.com%2FiRedScarf%2Fonedrive-vercel-index&env=NEXT_PUBLIC_SITE_TITLE,NEXT_PUBLIC_USER_PRINCIPLE_NAME,NEXT_PUBLIC_BASE_DIRECTORY,NEXT_PUBLIC_CLIENT_ID,NEXT_PUBLIC_CLIENT_SECRET)

- After the initial successful deployment, the deployed page will return a 404 error because we still need to connect to the Redis database.

- `REDIS_URL`:If you are encountering Redis database for the first time like me, I strongly recommend using Upstash, which is free and deeply integrated with Vercel. For details, refer to [Vercel Integration](https://docs.upstash.com/redis/howto/vercelintegration). Follow the instructions to set it up in Vercel's [Upstash Integration](https://vercel.com/integrations/upstash), it will automatically fill in the environment variables after project deployment.

- After `REDIS_URL` is successfully set, redeploy the project again.

**After successful deployment, when you visit your `onedrive-vercel-index` page for the first time, it will guide you to perform OAuth authentication (quite simple). For details, please refer to the [Instructions](https://ovi.swo.moe/zh/docs/getting-started#authentication) written by the original author.**

## Documentation

**For more usage methods, please refer to the [Docs](https://ovi.swo.moe/docs/getting-started) written by the original author.**

## Modifications

- Compared with the original version, this version mainly extracts the steps of modifying `clientId` and `obfuscatedClientSecret` in `config/api.config.js`, as well as modifying `userPrincipalName`, `title`, and `baseDirectory` in `config/site.config.js`, and now sets them as environmental variables during Vercel deployment.

- The specific values of `clientId` and `obfuscatedClientSecret` are hidden on the page of the first step of OAuth authentication and only the first 6 and last 6 characters are displayed for verification.

- The mail field in config/site.config.js has been left blank, you can modify this yourself if you want to display your contact information on the page (the demo of this version shows an Email icon). Additionally, the word GitHub next to the GitHub icon has been removed (because the icons on the right side of the navigation bar felt a bit too crowded).

- Also added support for [Vercel Analytics](https://vercel.com/docs/concepts/analytics) to conveniently check the access situation of the shared page (needs to be enabled in the Analytics tab of the project after deployment).

## Security Risks

- The current version leaks the deployer's OneDrive account `USER_PRINCIPLE_NAME` in the source code of the web page, and the deployer's `clientId` can be seen in the link used to obtain the authorization code in the second step of OAuth authentication. `obfuscatedClientSecret` can be seen in the source code of the first step of OAuth authentication. These problems also exist in the archived version of the original author.

- Due to the design decision of Next.js, environment variables starting with `NEXT_PUBLIC_` are available not only on the server side but also on the client side (browser). This means that any environment variables starting with `NEXT_PUBLIC_` will be included in the built JavaScript files and will be sent to the user's browser. Therefore, anyone who visits your website can view the values of these environment variables by examining the source code of the website or network requests. It's clear that one should avoid storing sensitive information, such as API keys or database passwords, in environment variables starting with `NEXT_PUBLIC_`. This information should only be used in server-side code, and should be stored in environment variables without the `NEXT_PUBLIC_` prefix.

- At the beginning, when setting some parameters in `config/api.config.js` and `config/site.config.js` in the environment variables, I tried to use environment variable key names that do not start with `NEXT_PUBLIC_`. However, in the first step of OAuth authentication, it couldn't get the values of `clientId` and `obfuscatedClientSecret`, and couldn't pass the authentication in the third step of OAuth authentication because it couldn't get `USER_PRINCIPLE_NAME`. Including `SITE_TITLE` and `BASE_DIRECTORY` are not set as environment variable key values. In order to deploy smoothly, I had to temporarily use environment variable key names that start with `NEXT_PUBLIC_`.

## Todo List

- Transition the `protectedRoutes` settings from `config/site.config.js` to environment variables.

- Put the password in the environment variables instead of the `.password` file.

- Deepen the study of the original version of the code and strive to implement the function with environment variable key names that do not start with `NEXT_PUBLIC_`, to improve security.

- Close the OAuth authentication pathway after completing the OAuth authentication, or optimize the OAuth authentication process, and strive not to leak the values of `USER_PRINCIPLE_NAME`, `clientId`, and `obfuscatedClientSecret`.

- Redesign the LOGO. The contrast of the original LOGO is too low, and it is not consistent enough with the style of other icons and fonts on the page.

## License

[MIT License](LICENSE)

© 2021-2023 [spencer woo](https://spencerwoo.com)

© 2023 [iRedScarf](https://github.com/iRedScarf)

<div align="center">
    Made by <a href="https://spencerwoo.com">spencer woo</a> | Modified by <a href="https://github.com/iRedScarf">iRedScarf
</div>
