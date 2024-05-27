import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Functional-ts",
      logo: {
        src: "./src/assets/functional-ts-logo.png",
        alt: "Functional-ts Logo",
        replacesTitle: true,
      },
      social: {
        github: "https://github.com/thexpert507/functional-ts",
      },
      customCss: ["./src/styles/custom.css"],
      sidebar: [
        {
          label: "Guías",
          items: [
            { label: "Guía de instalación", link: "/guides/install/" },
            {
              label: "Guía de uso",
              link: "/guides/usage/",
            },
          ],
        },
        {
          label: "Referencias",
          autogenerate: { directory: "reference" },
        },
      ],
    }),
  ],
});
