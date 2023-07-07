# OneDrive-Vercel-Index（一键部署版）

[English](./README.md) | 简体中文

本项目fork自[spencerwooo/onedrive-vercel-index](https://github.com/spencerwooo/onedrive-vercel-index)，基于原作者于2023年6月24日归档的版本并进行了一些小修改，让您可以一键部署在完全免费托管的Vercel，在一个网页中展示、分享、预览和下载您的OneDrive文件。具体部署方法请参考下面的说明。

> 本版本只测试通过E5开发者帐户，其他类型的OneDrive帐户有待进一步测试。

## 在线预览

原作者提供的[在线预览](https://drive.swo.moe) | 本一键部署版的[在线预览](https://odi-demo.freeloop.one)

![demo](./public/demo.png)

## 修改说明

- 本版本主要把原本需要在`config/`目录下的`api.config.js`和`site.config.js`这两个配置文件中设置的一些参数搬到了Vercel的环境变量中进行设置，如此便无须——先fork原仓库——然后手动修改配置文件——再部署，而是可以直接点击本文档中的一键部署按钮，在部署过程中输入环境变量的值，然后完成部署。

- 再就是本版本设定了当完成OAuth认证后，自动关闭OAuth认证通道，以防有心人通过OAuth认证的网址链接就轻易地获取到用户的配置信息。

**在环境变量中设置的配置参数**

**必要参数**
| 名称 | 描述 | 原路径 | 说明 |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_TITLE` | 展示页面的标题 | `config/site.config.js` | 例如：尼加拉瓜首富的OneDrive |
| `NEXT_PUBLIC_USER_PRINCIPLE_NAME` | 您的OneDrive帐户 | `config/site.config.js` | **字母大小写必须一致** ｜
| `NEXT_PUBLIC_BASE_DIRECTORY` | 您要分享的OneDrive目录 | `config/site.config.js` | （格式为`/目录名`），根目录则填写`/` |
| `NEXT_PUBLIC_CLIENT_ID` | 您在微软Azure注册的应用程序客户端ID | `config/api.config.js` | 原作者提供的已过期，建议自己注册一个，有效期可以设到两年（反正也要设置帐户的API权限，顺道咯）。获取方式参照原作者编写的[使用文档](https://ovi.swo.moe/zh/docs/advanced#使用你自己的-client-id-与-secret) |
| `NEXT_PUBLIC_CLIENT_SECRET` | 您在微软Azure注册的应用程序客户端密钥 | `config/api.config.js` | 获取方式同上，特别注意这个**需要对原密钥进行AES加密**（可在原作者编写的[使用文档](https://ovi.swo.moe/zh/docs/advanced#修改-apiconfigjs)中进行） |

*可选参数*
| 名称 | 描述 | 原路径 | 说明 |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_PROTECTED_ROUTES` | 需要密码访问的文件夹 | `config/site.config.js` | 格式：`/route1,/route2`， 多个路径使用`,`间隔 |
| `NEXT_PUBLIC_EMAIL` | 您的联系用Email | `config/site.config.js` | example@example.com |
| `KV_PREFIX` | 用于键值对存储的前缀 | `config/site.config.js` | 如果您想要使用同一个`Redis`数据库部署多个OneDrive-Index，那么您就可以在部署时设置这个环境变量，例如第一个Index的`KV_PREFIX`可以设置为`index1`，第二个Index的`KV_PREFIX`可以设置为`index2`，那么它们在Vercel部署时就不会有键值冲突了 |

## 部署方法

### 前期准备

1. **设置OneDrive帐户的API权限：**

 本项目是通过调用OneDrive的API来获取文件列表以及下载链接的，所以设置OneDrive帐户的API权限是必须的，获取方法请参考原作者编写的[使用文档](https://ovi.swo.moe/zh/docs/advanced#修改-api-权限)。
 
 **需要设置的API权限为以下三个：`user.read`、`files.read.all`、`offline_access`。**

2. **准备好在Vercel部署时填写的五个必要环境参数：**

### 部署到Vercel

**当您做好准备工作，就可以点击下面的按钮进行部署了：**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/clone?repository-url=https%3A%2F%2Fgithub.com%2FiRedScarf%2Fonedrive-vercel-index&env=NEXT_PUBLIC_SITE_TITLE,NEXT_PUBLIC_USER_PRINCIPAL_NAME,NEXT_PUBLIC_BASE_DIRECTORY,NEXT_PUBLIC_CLIENT_ID,NEXT_PUBLIC_CLIENT_SECRET)

- 初次部署成功后，部署的页面上去是404的，因为我们还需要连接到Redis数据库。
 
- `REDIS_URL`：如果您和我一样第一次接触这个Redis数据库，那么强烈推荐您使用免费且与Vercel深度合作的Upstash，详细参考[Vercel Integration](https://docs.upstash.com/redis/howto/vercelintegration)，按说明在Vercel的[Upstash集成](https://vercel.com/integrations/upstash)中设置好（简单说就是在Upstash的`Redis`选项卡中新建一个数据库，再在`Vercel Integrations`中新建集成，把刚部署的OneDrive-Index项目与Redis数据库进行关联），它会自动填入项目部署后的环境变量中。
 
- `REDIS_URL`设置成功后，再重新部署一次项目。

**部署成功后，当您第一次访问您的`onedrive-vercel-index`页面时，会引导你进行OAuth认证（相当简单），详情请参考原作者编写的[说明文档](https://ovi.swo.moe/zh/docs/getting-started#进行认证)。**

## 说明文档

**更多玩法请查阅原作者编写的[使用文档](https://ovi.swo.moe/zh/docs/getting-started)**

## 安全风险和一些问题

- 因为Next.js的设计决策，以`NEXT_PUBLIC_`开头的环境变量不仅在服务器端可用，而且在客户端（浏览器）也可用。这意味着任何以`NEXT_PUBLIC_`开头的环境变量都会被包含在构建的JavaScript文件中，并会被发送到用户的浏览器。因此，任何访问你的网站的人都可以通过查看网站的源代码或网络请求来查看这些环境变量的值。

- 最开始在把`config/api.config.js`中的`clientId`和`obfuscatedClientSecret`放在环境变量中设置时，有试过使用不以`NEXT_PUBLIC_`开头的环境变量键名，但会在OAuth认证时，出现各种各样的问题而无法完成OAuth认证。为了顺利部署，只好先使用以`NEXT_PUBLIC_`开头的环境变量键名了。考虑到`clientId`和`ClientSecret`在没有OneDrive帐户的登录密码时，也不会有太大问题，并且也设定了当完成OAuth认证后无法再访问OAuth认证页面轻易获取这些敏感信息，就暂时这样解决了。

## License

[MIT License](LICENSE)

© 2021-2023 [spencer woo](https://spencerwoo.com)

© 2023 [iRedScarf](https://github.com/iRedScarf)

<div align="center">
    Made by <a href="https://spencerwoo.com">spencer woo</a> | Modified by <a href="https://github.com/iRedScarf">iRedScarf
</div>
