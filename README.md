<div align="center">
  <img src="./public/header.png" alt="onedrive-vercel-index" />
  <h3><a href="https://drive.spencerwoo.com">onedrive-vercel-index</a></h3>
  <p><em>OneDrive public directory listing, powered by Vercel and Next.js</em></p>
  <img src="https://img.shields.io/badge/OneDrive-2C68C3?style=flat&logo=microsoft-onedrive&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Next.js-black?style=flat&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Vercel-black?style=flat&logo=Vercel&logoColor=white" alt="Vercel" />
  <a href="https://github.com/spencerwooo/onedrive-vercel-index/discussions"><img src="https://img.shields.io/github/discussions/spencerwooo/onedrive-vercel-index?color=CF2B5B&labelColor=black&logo=github" alt="GitHub Discussions" /></a>
</div>

---

## Discussion

Please go to our [discussion forum](https://github.com/spencerwooo/onedrive-vercel-index/discussions) for general questions and FAQs, **issues are for bug reports and bug reports only.** Feature requests may or may not be ignored, as [I (@spencerwooo)](https://spencerwoo.com) am the only one maintaining the project, so **I only prioritise features that I use.**

*Of course, I accept sponsors and donations* :3

## Demo

Live demo at [Spencer's OneDrive](https://drive.spencerwoo.com).

![demo](./public/demo.png)

## Features

<table><tbody><tr><td><a href="https://drive.spencerwoo.com/Lecture%20and%20Coursework%20CS%20(BIT)/2019%20-%20%E5%A4%A7%E4%B8%89%E4%B8%8B%20-%20%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86%E4%B8%8E%E8%AE%BE%E8%AE%A1/n1570.pdf" target="_blank" rel="noopener noreferrer">File preview</a></td><td><a href="https://drive.spencerwoo.com/%F0%9F%8D%8A%20Weibo%20emotes/Source1/%E5%BE%AE%E5%8D%9A%E2%80%9C%E9%BB%84%E8%84%B8%E2%80%9D" target="_blank" rel="noopener noreferrer">Image preview</a></td><td><a href="https://drive.spencerwoo.com/%F0%9F%8D%A1%20Genshin%20PV/New%20version%20PV/TGA2021%E3%80%8A%E5%8E%9F%E7%A5%9E%E3%80%8B%E5%8F%82%E9%80%89%E8%A7%86%E9%A2%91.mp4" target="_blank" rel="noopener noreferrer">Video and audio</a></td></tr><tr><td>PDF, EPUB, markdown, code, plain text</td><td>Also in gallery mode</td><td>mp4, mp3, ..., play online or with IINA, PotPlayer...</td></tr><tr><td><a href="https://drive.spencerwoo.com/Lecture%20and%20Coursework%20CS%20(BIT)/2017%20-%20%E5%A4%A7%E4%BA%8C%E4%B8%8A%20-%20%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84/1%20%E7%BB%AA%E8%AE%BA.pptx" target="_blank" rel="noopener noreferrer">Office preview</a></td><td><a href="https://drive.spencerwoo.com/%F0%9F%A5%9F%20Some%20test%20files/Articles" target="_blank" rel="noopener noreferrer">README.md preview</a></td><td><a href="https://drive.spencerwoo.com/%F0%9F%A5%9F%20Some%20test%20files/Imagenette" target="_blank" rel="noopener noreferrer">Pagination</a></td></tr><tr><td>docx, pptx, xlsx, ...</td><td>Also renders code blocks, images with relative links, ...</td><td>For folders with 200 or more items</td></tr><tr><td><a href="https://drive.spencerwoo.com/%F0%9F%8C%9E%20Private%20folder" target="_blank" rel="noopener noreferrer">Protected folders</a></td><td><a href="https://drive.spencerwoo.com/%F0%9F%8D%8A%20Weibo%20emotes/Source2" target="_blank" rel="noopener noreferrer">Multi-file download</a></td><td>... and more!</td></tr><tr><td>Password protected routes and files, <a href="#password-protected-folders">details down here</a> ↓</td><td>Compress and download multiple files or folders, <a href="#multi-file-and-folder-download">details down here</a> ↓ </td><td>Permalink copy, direct raw-file serving, dark mode, customisations...</td></tr></tbody></table>

More importantly, it's pretty (●'◡'●)

## Deployment

> No time to write deployment documentation! Here are some quick hints, play around with caution! (I promise detailed docs are on the way.)

- Fork the project to your own account, as you will be maintaining your custom version of this project with your own configurations.
- Change configuration file [`config/api.json`](config/api.json) and [`config/site.json`](config/site.json) according to your configs.
- Define environment variables inside Vercel: `REFRESH_TOKEN`, `ACCESS_TOKEN`, `CLIENT_SECRET`.
- Deploy inside Vercel, profit.

The authentication tokens and variables are the same as what you configured in the [`onedrive-cf-index`](https://github.com/spencerwooo/onedrive-cf-index) project. Detailed documentations can also be found there (for now). This project is at its early stages, for discussions *please, please, please* post to the [discussion forum](https://github.com/spencerwooo/onedrive-vercel-index/discussions).

## These may interest you ...

### Password protected folders

You can now specify a `.password` under a folder, declare the directory's absolute path, to password-protect the route and all files inside.

- Declare protected route inside `config/site.json` under `protectedRoutes`, for instance:

  ```
  "protectedRoutes": [
    "/🌞 Private folder/u-need-a-password",
    "/🥟 Some test files/Protected route"
  ],
  ```

- Add `.password` file under the root protected folder, redeploy your project on Vercel. Profit.

However, there are some caveats:

- Function is not entirely reliable and may be largely vulnerable to all kinds of threats. DO NOT use for protecting sensitive information.
- Protected files cannot be shared through `?raw=true` url parameters.

[*Discussion #66.*](https://github.com/spencerwooo/onedrive-vercel-index/discussions/66)

### Multi-file and folder download

We use JSZip to download all files in-browser and compress them into file blobs, which are then downloaded to your device as a `zip` file. This is extremely useful if a series of small files are to be downloaded, but it could be time consuming if used for bulk-downloading a few large files.

Folders are traversed and recursively fetched into the compressed zip. Multiple files or folders can be selected and downloaded side-by-side.

*PR #177 and #169.*

### OneDrive as your website's image storage

Yes, it can be used as an image (or any kind of file) online storage, where the raw file link is exported and can be embedded into your blog or other websites. Images, videos, songs, PDFs..., you name it.

```markdown
[nyan cat](https://drive.spencerwoo.com/api?path=/%F0%9F%A5%9F%20Some%20test%20files/nyancat.gif&raw=true)
```

![nyan cat](https://drive.spencerwoo.com/api?path=/%F0%9F%A5%9F%20Some%20test%20files/nyancat.gif&raw=true)

### Server-*less*?

Yes! Completely free with no backend server what-so-ever.

---

**onedrive-vercel-index** ©Spencer Woo. Released under the MIT License.

Authored and maintained by Spencer Woo.

> [@Portfolio](https://spencerwoo.com/) · [@Blog](https://blog.spencerwoo.com/) · [@GitHub](https://github.com/spencerwooo)
