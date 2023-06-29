# OneDrive-Vercel-Index（一键部署版）

[English](./README.md) | 简体中文

本项目fork自[spencerwooo/onedrive-vercel-index](https://github.com/spencerwooo/onedrive-vercel-index)，基于原作者于2023年6月24日归档的版本并进行了一些小修改，让您可以一键部署在完全免费托管的Vercel，在一个网页中展示、分享、预览和下载您的OneDrive文件。具体部署方法请参考下面的说明。

> 本版本只测试通过E5开发者帐户，其他类型的OneDrive帐户有待进一步测试。

## 在线预览

原作者提供的[在线预览](https://drive.swo.moe) | 本一键部署版的[在线预览](https://odi-demo.freeloop.one)

![demo](./public/demo.png)

## 部署方法

### 前期准备

1. **设置OneDrive帐户的API权限：**

 本项目是通过调用OneDrive的API来获取文件列表以及下载链接的，所以设置OneDrive帐户的API权限是必须的，获取方法请参考原作者编写的[使用文档](https://ovi.swo.moe/zh/docs/advanced#修改-api-权限)。
 
 需要设置的API权限为以下三个：`user.read`、`files.read.all`、`offline_access`。

2. **准备好在Vercel部署时填写的五个环境参数：**

| 名称 | 描述 | 默认 | 备注 |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_TITLE` | 展示页面的标题 | `null` | 例如：尼加拉瓜首富的OneDrive |
| `NEXT_PUBLIC_USER_PRINCIPLE_NAME` | 您的OneDrive帐户 | `null` | **字母大小写必须一致** ｜
| `NEXT_PUBLIC_BASE_DIRECTORY` | 您要分享的OneDrive目录 | `null` | （格式为`/目录名`），根目录则填写`/` |
| `NEXT_PUBLIC_CLIENT_ID` | 您在微软Azure注册的应用程序客户端ID | `null` | 原作者提供的已过期，建议自己注册一个，有效期可以设到两年（反正也要设置帐户的API权限，顺道咯）。获取方式参照原作者编写的[使用文档](https://ovi.swo.moe/zh/docs/advanced#使用你自己的-client-id-与-secret) |
| `NEXT_PUBLIC_CLIENT_SECRET` | 您在微软Azure注册的应用程序客户端密钥 | `null` | 获取方式同上，特别注意这个**需要对原密钥进行AES加密**（可在原作者编写的[使用文档](https://ovi.swo.moe/zh/docs/advanced#修改-apiconfigjs)中进行） |

### 部署到Vercel

**当您做好准备工作，就可以点击下面的按钮进行部署了：**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/clone?repository-url=https%3A%2F%2Fgithub.com%2FiRedScarf%2Fonedrive-vercel-index&env=NEXT_PUBLIC_SITE_TITLE,NEXT_PUBLIC_USER_PRINCIPLE_NAME,NEXT_PUBLIC_BASE_DIRECTORY,NEXT_PUBLIC_CLIENT_ID,NEXT_PUBLIC_CLIENT_SECRET)

- 初次部署成功后，部署的页面上去是404的，因为我们还需要连接到Redis数据库。
 
- `REDIS_URL`：如果您和我一样第一次接触这个Redis数据库，那么强烈推荐您使用免费且与Vercel深度合作的Upstash，详细参考[Vercel Integration](https://docs.upstash.com/redis/howto/vercelintegration)，按说明在Vercel的[Upstash集成](https://vercel.com/integrations/upstash)中设置好，它会自动填入项目部署后的环境变量中。
 
- `REDIS_URL`设置成功后，再重新部署一次项目。

**部署成功后，当您第一次访问您的`onedrive-vercel-index`页面时，会引导你进行OAuth认证（相当简单），详情请参考原作者编写的[说明文档](https://ovi.swo.moe/zh/docs/getting-started#进行认证)。**

## 说明文档

**更多玩法请查阅原作者编写的[使用文档](https://ovi.swo.moe/zh/docs/getting-started)**

## 修改说明

- 本版本对比原版主要是把需要先修改`config/api.config.js`中的`clientId`和`obfuscatedClientSecret`，以及修改`config/site.config.js`中的`userPrincipalName`、`title`和`baseDirectory`的步骤提取出来，放在Vercel部署时的环境变量设置中进行。

- 留空了`config/site.config.js`中的`mail`(如果想在页面中展示自己的联系方式，可自行修改)，以及去除了GitHub图标旁的`GitHub`字样（因为感觉导航栏右边的图标有点多有点挤了）。

- 另外就是加入了[Vercel Analytics](https://vercel.com/docs/concepts/analytics)的支持，方便查看分享的页面被访问情况（需要在部署后自行在项目的Analytics选项卡中开启）。

## 安全风险

- 当前版本会在网页的源代码中泄露部署者的OneDrive帐号`USER_PRINCIPLE_NAME`，亦可在OAuth认证第一步的网址中查看到部署者的`clientId`和`obfuscatedClientSecret`，这两个问题在原作者的归档版本同样存在。

- 因为Next.js的设计决策，以`NEXT_PUBLIC_`开头的环境变量不仅在服务器端可用，而且在客户端（浏览器）也可用。这意味着任何以`NEXT_PUBLIC_`开头的环境变量都会被包含在构建的JavaScript文件中，并会被发送到用户的浏览器。因此，任何访问你的网站的人都可以通过查看网站的源代码或网络请求来查看这些环境变量的值。应该避免在以`NEXT_PUBLIC_`开头的环境变量中存储敏感信息，如API密钥或数据库密码。这些信息应该只在服务器端代码中使用，并且应该使用不带`NEXT_PUBLIC_`前缀的环境变量来存储。

- 在最开始把`config/api.config.js`和`config/site.config.js`中的一些参数放在环境变量中设置时，有试过使用不以`NEXT_PUBLIC_`开头的环境变量键名，但会在OAuth认证的第一步时，无法获取到`clientId`和`obfuscatedClientSecret`的值，也会在OAuth认证第三步时无法获取`USER_PRINCIPLE_NAME`而不能通过认证，包括`SITE_TITLE`和`BASE_DIRECTORY`也都不是环境变量的键值设置。为了顺利部署，只好暂时把这些参数都使用以`NEXT_PUBLIC_`开头的环境变量键名了。
 
## 待办备忘

- 把`config/site.config.js`中的加密文件夹`protectedRoutes`参数放在环境变量中设置。
  
- 把密码放在环境变量而非`.password`文件。

- 深入研究原版本代码，争取不以`NEXT_PUBLIC_`开头的环境变量键名实现功能。

- 重新设计LOGO，原LOGO对比度太低，与页面中其他图标和字体风格不够一致。

## License

[MIT License](LICENSE)

© 2021-2023 [spencer woo](https://spencerwoo.com)

© 2023 [iRedScarf](https://github.com/iRedScarf)

<div align="center">
    Made by <a href="https://spencerwoo.com">spencer woo</a> | Modified by <a href="https://github.com/iRedScarf">iRedScarf
</div>
