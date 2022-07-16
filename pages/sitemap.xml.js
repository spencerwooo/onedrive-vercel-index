import React from "react";
import * as fs from "fs";

const Sitemap = () => {
  return null;
};

export const getServerSideProps = async ({ res }) => {

  const BASE_URL = 'https://testing-mpfqn30cb-rockstarind.vercel.app/'; //This is where you will define your base url. You can also use the default dev url http://localhost:3000

  const staticPaths = fs
    .readdirSync("pages")
    .filter((staticPage) => {
      return ![
        "sitemap.xml.js",
        "404.js",
        "_app.js",
        "_document.js",
        "api"
      ].includes(staticPage);
    })
  .map((staticPagePath) => {
    return '${BASE_URL}/${staticPagePath.replace('.js', '')}';
  });

  const blogs = await getAllBlogPosts() // your custom API call

  //   An example of what an individual blog post object will look like:
  //   blog = {
  //     id: 2123,
  //     title: "My amazing blog post",
  //     slug: "amazing-post"
  //   }

  const dynamicPaths = blogs.map( singleBlog => {

    return '${BASE_URL}/blog/${singleBlog.slug}'

  })

  const allPaths = [...staticPaths, ...dynamicPaths];

  const sitemap = '<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      // This is where we would be putting in our URLs
      ${allPaths
        .map((url) => {
          return '
            <url>
              <loc>${url}</loc>
            </url>
          ';
        })
      .join("")}
    </urlset>
  ';

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default Sitemap;
