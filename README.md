<div align="center">
  <img src="./public/header.png" alt="onedrive-vercel-index" />
  <h3><a href="https://drive.spencerwoo.com">onedrive-vercel-index</a></h3>
  <p><em>Yet another-another OneDrive index, powered by Vercel and Next.js</em></p>
  <img src="https://img.shields.io/badge/OneDrive-2C68C3?style=flat&logo=microsoft-onedrive&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Next.js-black?style=flat&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Vercel-black?style=flat&logo=Vercel&logoColor=white" alt="Vercel" />
  <a href="https://github.com/spencerwooo/onedrive-vercel-index/discussions"><img src="https://img.shields.io/github/discussions/spencerwooo/onedrive-vercel-index?color=CF2B5B&labelColor=black&logo=github" alt="GitHub Discussions" /></a>
</div>

---

<h5>This is <a href="https://github.com/spencerwooo/onedrive-cf-index">onedrive-cf-index</a>'s little brother, basically the same, but powered by Next.js and Vercel.</h5>

## Features

🚧 **_This is currently a work in progress._**

- [x] File preview (PDF, markdown, code, plain text, ...)
- [x] Image preview in gallery mode
- [x] Video and audio preview (mp4, mp3, ...)
- [x] Office documents preview (docx, pptx, xlsx, ...)
- [x] `README.md` preview rendering
- [x] File permalink copy and direct file download
- [x] Dark mode
- [x] Protected routes (password protection and authentication) through `.password` files
- [ ] Pagination for folders with more than 200 items

## Discussion

Please go to our [discussion forum](https://github.com/spencerwooo/onedrive-vercel-index/discussions) for general questions, **issues are for bug reports and bug reports only.**

## Demo

Available at: <https://drive.spencerwoo.com>.

![demo](./public/demo.png)

## Deployment

> Simplified version for now, will update for detailed documentations in due course.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https%3A%2F%2Fgithub.com%2Fspencerwooo%2Fonedrive-vercel-index&env=REFRESH_TOKEN,ACCESS_TOKEN,CLIENT_SECRET&envDescription=Required%20API%20tokens%20for%20this%20project.&project-name=onedrive-vercel-index&repo-name=onedrive-vercel-index&demo-title=onedrive-vercel-index&demo-description=Probably%20the%20best%20looking%20OneDrive%20Index%20around!%20Powered%20by%20Vercel%20and%20Next.js.&demo-url=http%3A%2F%2Fonedrive-vercel-index.vercel.app&demo-image=https%3A%2F%2Fraw.githubusercontent.com%2Fspencerwooo%2Fonedrive-vercel-index%2Fmain%2Fpublic%2Fdemo.png)

- Use the button above to deploy the project to Vercel. Vercel will automatically fork and clone the project to your GitHub account.
- Define environment variables inside Vercel: `REFRESH_TOKEN`, `ACCESS_TOKEN`, `CLIENT_SECRET`.
- Finally, change configuration file [`config/api.json`](config/api.json) and [`config/site.json`](config/site.json) according to your configs.

The authentication tokens and variables are the same as what you configured in the [`onedrive-cf-index`](https://github.com/spencerwooo/onedrive-cf-index) project. Detailed documentations can also be found there (for now). This project is at its early stages, for discussions *please, please, please* post to the [discussion forum](https://github.com/spencerwooo/onedrive-vercel-index/discussions).

## Protected routes

See: [Announcements - Password protected routes is now supported #66](https://github.com/spencerwooo/onedrive-vercel-index/discussions/66).

---

**onedrive-vercel-index** ©Spencer Woo. Released under the MIT License.

Authored and maintained by Spencer Woo.

> [@Portfolio](https://spencerwoo.com/) · [@Blog](https://blog.spencerwoo.com/) · [@GitHub](https://github.com/spencerwooo)
